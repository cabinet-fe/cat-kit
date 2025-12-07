import { Dater } from '@cat-kit/core'
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
 * Text 格式化变量
 */
export interface TextFormatVars {
  /** 时间戳 */
  timestamp: string
  /** 日志级别 */
  level: string
  /** 日志器名称 */
  name?: string
  /** 日志消息 */
  message: string
  /** 附加元数据 JSON */
  meta?: string
  /** 错误信息 */
  error?: string
}

/**
 * Text 格式化函数
 */
export type TextFormatter = (vars: TextFormatVars, entry: LogEntry) => string

/**
 * Text 格式化配置
 * - 字符串：使用 {} 引用变量，如 '{timestamp} [{level}] {message}'
 * - 函数：回调函数，接收变量对象
 */
export type TextFormatConfig = string | TextFormatter

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
  /** 时间戳格式，默认 'yyyy-MM-dd HH:mm:ss' */
  timestampFormat?: string
  /** 是否使用 UTC 时间，默认 false */
  utc?: boolean
  /** Text 格式化配置（仅 format='text' 时生效） */
  textFormat?: TextFormatConfig
}

function shouldLog(currentLevel: LogLevel, targetLevel: LogLevel): boolean {
  return LEVEL_WEIGHT[targetLevel] >= LEVEL_WEIGHT[currentLevel]
}

/**
 * 默认 text 格式化模板
 */
const DEFAULT_TEXT_FORMAT = '{timestamp} {level} {name}{message}{meta}{error}'

/**
 * 格式化日志条目
 */
function formatEntry(
  entry: LogEntry,
  format: LogFormat,
  textFormatConfig?: TextFormatConfig
): string {
  if (format === 'json') {
    return JSON.stringify(entry)
  }

  // 构建格式化变量
  const vars: TextFormatVars = {
    timestamp: entry.timestamp,
    level: entry.level.toUpperCase().padEnd(5),
    name: entry.name ? `[${entry.name}] ` : '',
    message: entry.message,
    meta: entry.meta && Object.keys(entry.meta).length
      ? ` ${JSON.stringify(entry.meta)}`
      : '',
    error: entry.error
      ? ` ${entry.error.stack ?? entry.error.message}`
      : ''
  }

  // 如果是函数，直接调用
  if (typeof textFormatConfig === 'function') {
    return textFormatConfig(vars, entry)
  }

  // 字符串模板替换
  const template = textFormatConfig || DEFAULT_TEXT_FORMAT
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key as keyof TextFormatVars]
    return value ?? ''
  })
}

/**
 * 结构化日志记录器
 *
 * 支持多级别日志、多种输出格式、多个传输器。
 *
 * @example
 * ```typescript
 * const logger = new Logger({
 *   name: 'app',
 *   level: LogLevel.INFO,
 *   format: 'json',
 *   transports: [
 *     new ConsoleTransport(),
 *     new FileTransport({ path: './logs' })
 *   ]
 * })
 *
 * await logger.info('Server started', { port: 3000 })
 * await logger.error('Failed to connect', error)
 *
 * // 使用自定义 text 格式
 * const customLogger = new Logger({
 *   format: 'text',
 *   textFormat: '[{timestamp}] {level} - {message}'
 * })
 *
 * // 使用函数格式化
 * const fnLogger = new Logger({
 *   format: 'text',
 *   textFormat: (vars) => `${vars.timestamp} | ${vars.message}`
 * })
 * ```
 */
export class Logger {
  private readonly level: LogLevel
  private readonly format: LogFormat
  private readonly timestampFormat: string
  private readonly utc: boolean
  private readonly transports: Transport[]
  private readonly name?: string
  private readonly context?: Record<string, unknown>
  private readonly textFormat?: TextFormatConfig

  /**
   * 创建日志器实例
   * @param options - 日志器选项
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.format = options.format ?? 'text'
    this.timestampFormat = options.timestampFormat ?? 'yyyy-MM-dd HH:mm:ss'
    this.utc = options.utc ?? false
    this.transports = options.transports ?? [new ConsoleTransport()]
    this.name = options.name
    this.context = options.context
    this.textFormat = options.textFormat
  }

  /**
   * 生成时间戳
   */
  private getTimestamp(): string {
    return new Dater(new Date()).format(this.timestampFormat, { utc: this.utc })
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
      timestamp: this.getTimestamp(),
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
    const formatted = formatEntry(entry, this.format, this.textFormat)

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