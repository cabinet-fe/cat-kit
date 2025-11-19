/**
 * 基础 Excel 错误类
 */
export abstract class ExcelError extends Error {
  abstract readonly code: string

  public readonly context?: Record<string, unknown>

  constructor(message: string, context?: Record<string, unknown>) {
    super(message)
    this.context = context
    this.name = this.constructor.name

    // 保持堆栈跟踪 (Node.js V8 引擎特性)
    if (typeof (Error as any).captureStackTrace === 'function') {
      ;(Error as any).captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * 文件格式错误
 */
export class FileFormatError extends ExcelError {
  readonly code = 'FILE_FORMAT_ERROR'

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

/**
 * 解析错误
 */
export class ParseError extends ExcelError {
  readonly code = 'PARSE_ERROR'

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

/**
 * 流处理错误
 */
export class StreamError extends ExcelError {
  readonly code = 'STREAM_ERROR'

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

/**
 * 验证错误
 */
export class ValidationError extends ExcelError {
  readonly code = 'VALIDATION_ERROR'

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

/**
 * 内存错误
 */
export class MemoryError extends ExcelError {
  readonly code = 'MEMORY_ERROR'

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}
