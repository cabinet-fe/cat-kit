import { appendFile, rename, stat } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import chalk from 'chalk'

import type { LogEntry, LogFormat, LogLevel } from './logger'
import { ensureDir } from '../fs/ensure-dir'
import { Dater } from '@cat-kit/core'

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
  /** 日志级别 */
  level?: LogLevel
}

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
  level?: LogLevel

  /**
   * 创建控制台传输器实例
   * @param options - 传输器选项
   */
  constructor(private readonly options: ConsoleTransportOptions = {}) {
    this.level = options.level
  }

  write(entry: LogEntry, formatted: string, format: LogFormat): void {
    const consoleMethod = CONSOLE_METHOD[entry.level]

    if (format === 'json' || this.options.useColors === false) {
      console[consoleMethod](formatted)
      return
    }

    // 使用 chalk 进行颜色高亮
    let coloredOutput: string
    switch (entry.level) {
      case 'debug':
        coloredOutput = chalk.cyan(formatted)
        break
      case 'info':
        coloredOutput = chalk.green(formatted)
        break
      case 'warn':
        coloredOutput = chalk.yellow(formatted)
        break
      case 'error':
        coloredOutput = chalk.red(formatted)
        break
      default:
        coloredOutput = formatted
    }
    console[consoleMethod](coloredOutput)
  }
}

/**
 * 文件传输器选项
 */
export interface FileTransportOptions {
  /**
   * 日志路径，可以是目录或文件
   * - 目录：日志文件按日期命名（如 2024-01-15.log）
   * - 文件：直接写入该文件
   */
  path: string
  /** 最大文件大小（字节），超过此大小会自动轮转或创建新文件 */
  maxSize?: number
  /** 换行符，默认 '\n' */
  newline?: string
  /** 日志级别 */
  level?: LogLevel
}

/**
 * 文件日志传输器
 *
 * 将日志写入文件，支持文件大小轮转和目录模式。
 *
 * @example
 * ```typescript
 * // 文件模式：超过大小时轮转
 * const transport = new FileTransport({
 *   path: './logs/app.log',
 *   maxSize: 10 * 1024 * 1024 // 10MB
 * })
 *
 * // 目录模式：按日期创建新文件
 * const transport = new FileTransport({
 *   path: './logs',
 *   maxSize: 10 * 1024 * 1024 // 10MB
 * })
 * ```
 */
export class FileTransport implements Transport {
  level?: LogLevel
  private queue: Promise<void> = Promise.resolve()
  private isDirectory: boolean | null = null

  /**
   * 创建文件传输器实例
   * @param options - 传输器选项
   */
  constructor(private readonly options: FileTransportOptions) {
    this.level = options.level
  }

  write(_: LogEntry, formatted: string, _format: LogFormat): Promise<void> {
    const line = formatted.endsWith('\n') ? formatted : `${formatted}\n`
    return (this.queue = this.queue.then(() => this.writeInternal(line)))
  }

  /**
   * 获取当前日志文件路径
   */
  private async getLogFilePath(): Promise<string> {
    // 首次调用时检测路径类型
    if (this.isDirectory === null) {
      try {
        const stats = await stat(this.options.path)
        this.isDirectory = stats.isDirectory()
      } catch (error) {
        // 路径不存在，根据是否有扩展名判断
        const ext = extname(this.options.path)
        this.isDirectory = !ext
      }
    }

    if (this.isDirectory) {
      // 目录模式：使用日期作为文件名
      const date = new Dater(new Date()).format('yyyy-MM-dd')
      return join(this.options.path, `${date}.log`)
    } else {
      // 文件模式
      return this.options.path
    }
  }

  private async writeInternal(line: string): Promise<void> {
    const newline = this.options.newline ?? '\n'
    const text = line.replace(/\n+$/, '') + newline
    const logPath = await this.getLogFilePath()

    await ensureDir(dirname(logPath))
    await this.handleSizeLimit(logPath, Buffer.byteLength(text))
    await appendFile(logPath, text, 'utf8')
  }

  /**
   * 处理文件大小限制
   */
  private async handleSizeLimit(logPath: string, nextSize: number): Promise<void> {
    if (!this.options.maxSize) return

    let currentSize = 0
    try {
      const stats = await stat(logPath)
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

    if (this.isDirectory) {
      // 目录模式：超过大小时重命名当前文件添加时间戳
      const ext = extname(logPath) || '.log'
      const base = basename(logPath, ext)
      const timestamp = new Dater(new Date()).format('HH-mm-ss')
      const newFile = join(dirname(logPath), `${base}_${timestamp}${ext}`)
      await rename(logPath, newFile)
    } else {
      // 文件模式：轮转
      const dir = dirname(logPath)
      const ext = extname(logPath) || '.log'
      const base = basename(logPath, ext)
      const timestamp = new Dater(new Date()).format('yyyy-MM-dd_HH-mm-ss')
      const rotated = join(dir, `${base}.${timestamp}${ext}`)
      await rename(logPath, rotated)
    }
  }
}
