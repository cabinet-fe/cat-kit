---
title: "@cat-kit/be 日志模块总览"
description: "@cat-kit/be 日志模块总览：Logger 四级结构化日志，text/json 双格式，ConsoleTransport 控制台与 FileTransport 文件（按大小轮转、按日期分文件）输出。"
aliases: [logger, 日志, 日志器, 结构化日志, winston, pino]
keywords: [Logger, LoggerOptions, LogLevel, LogFormat, LogEntry, Transport, ConsoleTransport, ConsoleTransportOptions, FileTransport, FileTransportOptions, textFormat, maxSize, 日志分级, 日志轮转, 日志落盘, 结构化日志, 控制台日志, 文件日志]
---

# @cat-kit/be 日志模块总览

日志模块从 `@cat-kit/be` 包根导出类 `Logger` 与两类传输器：`Logger` 产出 `debug` / `info` / `warn` / `error` 四级结构化日志，支持 `text` 与 `json` 两种格式；`ConsoleTransport` 输出到控制台并按级别配色，`FileTransport` 写入文件，支持按大小轮转与按日期分文件。自定义输出目标实现 `Transport` 接口即可接入。

## 安装

```bash
bun add @cat-kit/be
```

日志相关导出从包根导入：

```ts
import { Logger, LogLevel, ConsoleTransport, FileTransport } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Logger` | 结构化日志器：四级日志、双格式、多传输器，方法均返回 `Promise<void>` | `packages/be/logger/apis.md` |
| `LoggerOptions` | `Logger` 构造选项：`name`、`level`、`format`、`transports`、`context`、`timestampFormat`、`utc`、`textFormat` | `packages/be/logger/apis.md` |
| `LogLevel` | 日志级别枚举：`DEBUG` / `INFO` / `WARN` / `ERROR` | `packages/be/logger/apis.md` |
| `LogFormat` | 日志格式 `'text' \| 'json'` | `packages/be/logger/apis.md` |
| `LogEntry` | 结构化日志条目：`level`、`message`、`timestamp`、`name?`、`meta?`、`error?` | `packages/be/logger/apis.md` |
| `TextFormatConfig` | text 格式配置：`'{timestamp} {level}'` 风格模板或格式化函数 | `packages/be/logger/apis.md` |
| `TextFormatVars` | 模板可用变量集合：`timestamp`、`level`、`name`、`message`、`meta`、`error` | `packages/be/logger/apis.md` |
| `TextFormatter` | 自定义 text 格式化函数类型 | `packages/be/logger/apis.md` |
| `Transport` | 传输器接口：`level?` 与 `write(entry, formatted, format)` | `packages/be/logger/apis.md` |
| `ConsoleTransport` | 控制台传输器：debug 青、info 绿、warn 黄、error 红 | `packages/be/logger/apis.md` |
| `ConsoleTransportOptions` | `ConsoleTransport` 选项：`useColors`、`level` | `packages/be/logger/apis.md` |
| `FileTransport` | 文件传输器：串行写入、按大小轮转、目录模式按日期命名 | `packages/be/logger/apis.md` |
| `FileTransportOptions` | `FileTransport` 选项：`path`、`maxSize`、`newline`、`level` | `packages/be/logger/apis.md` |

选型规则：本地开发看控制台用默认的 `ConsoleTransport`；生产落盘用 `FileTransport`；两者同开把它们一起放进 `transports` 数组。完整签名与示例见 `packages/be/logger/apis.md`。
