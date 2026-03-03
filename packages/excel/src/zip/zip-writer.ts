import { strToU8, zipSync } from 'fflate'
import { ExcelWriteError } from '../errors'
import { clamp } from '../utils/guards'

export interface ZipWriteOptions {
  compressionLevel?: number
}

export function writeZipEntries(
  entries: Map<string, string | Uint8Array>,
  options: ZipWriteOptions = {}
): Uint8Array {
  const level = clamp(Math.round(options.compressionLevel ?? 6), 0, 9) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
  const source: Record<string, Uint8Array> = {}
  for (const [path, value] of entries) {
    source[path] = typeof value === 'string' ? strToU8(value) : value
  }

  try {
    return zipSync(source, { level })
  } catch (error) {
    throw new ExcelWriteError(
      `Failed to build XLSX zip: ${error instanceof Error ? error.message : String(error)}`,
      'ZIP_WRITE_FAILED'
    )
  }
}
