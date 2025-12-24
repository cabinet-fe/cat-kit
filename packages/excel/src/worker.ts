import { readWorkbook } from './reader/xlsx-reader'
import { rebuildWorkbook, serializeWorkbook, type SerializedWorkbook } from './worker-codec'

/**
 * Excel Worker 消息类型
 */
export type ExcelWorkerMessage =
  | { type: 'read'; data: Blob | ArrayBuffer | Uint8Array; id: string }
  | { type: 'write'; workbook: SerializedWorkbook; id: string } // Workbook 序列化后传输

/**
 * Excel Worker 响应类型
 */
export type ExcelWorkerResponse =
  | { type: 'read_success'; id: string; workbook: SerializedWorkbook }
  | { type: 'write_success'; id: string; data: Blob }
  | { type: 'error'; id: string; error: string }

self.onmessage = async (e: MessageEvent<ExcelWorkerMessage>) => {
  const { type, id } = e.data

  try {
    if (type === 'read') {
      const workbook = await readWorkbook(e.data.data)
      self.postMessage({
        type: 'read_success',
        id,
        workbook: serializeWorkbook(workbook)
      })
    } else if (type === 'write') {
      const { writeWorkbook } = await import('./writer/xlsx-writer')
      const workbook = rebuildWorkbook(e.data.workbook)
      const blob = await writeWorkbook(workbook)

      self.postMessage({
        type: 'write_success',
        id,
        data: blob
      })
    }
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message || String(error)
    })
  }
}
