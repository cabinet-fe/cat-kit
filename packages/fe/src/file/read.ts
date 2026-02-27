/**
 * 分块读取文件内容
 * @param file 要读取的文件或Blob对象
 * @param config 读取配置选项
 * @returns Promise<void> 读取完成的Promise
 */
export async function readFile(
  file: Blob | File,
  config?: {
    /** 开始读取的文件偏移量 */
    offset?: number
    /** 每次读取的文件大小, 默认10MB */
    chunkSize?: number
    /**
     * 每次读取的文件块回调函数
     * @param chunk 当前读取的文件块数据
     * @param chunkIndex 当前块的索引
     */
    onChunk?: (chunk: Uint8Array, chunkIndex: number) => void
  }
): Promise<void> {
  return new Promise((rs, rj) => {
    // 创建文件读取器
    const reader = new FileReader()
    // 解构配置参数，设置默认值
    const { chunkSize = 10 * 1024 * 1024, offset = 0, onChunk } = config ?? {}

    // 当前读取的块索引
    let startIndex = 0

    /**
     * 读取下一个文件块
     */
    function readChunk() {
      // 计算当前块的起始位置
      const start = offset + startIndex * chunkSize
      // 计算当前块的结束位置
      const end = start + chunkSize

      // 检查是否还有数据需要读取
      if (start < file.size) {
        // 读取指定范围的文件数据
        return reader.readAsArrayBuffer(file.slice(start, end))
      }

      // 所有数据读取完成，解析Promise
      rs()
    }

    // 文件读取成功的回调
    reader.onload = (e) => {
      // 获取读取的ArrayBuffer数据
      const arrayBuffer = e.target?.result as ArrayBuffer
      // 转换为Uint8Array格式
      const uint8Array = new Uint8Array(arrayBuffer)
      // 调用用户提供的块处理回调函数
      onChunk?.(uint8Array, startIndex++)
      // 继续读取下一个块
      readChunk()
    }

    // 文件读取失败的回调
    reader.onerror = () => {
      rj('读取失败')
    }

    // 开始读取第一个块
    readChunk()
  })
}
