import { appendFile, rename, stat } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'

import type { LogEntry, LogFormat, LogLevel } from './logger'
import { ensureDir } from '../fs/ensure-dir'

export interface Transport {
  level?: LogLevel
  write(
    entry: LogEntry,
    formatted: string,
    format: LogFormat
  ): void | Promise<void>
}

export interface ConsoleTransportOptions {
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

export class ConsoleTransport implements Transport {
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

export interface FileTransportOptions {
  filePath: string
  maxSize?: number
  newline?: string
}

export class FileTransport implements Transport {
  private queue: Promise<void> = Promise.resolve()

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

