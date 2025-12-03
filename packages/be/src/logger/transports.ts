import { appendFile, rename, stat } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'

import type { LogEntry, LogFormat, LogLevel } from './logger'
import { ensureDir } from '../fs/ensure-dir'

/**
 * 日志传输器接口
 *
 * 用于将日志输出到不同的目标（控制台、文件等）。
 */
export interface Transport {
  /** 最低日志级别，低于此级别的日志不会被输出 */
  level?: LogLevel
  /**
   * 写入日志条目
   *
   * @param entry - 日志条目
   * @param formatted - 格式化后的日志字符串
   * @param format - 日志格式
   */
  write(
    entry: LogEntry,
    formatted: string,
    format: LogFormat
  ): void | Promise<void>
}

/**
 * 控制台传输器选项
 */
export interface ConsoleTransportOptions {
  /** 是否使用颜色，默认 true */
  useColors?: boolean
}

const COLOR_MAP: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m' // red
}

const RESET_COLOR = '\x1b[0m'

const CONSOLE_METHOD: Record<LogLevel, 'log' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'log',
  warn: 'warn',
  error: 'error'
}

/**
 * 控制台日志传输器
 *
 * 将日志输出到控制台，支持颜色高亮。
 *
 * @example
 * ```typescript
 * const transport = new ConsoleTransport({ useColors: true })
 * const logger = new Logger({ transports: [transport] })
 * ```
 */
export class ConsoleTransport implements Transport {
  /**
   * 创建控制台传输器实例
   * @param options - 传输器选项
   */
  constructor(private readonly options: ConsoleTransportOptions = {}) {}

  write(entry: LogEntry, formatted: string, format: LogFormat): void {
    const consoleMethod = CONSOLE_METHOD[entry.level]

    if (format === 'json' || this.options.useColors === false) {
      console[consoleMethod](formatted)
      return
    }

    const color = COLOR_MAP[entry.level]
    console[consoleMethod](`${color}${formatted}${RESET_COLOR}`)
  }
}

/**
 * 文件传输器选项
 */
export interface FileTransportOptions {
  /** 日志文件路径 */
  filePath: string
  /** 最大文件大小（字节），超过此大小会自动轮转 */
  maxSize?: number
  /** 换行符，默认 '\n' */
  newline?: string
}

/**
 * 文件日志传输器
 *
 * 将日志写入文件，支持文件大小轮转。
 *
 * @example
 * ```typescript
 * const transport = new FileTransport({
 *   filePath: './logs/app.log',
 *   maxSize: 10 * 1024 * 1024 // 10MB
 * })
 * const logger = new Logger({ transports: [transport] })
 * ```
 */
export class FileTransport implements Transport {
  private queue: Promise<void> = Promise.resolve()

  /**
   * 创建文件传输器实例
   * @param options - 传输器选项
   */
  constructor(private readonly options: FileTransportOptions) {}

  write(_: LogEntry, formatted: string, _format: LogFormat): Promise<void> {
    const line = formatted.endsWith('\n') ? formatted : `${formatted}\n`
    return (this.queue = this.queue.then(() => this.writeInternal(line)))
  }

  private async writeInternal(line: string): Promise<void> {
    const newline = this.options.newline ?? '\n'
    const text = line.replace(/\n+$/, '') + newline
    await ensureDir(dirname(this.options.filePath))
    await this.rotateIfNeeded(Buffer.byteLength(text))
    await appendFile(this.options.filePath, text, 'utf8')
  }

  private async rotateIfNeeded(nextSize: number): Promise<void> {
    if (!this.options.maxSize) return

    let currentSize = 0
    try {
      const stats = await stat(this.options.filePath)
      currentSize = stats.size
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return
      }
      throw error
    }

    if (currentSize + nextSize <= this.options.maxSize) {
      return
    }

    const dir = dirname(this.options.filePath)
    const ext = extname(this.options.filePath) || '.log'
    const base = basename(this.options.filePath, ext)
    const rotated = join(dir, `${base}.${Date.now()}${ext}`)
    await rename(this.options.filePath, rotated)
  }
}

