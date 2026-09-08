---
title: "@cat-kit/be 日志 API（Logger Transport）"
description: "@cat-kit/be 日志模块 API 参考：Logger 四级结构化日志器，text/json 格式，ConsoleTransport 彩色控制台输出，FileTransport 文件写入与按大小轮转，自定义 Transport 接口。"
aliases: [日志 API, logger API, 结构化日志, 日志轮转]
keywords: [Logger, LoggerOptions, LogLevel, LogFormat, LogEntry, TextFormatConfig, TextFormatVars, Transport, ConsoleTransport, ConsoleTransportOptions, FileTransport, FileTransportOptions, maxSize, useColors, 日志分级, 日志轮转, 日志格式化, 自定义传输器, 文件日志, 控制台日志]
---

# @cat-kit/be 日志 API（Logger Transport）

`@cat-kit/be` 导出日志器类 `Logger`、日志级别枚举 `LogLevel` 与两类传输器 `ConsoleTransport` / `FileTransport`。`Logger` 的全部日志方法返回 `Promise<void>`，为异步；日志条目先格式化为字符串再交给每个传输器。

## 快速上手

```ts
import { Logger, LogLevel } from '@cat-kit/be'

// 不传 transports 时默认使用 ConsoleTransport
const logger = new Logger({ name: 'app', level: LogLevel.INFO })

await logger.info('service started', { port: 3000 })
// => 2026-09-08 10:00:00 INFO  [app] service started {"port":3000}

await logger.debug('hidden') // 低于 INFO 级别，不输出
```

## API 签名

```ts
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

export type LogFormat = 'text' | 'json'

export interface LogEntry {
  level: LogLevel
  message: string
  /** 按 timestampFormat 生成的时间戳字符串 */
  timestamp: string
  /** Logger 的 name，未设置时缺省 */
  name?: string
  /** context 与本次 meta 的浅合并结果 */
  meta?: Record<string, unknown>
  /** 传入 Error 对象时记录 message 与 stack */
  error?: { message: string; stack?: string }
}

export interface TextFormatVars {
  timestamp: string
  /** 大写并右补空格到 5 位：'DEBUG'、'INFO '、'WARN '、'ERROR' */
  level: string
  /** 有 name 时为 '[name] '，否则空串 */
  name?: string
  message: string
  /** 有 meta 时为 ' ' + JSON.stringify(meta)，否则空串 */
  meta?: string
  /** 有 error 时为 ' ' + (stack 或 message)，否则空串 */
  error?: string
}

export type TextFormatter = (vars: TextFormatVars, entry: LogEntry) => string

/** 字符串模板用 {} 引用变量；默认模板 '{timestamp} {level} {name}{message}{meta}{error}' */
export type TextFormatConfig = string | TextFormatter

export interface LoggerOptions {
  /** 日志器名称，写入每条条目 */
  name?: string
  /** 最低输出级别，低于该级别不输出。默认 LogLevel.INFO */
  level?: LogLevel
  /** 输出格式。默认 'text' */
  format?: LogFormat
  /** 传输器列表。默认 [new ConsoleTransport()] */
  transports?: Transport[]
  /** 附加到每条日志 meta 的上下文，条目级 meta 覆盖同名字段 */
  context?: Record<string, unknown>
  /** 时间戳格式，Dater 格式 token。默认 'yyyy-MM-dd HH:mm:ss' */
  timestampFormat?: string
  /** 是否使用 UTC 时间。默认 false */
  utc?: boolean
  /** text 模板或格式化函数，仅 format: 'text' 时生效 */
  textFormat?: TextFormatConfig
}

export class Logger {
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
  /** 第二参可传 Error（记录堆栈）或 meta 对象；两者都传时 Error 在第二参、meta 在第三参 */
  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    meta?: Record<string, unknown>
  ): Promise<void>
}

export interface Transport {
  /** 该传输器的最低日志级别；不设时沿用 Logger 的 level */
  level?: LogLevel
  write(entry: LogEntry, formatted: string, format: LogFormat): void | Promise<void>
}

export interface ConsoleTransportOptions {
  /** 是否按级别着色。默认 true */
  useColors?: boolean
  level?: LogLevel
}

export class ConsoleTransport implements Transport {
  constructor(options?: ConsoleTransportOptions)
  /** debug→console.log 青、info→console.log 绿、warn→console.warn 黄、error→console.error 红 */
  write(entry: LogEntry, formatted: string, format: LogFormat): void
}

export interface FileTransportOptions {
  /** 日志文件或目录：文件直接写入；目录按日期生成 'yyyy-MM-dd.log'。必填 */
  path: string
  /** 单文件最大字节数，超出后轮转改名再开新文件 */
  maxSize?: number
  /** 每行末尾换行符。默认 '\n' */
  newline?: string
  level?: LogLevel
}

export class FileTransport implements Transport {
  constructor(options: FileTransportOptions)
  /** 内部按队列串行写入，保证追加顺序 */
  write(entry: LogEntry, formatted: string, format: LogFormat): Promise<void>
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `name` | `string` | 无 | 否 | 写入条目的 `name` 字段；text 模板中渲染为 `[name] ` 前缀 |
| `level`（Logger） | `LogLevel` | `LogLevel.INFO` | 否 | 权重 DEBUG=10、INFO=20、WARN=30、ERROR=40；低于当前级别不输出 |
| `format` | `LogFormat` | `'text'` | 否 | `'json'` 时写入 `JSON.stringify(entry)`；`textFormat` 失效 |
| `transports` | `Transport[]` | `[ConsoleTransport]` | 否 | 每条日志并行调用全部传输器的 `write` |
| `context` | `Record<string, unknown>` | 无 | 否 | 与条目 `meta` 浅合并，`meta` 同名字段胜出 |
| `timestampFormat` | `string` | `'yyyy-MM-dd HH:mm:ss'` | 否 | Dater 格式 token |
| `utc` | `boolean` | `false` | 否 | `true` 时时间戳按 UTC 生成 |
| `textFormat` | `string` 或 `TextFormatter` | 默认模板 | 否 | 模板中未知变量渲染为空串 |
| `useColors` | `boolean` | `true` | 否 | `false` 或 `format: 'json'` 时输出原始格式化串 |
| `level`（Transport） | `LogLevel` | 沿用 Logger 级别 | 否 | 逐传输器过滤：`shouldLog(transport.level ?? logger.level, entry.level)` |
| `path` | `string` | — | 是 | 已存在则按实际类型判定；不存在时无扩展名按目录、有扩展名按文件 |
| `maxSize` | `number` | 无 | 否 | 字节；当前文件已有内容加新行超过 `maxSize` 时轮转 |
| `newline` | `string` | `'\n'` | 否 | 格式化串末尾的换行统一替换为该值 |

## 方法与事件

`Logger` 实例方法均返回 `Promise<void>`，均为异步；日志方法内部不抛错，传输器抛出的错误会冒泡给调用方：

- `log(level, message, meta?, error?)`：入口方法，先按 `level` 过滤再分发
- `debug(message, meta?)` / `info(...)` / `warn(...)`：等价于 `log` 对应级别
- `error(message, errorOrMeta?, meta?)`：第二参传 `Error` 时记录 `error.message` 与 `error.stack`；传对象时视为 `meta`

`FileTransport` 行为细节：

- 串行写入：`write` 把每行挂到内部 Promise 队列尾部，多条日志按调用顺序追加
- 目录模式：`path` 为目录时文件名为 `yyyy-MM-dd.log`（当天日期）
- 轮转：目录模式轮转名为 `基础名_HH-mm-ss.扩展名`；文件模式轮转名为 `基础名.yyyy-MM-dd_HH-mm-ss.扩展名`

## 典型示例

### JSON 日志落盘并记录错误堆栈

```ts
import { FileTransport, Logger } from '@cat-kit/be'

const logger = new Logger({
  name: 'api',
  format: 'json',
  transports: [new FileTransport({ path: './logs/app.log', maxSize: 10 * 1024 * 1024 })]
})

try {
  throw new Error('connect ECONNREFUSED 127.0.0.1:5432')
} catch (err) {
  await logger.error('database unreachable', err as Error, { db: 'main' })
}

// logs/app.log 中追加一行：
// {"level":"error","message":"database unreachable","timestamp":"2026-09-08 10:00:00","name":"api",
//  "meta":{"db":"main"},"error":{"message":"connect ECONNREFUSED 127.0.0.1:5432","stack":"Error: connect ECONNREFUSED 127.0.0.1:5432"}}
```

### 自定义 text 模板与格式化函数

```ts
import { Logger, LogLevel } from '@cat-kit/be'

// 模板方式：{} 引用变量
const templateLogger = new Logger({
  level: LogLevel.WARN,
  format: 'text',
  textFormat: '[{timestamp}] {level} {message}'
})
await templateLogger.warn('disk almost full')
// => [2026-09-08 10:00:00] WARN  disk almost full

// 函数方式：拿到 vars 与原始 entry 自行拼接
const fnLogger = new Logger({
  format: 'text',
  textFormat: (vars, entry) =>
    `${vars.timestamp} ${entry.level.toUpperCase()} ${vars.message} (meta:${vars.meta ?? 'none'})`
})
await fnLogger.info('job done', { jobId: 7 })
// => 2026-09-08 10:00:00 INFO job done (meta: {"jobId":7})
```

### 自定义传输器与逐传输器级别

```ts
import { ConsoleTransport, Logger, LogLevel, type LogEntry, type LogFormat, type Transport } from '@cat-kit/be'

// 只收集 error 级别的内存传输器
class ErrorCollector implements Transport {
  readonly entries: LogEntry[] = []
  level = LogLevel.ERROR

  write(entry: LogEntry, _formatted: string, _format: LogFormat): void {
    this.entries.push(entry)
  }
}

const collector = new ErrorCollector()
const logger = new Logger({
  level: LogLevel.DEBUG, // logger 放行 DEBUG 及以上
  transports: [
    new ConsoleTransport({ useColors: true }),
    collector // 自身 level 为 ERROR，只收 error
  ]
})

await logger.debug('dbg') // 只进控制台
await logger.error('boom') // 控制台与 collector 都收到
console.log(collector.entries.length) // => 1
```

## 注意事项

> [!WARNING]
> - 本库 `Logger` 默认级别是 `LogLevel.INFO`，不是 `DEBUG`；不传 `level` 时 `logger.debug()` 不输出。
> - 本库 `Logger` 默认传输器是 `ConsoleTransport`；不传 `transports` 时日志只到控制台，不写文件。
> - 本库 `error()` 要记录堆栈必须传 `Error` 实例：`logger.error('msg', err)`；传字符串或普通对象只会当作 `meta`。
> - 本库 `FileTransport` 的 `path` 类型在首次写入时判定并缓存：路径不存在时「有扩展名按文件、无扩展名按目录」，之后不会重新判定。
> - 本库 `ConsoleTransport` 的配色固定为 debug 青、info 绿、warn 黄、error 红；要自定义配色需自己实现 `Transport`。
> - 本库 `format: 'json'` 时 `textFormat` 完全失效；两种格式互斥，不是叠加。

## 常见问题

### `logger.debug()` 没有输出

原因：`Logger` 默认级别为 `INFO`，`DEBUG` 权重更低被过滤。修复：显式把级别调到 `DEBUG`。

```ts
import { Logger, LogLevel } from '@cat-kit/be'

const logger = new Logger({ level: LogLevel.DEBUG })
await logger.debug('now visible') // => 2026-09-08 10:00:00 DEBUG now visible
```

### 日志文件没有生成在指定路径

原因：`FileTransport({ path })` 的 `path` 无扩展名时按目录处理，实际写入 `path/yyyy-MM-dd.log`。修复：明确给文件名加扩展名，或直接读日期文件。

```ts
import { FileTransport, Logger } from '@cat-kit/be'

// path 无扩展名：按目录处理，写入 ./logs/2026-09-08.log
const dirLogger = new Logger({ transports: [new FileTransport({ path: './logs' })] })
await dirLogger.info('goes to dated file')

// path 有扩展名：固定写该文件
const fileLogger = new Logger({ transports: [new FileTransport({ path: './logs/app.log' })] })
await fileLogger.info('goes to app.log')
```
