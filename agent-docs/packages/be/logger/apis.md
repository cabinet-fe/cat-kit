---
title: "@cat-kit/be 日志 API"
description: "Logger、LogLevel、ConsoleTransport、FileTransport 签名与选项"
---

# 日志 API

日志模块全部类与接口的 TypeScript 签名，类型定义以 `packages/be/dist/logger/` 下的声明文件为准。

```ts
declare enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

declare class Logger {
  constructor(options?: LoggerOptions)
  log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error
  ): Promise<void>
  debug(message: string, meta?: Record<string, unknown>): Promise<void>
  info(message: string, meta?: Record<string, unknown>): Promise<void>
  warn(message: string, meta?: Record<string, unknown>): Promise<void>
  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    meta?: Record<string, unknown>
  ): Promise<void>
}

declare class ConsoleTransport implements Transport {
  constructor(options?: ConsoleTransportOptions)
  write(entry: LogEntry, formatted: string, format: LogFormat): void
}

declare class FileTransport implements Transport {
  constructor(options: FileTransportOptions)
  write(entry: LogEntry, formatted: string, format: LogFormat): Promise<void>
}
```

## 关键选项

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `LoggerOptions` | `name` | 日志器名称，写入每条日志 |
| `LoggerOptions` | `level` | 最低输出级别，默认 `DEBUG` |
| `LoggerOptions` | `format` | `'text' \| 'json'` |
| `LoggerOptions` | `transports` | 输出目标列表；缺省用控制台 |
| `LoggerOptions` | `context` | 附加到所有日志条目的上下文 |
| `LoggerOptions` | `timestampFormat` / `utc` | 时间戳格式（默认 `'yyyy-MM-dd HH:mm:ss'`）；是否用 UTC |
| `LoggerOptions` | `textFormat` | text 模板或格式化函数 |
| `ConsoleTransportOptions` | `useColors` / `level` | 颜色高亮（默认 `true`）；该 Transport 的最低级别 |
| `FileTransportOptions` | `path` | 文件或目录；目录模式下按日期命名日志文件 |
| `FileTransportOptions` | `maxSize` | 最大文件大小（字节），超限自动轮转或建新文件 |
| `FileTransportOptions` | `newline` / `level` | 换行符（默认 `'\n'`）；该 Transport 的最低级别 |
| `Transport` | `write` | 自定义传输器实现接口：`write(entry, formatted, format)` |

## 类型声明

签名与选项的权威定义：[logger.d.ts](../../../../packages/be/dist/logger/logger.d.ts)、[transports.d.ts](../../../../packages/be/dist/logger/transports.d.ts)。
