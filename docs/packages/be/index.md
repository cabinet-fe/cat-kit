---
title: 后端工具库
description: '@cat-kit/be 是为 Node.js 和 Bun 等后端环境设计的工具库'
outline: deep
---

# BE 后端工具包

`@cat-kit/be` 是一个专为 Node.js 和 Bun 后端环境设计的工具包，提供了文件系统操作、配置管理、日志记录、缓存、网络工具、系统监控和任务调度等常用功能。所有 API 都经过精心设计，具有完整的 TypeScript 类型支持，让你能够更高效地开发后端应用。

## 安装

::: code-group

```bash [bun]
bun add @cat-kit/be
```

```bash [npm]
npm install @cat-kit/be
```

```bash [pnpm]
pnpm add @cat-kit/be
```

:::

### 可选依赖

某些功能需要额外的可选依赖：

```bash
# 支持 YAML 配置文件
bun add js-yaml

# 支持 TOML 配置文件
bun add smol-toml
```

## 模块概览

### 📁 文件系统 (`fs`)

提供增强的文件和目录操作功能，简化常见的文件系统任务。

**主要功能：**

- `readDir` - 递归读取目录，支持过滤和多种返回格式
- `ensureDir` - 确保目录存在，自动创建父目录
- `writeFile` - 增强的文件写入，支持流和自动创建目录
- `readJson` / `writeJson` - JSON 文件的便捷读写操作
- `removePath` - 安全删除文件或目录

**适用场景：** 配置文件读取、日志文件管理、批量文件处理、数据备份等。

[查看详细文档 →](./fs)

### ⚙️ 配置管理 (`config`)

提供灵活的配置管理方案，支持环境变量和多种配置文件格式。

**主要功能：**

- `loadEnv` - 加载 `.env` 文件，支持多环境配置
- `parseEnv` - 解析和验证环境变量，支持类型转换
- `loadConfig` - 加载配置文件（JSON/YAML/TOML），支持合并默认值
- `mergeConfig` - 深度合并配置对象

**适用场景：** 应用配置管理、多环境部署、配置验证、环境变量类型安全等。

[查看详细文档 →](./config)

### 📝 日志系统 (`logger`)

提供结构化日志记录功能，支持多种传输方式和日志级别。

**主要功能：**

- `Logger` - 日志记录器类，支持多传输方式
- `ConsoleTransport` - 控制台输出传输，支持彩色输出
- `FileTransport` - 文件输出传输，支持日志轮转
- 支持日志级别：DEBUG、INFO、WARN、ERROR
- 支持文本和 JSON 格式

**适用场景：** 应用日志记录、错误追踪、性能监控、日志聚合等。

[查看详细文档 →](./logger)

### 💾 缓存工具 (`cache`)

提供多种缓存实现，满足不同的缓存需求。

**主要功能：**

- `LRUCache` - 最近最少使用缓存，支持 TTL 过期
- `FileCache` - 文件系统缓存，数据持久化到磁盘
- `memoize` - 函数记忆化装饰器，自动缓存函数结果

**适用场景：** API 响应缓存、数据库查询缓存、计算结果缓存、临时数据存储等。

[查看详细文档 →](./cache)

### 🌐 网络工具 (`net`)

提供网络相关的实用工具函数。

**主要功能：**

- `isPortAvailable` - 检查端口是否可用
- `getLocalIP` - 获取本机 IP 地址
- `getNetworkInterfaces` - 获取网络接口信息

**适用场景：** 服务器启动前端口检查、动态端口分配、网络配置检测等。

[查看详细文档 →](./net)

### 📊 系统监控 (`system`)

提供系统资源监控功能，帮助你了解服务器运行状态。

**主要功能：**

- `getCpuInfo` - 获取 CPU 基本信息
- `getCpuUsage` - 获取 CPU 使用率
- `getMemoryInfo` - 获取内存使用情况
- `getDiskInfo` - 获取磁盘使用情况
- `getNetworkInterfaces` - 获取网络接口信息

**适用场景：** 系统健康检查、资源监控告警、性能指标收集、容量规划等。

[查看详细文档 →](./system)

### ⏰ 任务调度 (`scheduler`)

提供灵活的任务调度功能，支持 Cron 表达式、延迟执行和定时执行。

**主要功能：**

- `Scheduler` - 任务调度器类
- `CronExpression` / `parseCron` - Cron 表达式解析器
- 支持 Cron 任务、延迟任务和定时任务
- 支持任务查询、取消和管理

**适用场景：** 定时任务执行、数据清理、健康检查、报表生成等。

[查看详细文档 →](./scheduler)

## 快速开始

### 文件系统操作

```typescript
import { readDir, ensureDir, writeFile, readJson, writeJson } from '@cat-kit/be'

// 递归读取目录
const files = await readDir('./src', {
  recursive: true,
  onlyFiles: true
})

// 确保目录存在（自动创建父目录）
await ensureDir('./logs/app')

// 写入文件（支持流、自动创建目录）
await writeFile('./logs/app.log', 'Hello World')

// 下载文件（流式写入）
const response = await fetch('https://example.com/file.zip')
await writeFile('./downloads/file.zip', response.body!)

// 读取和写入 JSON
const config = await readJson('./config.json')
await writeJson('./data.json', { name: 'CatKit' })
```

### 配置管理

```typescript
import { loadEnv, parseEnv, loadConfig } from '@cat-kit/be'

// 加载环境变量
await loadEnv({ mode: 'development' })

// 解析和验证环境变量（类型安全）
const config = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true }
})

// 加载配置文件
const appConfig = await loadConfig('./config.yaml')
```

### 日志记录

```typescript
import { Logger, LogLevel, ConsoleTransport, FileTransport } from '@cat-kit/be'

const logger = new Logger({
  level: LogLevel.INFO,
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filePath: './logs/app.log' })
  ]
})

await logger.info('应用启动', { port: 3000 })
await logger.error('请求失败', new Error('Connection timeout'))
```

### 缓存使用

```typescript
import { LRUCache, memoize } from '@cat-kit/be'

// LRU 缓存（支持 TTL）
const cache = new LRUCache({
  maxSize: 100,
  ttl: 3600000 // 1小时过期
})
cache.set('key', 'value')

// 函数记忆化
const fetchUser = memoize(
  async (id: number) => {
    return await fetchUserFromDB(id)
  },
  { ttl: 300000 }
) // 5分钟过期
```

### 任务调度

```typescript
import { Scheduler } from '@cat-kit/be'

const scheduler = new Scheduler()

// Cron 任务（每天凌晨执行）
scheduler.schedule('daily-cleanup', '0 0 * * *', async () => {
  await cleanupTempFiles()
})

// 延迟执行（5秒后执行一次）
scheduler.once('delayed-task', 5000, () => {
  console.log('延迟任务执行')
})

// 定时执行（每30秒执行一次）
scheduler.interval('heartbeat', 30000, () => {
  sendHeartbeat()
})

scheduler.start()
```

## 环境要求

- Node.js >= 18.0.0
- Bun >= 1.0.0（推荐）

## 下一步

- [文件系统](./fs) - 文件系统操作 API
- [配置管理](./config) - 配置管理 API
- [日志系统](./logger) - 日志记录 API
- [缓存工具](./cache) - 缓存 API
- [网络工具](./net) - 网络工具 API
- [系统监控](./system) - 系统监控 API
- [任务调度](./scheduler) - 任务调度 API
