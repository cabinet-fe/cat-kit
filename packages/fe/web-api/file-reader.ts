type FileReadingEvent = (e: ProgressEvent<FileReader>) => any

export type ReadType = 'text' | 'dataUrl' | 'arrayBuffer' | 'binaryString'

type ReadOptions = {
  onLoadStart?: FileReadingEvent
  onProgress?: FileReadingEvent
}

type Result<T> = {
  /** 中断文件读取 */
  abort: () => string
  /** 文件读取后的结果 */
  result: T
}

/**
 * 定义一个事件处理函数
 * @param fn 函数
 * @returns 参数函数本身
 */
const defineEventHandler = (fn: FileReadingEvent): FileReadingEvent => fn

/**
 * 读取文件
 * @param file 读取的文件
 * @param type 指定读取后显示返回哪种类型的数据
 * @returns
 */
export function readFile(
  file: Blob,
  type: 'text' | 'dataUrl' | 'binaryString',
  options?: ReadOptions
): Promise<Result<string>>
export function readFile(
  file: Blob,
  type: 'arrayBuffer',
  options?: ReadOptions
): Promise<Result<ArrayBuffer>>
export function readFile(file: Blob, type: ReadType, options?: ReadOptions) {
  return new Promise((rs, rj) => {
    const reader = new FileReader()

    const errorHandler = defineEventHandler(() => rj('读取失败'))

    const abortHandler = defineEventHandler(() => rj('读取中断'))

    const loadHandler = defineEventHandler(() => {
      rs({
        abort: () => reader.abort,
        result: reader.result
      })
    })

    const loadEndHandler = defineEventHandler(e => {
      if (options?.onLoadStart) {
        reader.removeEventListener('loadstart', options.onLoadStart)
      }
      reader.removeEventListener('error', errorHandler)
      reader.removeEventListener('abort', abortHandler)
      if (options?.onProgress) {
        reader.removeEventListener('progress', options.onProgress)
      }
      reader.removeEventListener('load', loadHandler)
      reader.removeEventListener('loadend', loadEndHandler)
    })

    // 文件开始读取时事件
    if (options?.onLoadStart) {
      reader.addEventListener('loadstart', options.onLoadStart)
    }
    // 文件读取失败时事件(找不到或不可读)
    reader.addEventListener('error', errorHandler)
    // 读取被终止时事件
    reader.addEventListener('abort', abortHandler)
    // 读取进度中事件
    if (options?.onProgress) {
      reader.addEventListener('progress', options.onProgress)
    }
    // 成功读取文件后事件
    reader.addEventListener('load', loadHandler)
    // 文件读取完成后(无论成功与否)事件
    reader.addEventListener('loadend', loadEndHandler)

    if (type === 'text') return reader.readAsText(file)

    if (type === 'dataUrl') return reader.readAsDataURL(file)

    if (type === 'arrayBuffer') return reader.readAsArrayBuffer(file)

    if (type === 'binaryString') return reader.readAsBinaryString(file)
  })
}
