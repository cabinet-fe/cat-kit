import { readWorkbook } from './reader/xlsx-reader'

/**
 * Excel Worker 消息类型
 */
export type ExcelWorkerMessage =
  | { type: 'read'; data: Blob | ArrayBuffer | Uint8Array; id: string }
  | { type: 'write'; workbook: any; id: string } // Workbook 序列化后传输

/**
 * Excel Worker 响应类型
 */
export type ExcelWorkerResponse =
  | { type: 'read_success'; id: string; workbook: any }
  | { type: 'write_success'; id: string; data: Blob }
  | { type: 'error'; id: string; error: string }

self.onmessage = async (e: MessageEvent<ExcelWorkerMessage>) => {
  const { type, id } = e.data

  try {
    if (type === 'read') {
      const workbook = await readWorkbook(e.data.data)
      // 由于 Workbook 包含方法，无法直接传输，需要序列化
      // 这里简化处理，只返回数据结构
      // 在实际应用中，可能需要一个 serialize/deserialize 方法
      self.postMessage({
        type: 'read_success',
        id,
        workbook: JSON.parse(JSON.stringify(workbook))
      })
    } else if (type === 'write') {
      // 重建 Workbook 对象（简化版，假设传入的是数据结构）
      // 注意：这里需要完善 Workbook 的反序列化逻辑
      // 暂时假设用户在 Worker 外部构建好 Workbook 数据结构传入
      // 或者 Worker 内部只负责压缩/解压

      // 由于 writeWorkbook 需要 Workbook 实例（包含方法），
      // 我们这里暂时无法完美支持直接传入纯数据对象。
      // 更好的方式是 Worker 仅负责 heavy lifting (zip/unzip)，
      // 但 fflate 已经是异步的了，所以 Worker 的主要价值在于
      // 避免大量数据处理（如 XML 解析/生成）阻塞主线程。

      // 鉴于 Workbook 类的复杂性，完全在 Worker 中重建实例比较困难。
      // 我们这里提供一个基础的 Worker 示例，主要用于演示架构。

      throw new Error('Worker write not fully implemented yet due to serialization complexity')
    }
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message || String(error)
    })
  }
}
