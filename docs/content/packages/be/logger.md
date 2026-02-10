# 日志系统

## 介绍

本页介绍 `@cat-kit/be` 的日志能力，包含 `Logger` 与多种 `Transport`，支持文本或结构化日志输出。

## 快速使用

```typescript
import { Logger, LogLevel, ConsoleTransport } from '@cat-kit/be'

const logger = new Logger({
  level: LogLevel.INFO,
  transports: [new ConsoleTransport()]
})

await logger.info('service started', { port: 3000 })
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

日志系统包含以下核心组件：

- **Logger** - 日志记录器，支持多种日志级别和格式
- **ConsoleTransport** - 控制台输出传输，支持 chalk 彩色输出
- **FileTransport** - 文件输出传输，支持目录模式和文件轮转
- **自定义传输** - 可以实现自定义传输方式（如发送到远程日志服务）

**主要特性：**

- ✅ 结构化日志记录
- ✅ 多种日志级别（DEBUG、INFO、WARN、ERROR）
- ✅ 支持文本和 JSON 格式
- ✅ 自定义时间戳格式和 UTC 支持
- ✅ Text 格式自定义模板或回调函数
- ✅ 多种传输方式（控制台、文件、自定义）
- ✅ 日志轮转和目录模式支持
- ✅ 上下文信息支持

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
    new FileTransport({ path: './logs' })
  ],
  context: {
    app: 'my-app',
    version: '1.0.0'
  }
})
```

### API参考

```typescript
class Logger {
  constructor(options?: LoggerOptions)

  // 记录不同级别的日志
  debug(message: string, meta?: Record<string, unknown>): Promise<void>
  info(message: string, meta?: Record<string, unknown>): Promise<void>
  warn(message: string, meta?: Record<string, unknown>): Promise<void>
  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    meta?: Record<string, unknown>
  ): Promise<void>
}
```

**选项说明：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | 日志记录器名称 |
| `level` | `LogLevel` | `LogLevel.INFO` | 最低日志级别 |
| `format` | `'text' \| 'json'` | `'text'` | 日志格式 |
| `transports` | `Transport[]` | `[new ConsoleTransport()]` | 传输方式数组 |
| `context` | `Record<string, unknown>` | - | 上下文信息 |
| `timestampFormat` | `string` | `'yyyy-MM-dd HH:mm:ss'` | 时间戳格式 |
| `utc` | `boolean` | `false` | 是否使用 UTC 时间 |
| `textFormat` | `string \| TextFormatter` | - | Text 格式化配置 |

### 时间戳配置

使用 `@cat-kit/core` 的 `Dater` 类处理时间，支持自定义格式和 UTC。

```typescript
// 自定义时间戳格式
const logger = new Logger({
  timestampFormat: 'yyyy/MM/dd HH:mm:ss',
  utc: false // 使用本地时间
})

// 使用 UTC 时间
const logger = new Logger({
  utc: true
})
// 输出: 2025-12-07 05:47:28 INFO hello
```

### Text 格式化配置

当 `format` 为 `'text'` 时，可以通过 `textFormat` 自定义输出格式。

**使用字符串模板：**

```typescript
const logger = new Logger({
  format: 'text',
  textFormat: '[{timestamp}] {level} - {message}'
})
// 输出: [2025-12-07 13:48:31] INFO  - hello
```

**可用变量：**

- `{timestamp}` - 时间戳
- `{level}` - 日志级别（大写，5字符对齐）
- `{name}` - 日志器名称（带方括号）
- `{message}` - 日志消息
- `{meta}` - 附加元数据（JSON 格式）
- `{error}` - 错误信息

**使用回调函数：**

```typescript
const logger = new Logger({
  format: 'text',
  textFormat: (vars, entry) => {
    return `${vars.timestamp} | ${entry.level.toUpperCase()} | ${vars.message}`
  }
})
```

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

## 传输方式

### ConsoleTransport

控制台输出传输，使用 chalk 进行彩色输出，适合开发环境使用。

```typescript
import { ConsoleTransport, LogLevel } from '@cat-kit/be'

const transport = new ConsoleTransport({
  useColors: true,  // 启用颜色（默认 true）
  level: LogLevel.DEBUG  // 传输器级别
})

const logger = new Logger({
  transports: [transport]
})
```

**选项说明：**

- `useColors` - 是否使用颜色，默认 `true`
- `level` - 传输器日志级别

**颜色映射（使用 chalk）：**

- DEBUG - 青色 (cyan)
- INFO - 绿色 (green)
- WARN - 黄色 (yellow)
- ERROR - 红色 (red)

### FileTransport

文件输出传输，支持目录模式和文件轮转，适合生产环境使用。

```typescript
import { FileTransport, LogLevel } from '@cat-kit/be'

// 文件模式：直接写入指定文件，超过大小时轮转
const fileTransport = new FileTransport({
  path: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  level: LogLevel.INFO
})

// 目录模式：按日期创建文件，超过大小时添加时间戳后缀
const dirTransport = new FileTransport({
  path: './logs',
  maxSize: 10 * 1024 * 1024
})

const logger = new Logger({
  transports: [fileTransport]
})
```

**选项说明：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | 必填 | 日志路径（目录或文件） |
| `maxSize` | `number` | - | 最大文件大小（字节） |
| `newline` | `string` | `'\n'` | 换行符 |
| `level` | `LogLevel` | - | 传输器日志级别 |

**路径类型判断：**

- 有扩展名 → 文件模式
- 无扩展名 → 目录模式

**目录模式行为：**

- 日志文件按日期命名：`2025-12-07.log`
- 超过 `maxSize` 时，重命名为 `2025-12-07_13-48-31.log`

**文件模式行为：**

- 直接写入指定文件
- 超过 `maxSize` 时，轮转为 `app.2025-12-07_13-48-31.log`

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

只有大于等于记录器级别的日志才会被输出。例如，如果设置级别为 `INFO`，则 `DEBUG` 日志不会被输出，但 `INFO`、`WARN` 和 `ERROR` 日志会被输出。

## 日志格式

### 文本格式

```typescript
const logger = new Logger({ format: 'text' })

await logger.info('用户登录', { userId: 123 })
// 2025-12-07 12:00:00 INFO  [app] 用户登录 {"userId":123}
```

**默认格式：** `{timestamp} {level} {name}{message}{meta}{error}`

### JSON 格式

```typescript
const logger = new Logger({ format: 'json' })

await logger.info('用户登录', { userId: 123 })
// {"level":"info","message":"用户登录","timestamp":"2025-12-07 12:00:00","name":"app","meta":{"userId":123}}
```

**格式：** JSON 对象，包含以下字段：

- `level` - 日志级别
- `message` - 日志消息
- `timestamp` - 时间戳
- `name` - 记录器名称
- `meta` - 元数据对象
- `error` - 错误对象（如果有）

## 使用示例

### 应用日志

```typescript
import { Logger, LogLevel, ConsoleTransport, FileTransport } from '@cat-kit/be'

const logger = new Logger({
  name: 'my-app',
  level: LogLevel.INFO,
  format: 'text',
  timestampFormat: 'yyyy-MM-dd HH:mm:ss',
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({
      path: './logs',
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

// 错误日志
await logger.error('请求失败', new Error('Database connection failed'), {
  requestId: 'req-123',
  userId: 456
})
```

### 自定义传输

```typescript
import { Transport, LogEntry, LogFormat, LogLevel } from '@cat-kit/be'

class CustomTransport implements Transport {
  level = LogLevel.INFO

  async write(
    entry: LogEntry,
    formatted: string,
    format: LogFormat
  ): Promise<void> {
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
  format: process.env.LOG_FORMAT === 'json' ? 'json' : 'text',
  utc: process.env.TZ === 'UTC'
})
```

## 最佳实践

1. **合理设置日志级别**：生产环境使用 `INFO` 或 `WARN`，开发环境使用 `DEBUG`
2. **使用结构化日志**：使用 `meta` 参数传递结构化数据，而不是拼接字符串
3. **记录上下文信息**：使用 `context` 添加全局上下文（如 requestId、userId）
4. **错误日志包含完整信息**：记录错误对象和相关的上下文信息
5. **使用文件传输进行持久化**：生产环境使用 `FileTransport` 保存日志
6. **定期清理日志**：配置日志轮转，避免日志文件过大
7. **避免记录敏感信息**：不要在日志中记录密码、令牌等敏感信息
8. **使用 JSON 格式**：生产环境使用 JSON 格式，便于日志聚合和分析
9. **使用 UTC 时间**：跨时区应用建议使用 UTC 时间
