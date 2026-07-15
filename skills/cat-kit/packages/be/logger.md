# be — 日志

## 何时使用

需要分级结构化日志、统一上下文、JSON 输出，或同时写控制台和文件时使用。

## 如何选择

- `Logger`：提供 `debug`、`info`、`warn`、`error` 和底层 `log`。
- `ConsoleTransport`：默认输出目标，可配置颜色和独立最低级别。
- `FileTransport`：写固定文件或按日期写目录，并可按 `maxSize` 轮转。
- `Transport`：需要发送到远程服务等自定义目标时实现其 `write` 方法。

## 最小示例

```ts
import { FileTransport, LogLevel, Logger } from '@cat-kit/be'

const logger = new Logger({
  name: 'api',
  level: LogLevel.INFO,
  format: 'json',
  context: { service: 'users' },
  transports: [new FileTransport({ path: './logs/app.log' })]
})

await logger.info('server started', { port: 3000 })
await logger.error('database unavailable', new Error('ECONNREFUSED'))
```

## 约束与边界

- 所有日志方法都返回 `Promise<void>`；应 `await`，尤其是文件或异步自定义 Transport。
- `Logger` 默认级别为 `INFO`、格式为 `text`、目标为 `ConsoleTransport`。
- `error(message, error, meta?)` 会记录错误堆栈；第二参数也可直接传元数据对象。
- `FileTransport.path` 指向现有目录或无扩展名路径时使用按日期文件；带扩展名路径按固定文件处理。
- 自定义 Transport 可返回 Promise；写入失败会使本次日志 Promise 拒绝。

## 精确类型入口

[Logger 与日志条目](../../generated/be/logger/logger.d.ts) · [内置及自定义 Transport](../../generated/be/logger/transports.d.ts)
