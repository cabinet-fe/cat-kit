import type { Transport } from './transports'
import { ConsoleTransport } from './transports'

export type LogFormat = 'text' | 'json'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  name?: string
  meta?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
}

export interface LoggerOptions {
  name?: string
  level?: LogLevel
  format?: LogFormat
  transports?: Transport[]
  context?: Record<string, unknown>
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

export class Logger {
  private readonly level: LogLevel

  private readonly format: LogFormat

  private readonly timestamp: () => string

  private readonly transports: Transport[]

  private readonly name?: string

  private readonly context?: Record<string, unknown>

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.format = options.format ?? 'text'
    this.timestamp = options.timestamp ?? (() => new Date().toISOString())
    this.transports = options.transports ?? [new ConsoleTransport()]
    this.name = options.name
    this.context = options.context
  }

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

  debug(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.DEBUG, message, meta)
  }

  info(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.INFO, message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    return this.log(LogLevel.WARN, message, meta)
  }

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

