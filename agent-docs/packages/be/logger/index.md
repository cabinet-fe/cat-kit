---
title: "@cat-kit/be 日志"
description: "分级结构化日志器，支持 text/json 格式与控制台、文件多 Transport 输出"
---

# 日志

日志模块提供结构化分级日志：`Logger` 支持 `debug/info/warn/error` 四级、`text` / `json` 两种格式、多 Transport 输出（`ConsoleTransport` 控制台、`FileTransport` 文件，文件模式支持按大小轮转与按日期命名目录）。

```ts
import { FileTransport, Logger, LogLevel } from '@cat-kit/be'

const logger = new Logger({
  level: LogLevel.INFO,
  format: 'json',
  transports: [new FileTransport({ path: './logs/app.log' })]
})
await logger.info('service started')
```

详情见 [API](apis.md)。

## 约束

- `log` / `debug` / `info` / `warn` / `error` 均返回 `Promise<void>`
- 低于 `level` 设定级别的日志不输出；`level` 默认为 `DEBUG`
- `error()` 第一个参数后可直接传 `Error` 对象，会附带上错误信息与堆栈
- `textFormat` 支持模板字符串（如 `'{timestamp} [{level}] {message}'`）或自定义函数

## 类型声明

- [logger.d.ts](../../../../packages/be/dist/logger/logger.d.ts) —— `Logger`、`LogLevel`、`LoggerOptions`、`LogEntry`
- [transports.d.ts](../../../../packages/be/dist/logger/transports.d.ts) —— `Transport`、`ConsoleTransport`、`FileTransport`
