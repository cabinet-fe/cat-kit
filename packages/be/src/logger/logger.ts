import type { Transport } from './transports'
import { ConsoleTransport } from './transports'

/**
 * 日志格式类型
 */
export type LogFormat = 'text' | 'json'

/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 调试信息 */
  DEBUG = 'debug',
  /** 一般信息 */
  INFO = 'info',
  /** 警告信息 */
  WARN = 'warn',
  /** 错误信息 */
  ERROR = 'error'
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40
}

/**
 * 日志条目
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel
  /** 日志消息 */
  message: string
  /** 时间戳 */
  timestamp: string
  /** 日志器名称 */
  name?: string
  /** 附加元数据 */
  meta?: Record<string, unknown>
  /** 错误信息（如果有） */
  error?: {
    message: string
    stack?: string
  }
}

/**
 * 日志器选项
 */
export interface LoggerOptions {
  /** 日志器名称 */
  name?: string
  /** 最低日志级别，低于此级别的日志不会被输出 */
  level?: LogLevel
  /** 日志格式，'text' 为文本格式，'json' 为 JSON 格式 */
  format?: LogFormat
  /** 传输器列表，用于输出日志 */
  transports?: Transport[]
  /** 上下文信息，会附加到所有日志条目 */
  context?: Record<string, unknown>
  /** 自定义时间戳生成函数 */
  timestamp?: () => string
}

function shouldLog(currentLevel: LogLevel, targetLevel: LogLevel): boolean {
  return LEVEL_WEIGHT[targetLevel] >= LEVEL_WEIGHT[currentLevel]
}

function formatEntry(entry: LogEntry, format: LogFormat): string {
  if (format === 'json') {
    return JSON.stringify(entry)
  }

  const parts: string[] = [
    entry.timestamp,
    entry.level.toUpperCase().padEnd(5),
    entry.name ? `[${entry.name}]` : '',
    entry.message
  ].filter(Boolean)

  if (entry.meta && Object.keys(entry.meta).length) {
    parts.push(JSON.stringify(entry.meta))
  }

  if (entry.error) {
    parts.push(entry.error.stack ?? entry.error.message)
  }

  return parts.join(' ')
}

/**
 * 结构化日志记录器
 *
 * 支持多级别日志、多种输出格式、多个传输器和子日志器。
 *
 * @example
 * ```typescript
 * const logger = new Logger({
 *   name: 'app',
 *   level: LogLevel.INFO,
 *   format: 'json',
 *   transports: [
 *     new ConsoleTransport(),
 *     new FileTransport({ path: './logs/app.log' })
 *   ]
 * })
 *
 * await logger.info('Server started', { port: 3000 })
 * await logger.error('Failed to connect', error)
 *
 * // 创建子日志器
 * const dbLogger = logger.child({ name: 'db' })
 * ```
 */
export class Logger {
  private readonly level: LogLevel

  private readonly format: LogFormat

  private readonly timestamp: () => string

  private readonly transports: Transport[]

  private readonly name?: string

  private readonly context?: Record<string, unknown>

  /**
   * 创建日志器实例
   * @param options - 日志器选项
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.format = options.format ?? 'text'
    this.timestamp = options.timestamp ?? (() => new Date().toISOString())
    this.transports = options.transports ?? [new ConsoleTransport()]
    this.name = options.name
    this.context = options.context
  }

  /**
   * 创建子日志器
   *
   * 子日志器会继承父日志器的配置，可以覆盖部分选项。
   *
   * @param options - 子日志器选项，会与父日志器合并
   * @returns 新的日志器实例
   */
  child(options: Partial<LoggerOptions>): Logger {
    return new Logger({
      ...options,
      level: options.level ?? this.level,
      format: options.format ?? this.format,
      transports: options.transports ?? this.transports,
      timestamp: options.timestamp ?? this.timestamp,
      context: {
        ...this.context,
        ...options.context
      },
      name: options.name ?? this.name
    })
  }

  private buildEntry(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const mergedMeta =
      meta || this.context
        ? {
            ...this.context,
            ...meta
          }
        : undefined

    return {
      level,
      message,
      timestamp: this.timestamp(),
      name: this.name,
      meta: mergedMeta,
      error: error
        ? {
            message: error.message,
            stack: error.stack
          }
        : undefined
    }
  }

  private async logInternal(entry: LogEntry): Promise<void> {
    const formatted = formatEntry(entry, this.format)

    await Promise.all(
      this.transports
        .filter(transport => shouldLog(transport.level ?? this.level, entry.level))
        .map(transport => transport.write(entry, formatted, this.format))
    )
  }

  /**
   * 记录日志
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @param meta - 附加元数据
   * @param error - 错误对象（如果有）
   */
  async log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error
  ): Promise<void> {
    if (!shouldLog(this.level, level)) return
    const entry = this.buildEntry(level, message, meta, error)
    await this.logInternal(entry)
  }

  /**
   * 记录 DEBUG 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  debug(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.DEBUG, message, meta)
  }

  /**
   * 记录 INFO 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  info(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.INFO, message, meta)
  }

  /**
   * 记录 WARN 级别日志
   * @param message - 日志消息
   * @param meta - 附加元数据
   */
  warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.WARN, message, meta)
  }

  /**
   * 记录 ERROR 级别日志
   *
   * @param message - 日志消息
   * @param errorOrMeta - 错误对象或元数据
   * @param meta - 附加元数据（当第一个参数是错误对象时使用）
   */
  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    meta?: Record<string, unknown>
  ): Promise<void> {
    if (errorOrMeta instanceof Error) {
      return this.log(LogLevel.ERROR, message, meta, errorOrMeta)
    }
    return this.log(LogLevel.ERROR, message, errorOrMeta ?? meta)
  }
}

