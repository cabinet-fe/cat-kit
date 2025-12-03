---
title: BE 后端工具包
description: '@cat-kit/be 是为 Node.js 和 Bun 等后端环境设计的工具包'
outline: deep
---

# BE 后端工具包

`@cat-kit/be` 是为 Node.js 和 Bun 等后端环境设计的工具包，提供文件系统操作、配置管理、日志记录、缓存、网络工具、系统监控和任务调度等功能。

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

```bash [yarn]
yarn add @cat-kit/be
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

提供增强的文件系统操作：

- `readDir` - 递归读取目录，支持过滤和多种返回格式
- `ensureDir` - 确保目录存在，不存在则创建
- `readJson` / `writeJson` - JSON 文件的读写操作
- `remove` - 删除文件或目录

[查看详细文档 →](./fs)

### ⚙️ 配置管理 (`config`)

提供灵活的配置管理方案：

- `loadEnv` - 加载 `.env` 文件，支持多环境
- `parseEnv` - 解析和验证环境变量，支持类型转换
- `loadConfig` - 加载配置文件（JSON/YAML/TOML），支持合并默认值
- `mergeConfig` - 深度合并配置对象

[查看详细文档 →](./config)

### 📝 日志系统 (`logger`)

提供结构化日志记录：

- `Logger` - 日志记录器类，支持多传输方式
- `ConsoleTransport` - 控制台输出传输
- `FileTransport` - 文件输出传输，支持日志轮转
- 支持日志级别：DEBUG、INFO、WARN、ERROR
- 支持文本和 JSON 格式

[查看详细文档 →](./logger)

### 💾 缓存工具 (`cache`)

提供多种缓存实现：

- `LRUCache` - 最近最少使用缓存，支持 TTL
- `TTLCache` - 基于时间的缓存，自动清理过期项
- `FileCache` - 文件系统缓存，持久化存储
- `memoize` - 函数记忆化装饰器

[查看详细文档 →](./cache)

### 🌐 网络工具 (`net`)

提供网络相关工具：

- `isPortAvailable` - 检查端口是否可用
- `getLocalIP` - 获取本机 IP 地址
- `getNetworkInterfaces` - 获取网络接口信息

[查看详细文档 →](./net)

### 📊 系统监控 (`system`)

提供系统资源监控：

- `getCpuInfo` - 获取 CPU 基本信息
- `getCpuUsage` - 获取 CPU 使用率
- `getMemoryInfo` - 获取内存使用情况
- `getDiskInfo` - 获取磁盘使用情况
- `getNetworkInterfaces` - 获取网络接口信息

[查看详细文档 →](./system)

### ⏰ 任务调度 (`scheduler`)

提供任务调度功能：

- `Scheduler` - 任务调度器类
- `parseCron` - Cron 表达式解析器
- 支持 Cron 任务、延迟任务和定时任务
- 支持任务查询、取消和管理

[查看详细文档 →](./scheduler)

## 快速开始

### 文件系统操作

```typescript
import { readDir, ensureDir, readJson, writeJson } from '@cat-kit/be'

// 递归读取目录
const files = await readDir('./src', {
  recursive: true,
  includeFiles: true
})

// 确保目录存在
await ensureDir('./logs')

// 读取和写入 JSON
const config = await readJson('./config.json')
await writeJson('./data.json', { name: 'CatKit' })
```

### 配置管理

```typescript
import { loadEnv, parseEnv, loadConfig } from '@cat-kit/be'

// 加载环境变量
await loadEnv({ mode: 'development' })

// 解析和验证环境变量
const config = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true }
})

// 加载配置文件
const appConfig = await loadConfig('./config.yaml')
```

### 日志记录

```typescript
import { Logger, LogLevel, ConsoleTransport } from '@cat-kit/be'

const logger = new Logger({
  level: LogLevel.INFO,
  transports: [new ConsoleTransport()]
})

await logger.info('应用启动', { port: 3000 })
```

### 缓存使用

```typescript
import { LRUCache, memoize } from '@cat-kit/be'

// LRU 缓存
const cache = new LRUCache({ maxSize: 100 })
cache.set('key', 'value')

// 函数记忆化
const fn = memoize(async (id: number) => {
  return await fetchUser(id)
})
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
