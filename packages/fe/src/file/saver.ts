/**
 * 文件保存选项
 */
export interface SaveOptions {
  /** 文件名 */
  filename: string
  /** MIME 类型 */
  type?: string
}

/**
 * 流式保存选项
 */
export interface StreamSaveOptions extends SaveOptions {
  /**
   * 文件大小（可选，单位：字节）
   * 如果提供，浏览器可能会显示下载进度
   */
  size?: number

  /** 写入策略 */
  writableStrategy?: QueuingStrategy<Uint8Array>

  /**
   * 进度回调
   * @param bytesWritten 已写入的字节数
   */
  onProgress?: (bytesWritten: number) => void
}

/**
 * 通过 Blob 保存文件
 *
 * 适用于小到中等大小的文件（通常 < 500MB）
 * 使用传统的 Object URL + a[download] 方式
 *
 * @example
 * ```ts
 * const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
 * saveFromBlob(blob, 'hello.txt')
 * ```
 */
export function saveFromBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 延迟释放 URL，确保下载开始
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * 创建可写流用于流式保存文件
 *
 * 设计理念参考 StreamSaver.js，但使用内存缓冲方案（无需 Service Worker）
 *
 * 核心特性：
 * - 支持流式写入，边接收边缓存
 * - 仅接受 Uint8Array 类型的数据块
 * - 完成时自动触发浏览器下载
 * - 支持进度跟踪和中止操作
 *
 * 注意事项：
 * - 数据会暂存在内存中，完成后触发下载
 * - 对于超大文件（> 1GB），建议使用服务器端流式响应
 * - 用户离开页面会中断下载，建议监听 beforeunload/unload 事件
 *
 * @example
 * ```ts
 * // 手动写入
 * const fileStream = createWritableStream({
 *   filename: 'output.txt',
 *   size: 1024 // 可选
 * })
 * const writer = fileStream.getWriter()
 * const encoder = new TextEncoder()
 *
 * await writer.write(encoder.encode('Hello, '))
 * await writer.write(encoder.encode('World!'))
 * await writer.close()
 * ```
 *
 * @example
 * ```ts
 * // 从网络下载
 * const response = await fetch('/file.bin')
 * const fileStream = createWritableStream({
 *   filename: 'downloaded.bin',
 *   size: Number(response.headers.get('content-length')),
 *   onProgress: (bytes) => console.log(`已下载: ${bytes} 字节`)
 * })
 * await response.body.pipeTo(fileStream)
 * ```
 *
 * @example
 * ```ts
 * // 处理页面卸载（参考 StreamSaver.js 最佳实践）
 * const fileStream = createWritableStream({ filename: 'file.bin' })
 * const writer = fileStream.getWriter()
 *
 * window.onbeforeunload = evt => {
 *   evt.returnValue = '下载正在进行中，确定离开吗？'
 * }
 *
 * window.onunload = () => {
 *   writer.abort()
 * }
 * ```
 */
export function createWritableStream(
  options: StreamSaveOptions
): WritableStream<Uint8Array> {
  const {
    filename,
    size,
    type = 'application/octet-stream; charset=utf-8',
    writableStrategy,
    onProgress
  } = options

  // 存储数据块
  const chunks: Uint8Array[] = []
  let bytesWritten = 0
  let closed = false
  let aborted = false

  return new WritableStream<Uint8Array>(
    {
      write(chunk) {
        // 参考 StreamSaver.js：严格检查数据类型
        if (!(chunk instanceof Uint8Array)) {
          throw new TypeError('Can only write Uint8Arrays')
        }

        if (aborted) {
          throw new Error('Stream has been aborted')
        }

        if (closed) {
          throw new Error('Stream has been closed')
        }

        // 缓存数据块
        chunks.push(chunk)
        bytesWritten += chunk.byteLength

        // 触发进度回调
        if (onProgress) {
          onProgress(bytesWritten)
        }
      },

      close() {
        if (closed || aborted) {
          return
        }

        closed = true

        // 创建 Blob 并触发下载
        const blob = new Blob(chunks as BlobPart[], { type })
        saveFromBlob(blob, filename)

        // 清理内存
        chunks.length = 0

        // 最后一次进度回调（如果提供了 size）
        if (onProgress && size) {
          onProgress(bytesWritten)
        }
      },

      abort(reason) {
        if (aborted) {
          return
        }

        aborted = true

        // 参考 StreamSaver.js：清理资源
        chunks.length = 0

        console.warn('Stream save aborted:', reason || 'Unknown reason')
      }
    },
    writableStrategy
  )
}

/**
 * 从 ReadableStream 保存文件
 *
 * 便捷方法，将可读流通过管道传输到可写流
 *
 * @example
 * ```ts
 * const response = await fetch('/file.bin')
 * await saveFromStream(response.body, 'downloaded.bin', {
 *   onProgress: (bytes) => console.log(`${bytes} bytes`)
 * })
 * ```
 */
export async function saveFromStream(
  stream: ReadableStream<Uint8Array>,
  filename: string,
  options?: {
    size?: number
    type?: string
    onProgress?: (bytesWritten: number) => void
  }
): Promise<void> {
  const writable = createWritableStream({
    filename,
    size: options?.size,
    type: options?.type,
    onProgress: options?.onProgress
  })

  await stream.pipeTo(writable)
}

/**
 * 从 URL 下载并保存文件
 *
 * 便捷方法，自动获取文件大小并下载
 *
 * @example
 * ```ts
 * await saveFromURL('/api/file.bin', 'downloaded.bin', {
 *   onProgress: (bytes) => console.log(`已下载: ${bytes} 字节`),
 *   fetchOptions: {
 *     headers: { 'Authorization': 'Bearer token' }
 *   }
 * })
 * ```
 */
export async function saveFromURL(
  url: string,
  filename: string,
  options?: {
    type?: string
    onProgress?: (bytesWritten: number) => void
    fetchOptions?: RequestInit
  }
): Promise<void> {
  const response = await fetch(url, options?.fetchOptions)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`
    )
  }

  if (!response.body) {
    throw new Error('Response body is empty')
  }

  // 尝试获取文件大小
  const contentLength = response.headers.get('content-length')
  const size = contentLength ? Number(contentLength) : undefined

  await saveFromStream(response.body, filename, {
    size,
    type: options?.type,
    onProgress: options?.onProgress
  })
}
