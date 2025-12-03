# 日志系统

日志系统模块提供了结构化的日志记录功能，支持多种传输方式和日志级别。

## Logger

### 创建日志记录器

```typescript
import { Logger, LogLevel, ConsoleTransport, FileTransport } from '@cat-kit/be'

// 基础用法
const logger = new Logger({
  name: 'app',
  level: LogLevel.INFO,
  format: 'text'
})

// 使用多个传输方式
const logger = new Logger({
  name: 'app',
  level: LogLevel.DEBUG,
  format: 'json',
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filePath: './logs/app.log' })
  ],
  context: {
    app: 'my-app',
    version: '1.0.0'
  }
})
```

#### API

```typescript
class Logger {
  constructor(options?: LoggerOptions)

  debug(message: string, meta?: Record<string, unknown>): Promise<void>
  info(message: string, meta?: Record<string, unknown>): Promise<void>
  warn(message: string, meta?: Record<string, unknown>): Promise<void>
  error(message: string, errorOrMeta?: Error | Record<string, unknown>, meta?: Record<string, unknown>): Promise<void>

  child(options: Partial<LoggerOptions>): Logger
}
```

**选项：**

- `name` - 日志记录器名称
- `level` - 日志级别，默认 `LogLevel.INFO`
- `format` - 日志格式：`'text'` | `'json'`，默认 `'text'`
- `transports` - 传输方式数组，默认 `[new ConsoleTransport()]`
- `context` - 上下文信息，会附加到所有日志条目
- `timestamp` - 时间戳生成函数，默认使用 ISO 字符串

### 记录日志

```typescript
import { Logger, LogLevel } from '@cat-kit/be'

const logger = new Logger({ level: LogLevel.DEBUG })

// 不同级别的日志
await logger.debug('调试信息', { userId: 123 })
await logger.info('应用启动', { port: 3000 })
await logger.warn('内存使用率较高', { usage: 85 })
await logger.error('请求失败', new Error('Connection timeout'))

// error 方法的不同用法
await logger.error('操作失败', new Error('Something went wrong'))
await logger.error('操作失败', { error: 'Something went wrong', code: 500 })
await logger.error('操作失败', new Error('Error'), { requestId: 'req-123' })
```

### 子日志记录器

创建子日志记录器，继承父记录器的配置并添加上下文。

```typescript
const logger = new Logger({ name: 'app' })

// 创建子记录器
const dbLogger = logger.child({ name: 'database' })
await dbLogger.info('查询执行') // [database] 查询执行

// 添加上下文
const requestLogger = logger.child({
  context: { requestId: 'req-123', userId: 456 }
})
await requestLogger.info('处理请求') // 日志会包含 requestId 和 userId
```

## 传输方式

### ConsoleTransport

控制台输出传输，支持彩色输出。

```typescript
import { ConsoleTransport } from '@cat-kit/be'

const transport = new ConsoleTransport({
  useColors: true // 启用颜色（默认 true）
})

const logger = new Logger({
  transports: [transport]
})
```

#### API

```typescript
class ConsoleTransport implements Transport {
  constructor(options?: ConsoleTransportOptions)
}
```

**选项：**

- `useColors` - 是否使用颜色，默认 `true`

**颜色映射：**

- DEBUG - 青色 (cyan)
- INFO - 绿色 (green)
- WARN - 黄色 (yellow)
- ERROR - 红色 (red)

### FileTransport

文件输出传输，支持日志轮转。

```typescript
import { FileTransport } from '@cat-kit/be'

const transport = new FileTransport({
  filePath: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  newline: '\n'
})

const logger = new Logger({
  transports: [transport]
})
```

#### API

```typescript
class FileTransport implements Transport {
  constructor(options: FileTransportOptions)
}
```

**选项：**

- `filePath` - 日志文件路径
- `maxSize` - 最大文件大小（字节），超过后自动轮转
- `newline` - 换行符，默认 `'\n'`

**日志轮转：**

当文件大小超过 `maxSize` 时，会自动将当前文件重命名为 `{basename}.{timestamp}{extension}`，然后创建新文件。

例如：`app.log` → `app.1703123456789.log`

## 日志级别

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

**级别权重：**

- DEBUG: 10
- INFO: 20
- WARN: 30
- ERROR: 40

只有大于等于记录器级别的日志才会被输出。

## 日志格式

### 文本格式

```typescript
const logger = new Logger({ format: 'text' })

await logger.info('用户登录', { userId: 123 })
// 2024-01-01T12:00:00.000Z INFO  [app] 用户登录 {"userId":123}
```

**格式：** `{timestamp} {level} [{name}] {message} {meta} {error}`

### JSON 格式

```typescript
const logger = new Logger({ format: 'json' })

await logger.info('用户登录', { userId: 123 })
// {"level":"info","message":"用户登录","timestamp":"2024-01-01T12:00:00.000Z","name":"app","meta":{"userId":123}}
```

**格式：** JSON 对象，包含 `level`、`message`、`timestamp`、`name`、`meta`、`error` 字段。

## 使用示例

### 应用日志

```typescript
import { Logger, LogLevel, ConsoleTransport, FileTransport } from '@cat-kit/be'

const logger = new Logger({
  name: 'my-app',
  level: LogLevel.INFO,
  format: 'text',
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({
      filePath: './logs/app.log',
      maxSize: 10 * 1024 * 1024
    })
  ],
  context: {
    app: 'my-app',
    version: '1.0.0'
  }
})

// 应用启动
await logger.info('应用启动', { port: 3000 })

// 请求日志
const requestLogger = logger.child({
  context: { requestId: 'req-123' }
})
await requestLogger.info('处理请求', { method: 'GET', path: '/api/users' })

// 错误日志
await logger.error('请求失败', new Error('Database connection failed'), {
  requestId: 'req-123',
  userId: 456
})
```

### 模块日志

```typescript
// database.ts
const dbLogger = logger.child({ name: 'database' })

export async function query(sql: string) {
  await dbLogger.debug('执行查询', { sql })
  try {
    const result = await db.query(sql)
    await dbLogger.info('查询成功', { rows: result.length })
    return result
  } catch (error) {
    await dbLogger.error('查询失败', error as Error, { sql })
    throw error
  }
}

// api.ts
const apiLogger = logger.child({ name: 'api' })

export async function handleRequest(req: Request) {
  const requestLogger = apiLogger.child({
    context: { requestId: req.id }
  })

  await requestLogger.info('收到请求', {
    method: req.method,
    path: req.path
  })

  // 处理请求...
}
```

### 自定义传输

```typescript
import { Transport, LogEntry, LogFormat } from '@cat-kit/be'

class CustomTransport implements Transport {
  level = LogLevel.INFO

  async write(entry: LogEntry, formatted: string, format: LogFormat): Promise<void> {
    // 发送到远程日志服务
    await fetch('https://logs.example.com/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
  }
}

const logger = new Logger({
  transports: [
    new ConsoleTransport(),
    new CustomTransport()
  ]
})
```

### 环境配置

```typescript
import { Logger, LogLevel } from '@cat-kit/be'

const logger = new Logger({
  level: process.env.NODE_ENV === 'production'
    ? LogLevel.INFO
    : LogLevel.DEBUG,
  format: process.env.LOG_FORMAT === 'json' ? 'json' : 'text'
})
```

