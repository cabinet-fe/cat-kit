import { describe, expect, it } from 'vitest'
import { Workbook, readWorkbook, writeWorkbook, ExcelParseError } from '@cat-kit/excel/src'

function toChunkedStream(data: Uint8Array, chunkSize = 5): ReadableStream<Uint8Array> {
  let offset = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= data.length) {
        controller.close()
        return
      }
      const next = data.slice(offset, offset + chunkSize)
      offset += chunkSize
      controller.enqueue(next)
    }
  })
}

async function* toChunkedAsyncIterable(
  data: Uint8Array,
  chunkSize = 7
): AsyncIterable<Uint8Array> {
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    yield data.slice(offset, offset + chunkSize)
  }
}

describe('Workbook 输入通道兼容性', () => {
  it('应支持 Uint8Array / ArrayBuffer / Blob / ReadableStream / AsyncIterable', async () => {
    const workbook = new Workbook()
    workbook.addWorksheet('Sheet1').setCell('A1', 'hello')
    const bytes = writeWorkbook(workbook)

    const inputs = [
      bytes,
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      new Blob([bytes]),
      toChunkedStream(bytes),
      toChunkedAsyncIterable(bytes)
    ]

    for (const input of inputs) {
      const parsed = await readWorkbook(input)
      expect(parsed.getWorksheet(0)?.getCell('A1')?.value).toBe('hello')
    }
  })

  it('遇到不支持输入类型时应抛错', async () => {
    await expect(readWorkbook(123 as unknown as Uint8Array)).rejects.toThrowError(ExcelParseError)
    await expect(readWorkbook(123 as unknown as Uint8Array)).rejects.toThrow(
      'Unsupported workbook input type'
    )
  })
})
