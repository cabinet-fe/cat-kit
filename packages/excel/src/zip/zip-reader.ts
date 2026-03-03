import { unzipSync } from 'fflate'
import { ExcelParseError } from '../errors'
import type { WorkbookInput } from '../types'

const textDecoder = new TextDecoder()

export async function toUint8Array(input: WorkbookInput): Promise<Uint8Array> {
  if (input instanceof Uint8Array) return input
  if (input instanceof ArrayBuffer) return new Uint8Array(input)
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer())
  }
  if (isReadableStream(input)) {
    return readReadableStream(input)
  }
  if (isAsyncIterable(input)) {
    return readAsyncIterable(input)
  }
  throw new ExcelParseError('Unsupported workbook input type', 'UNSUPPORTED_INPUT')
}

export async function readZipEntries(
  input: WorkbookInput
): Promise<Map<string, Uint8Array>> {
  const bytes = await toUint8Array(input)
  try {
    const files = unzipSync(bytes)
    const entries = new Map<string, Uint8Array>()
    for (const [path, content] of Object.entries(files)) {
      entries.set(path, content)
    }
    return entries
  } catch (error) {
    throw new ExcelParseError(
      `Invalid XLSX zip payload: ${error instanceof Error ? error.message : String(error)}`,
      'INVALID_ZIP'
    )
  }
}

export function getZipTextEntry(
  entries: Map<string, Uint8Array>,
  path: string
): string
export function getZipTextEntry(
  entries: Map<string, Uint8Array>,
  path: string,
  required: false
): string | undefined
export function getZipTextEntry(
  entries: Map<string, Uint8Array>,
  path: string,
  required = true
): string | undefined {
  const value = entries.get(path)
  if (!value) {
    if (required) {
      throw new ExcelParseError(`Missing zip entry: ${path}`, 'MISSING_ENTRY', path)
    }
    return undefined
  }
  return textDecoder.decode(value)
}

function isReadableStream(input: unknown): input is ReadableStream<Uint8Array> {
  return (
    typeof ReadableStream !== 'undefined' &&
    input instanceof ReadableStream
  )
}

function isAsyncIterable(input: unknown): input is AsyncIterable<Uint8Array> {
  return (
    typeof input === 'object' &&
    input !== null &&
    Symbol.asyncIterator in input
  )
}

async function readReadableStream(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const result = await reader.read()
    if (result.done) break
    chunks.push(result.value)
    total += result.value.byteLength
  }
  return joinChunks(chunks, total)
}

async function readAsyncIterable(iterable: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of iterable) {
    chunks.push(chunk)
    total += chunk.byteLength
  }
  return joinChunks(chunks, total)
}

function joinChunks(chunks: Uint8Array[], total: number): Uint8Array {
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}
