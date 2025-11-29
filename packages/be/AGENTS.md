# @cat-kit/be - 后端工具包

本文件为 `@cat-kit/be` 包提供详细的开发指导。

## 包概述

`@cat-kit/be` 是专门为 Node.js 后端环境设计的工具包，提供服务器端常用的工具函数和模块。

**包名称**：`@cat-kit/be`
**依赖关系**：依赖 `@cat-kit/core`
**运行环境**：仅 Node.js（Node.js only）

## 依赖说明

⚠️ **重要**：在开发此包时，优先从 `@cat-kit/core` 导入基础工具函数，避免重复实现。

```typescript
// ✅ 正确：从 core 导入
import { isObject, deepClone } from '@cat-kit/core/src'

// ❌ 错误：重新实现已有功能
function isObject(value: unknown): boolean { ... }
```

## 目录结构

```
packages/be/src/
├── index.ts           # 主导出文件
└── (待添加的模块)
```

**注意**：当前此包还处于早期阶段，主要结构等待添加功能模块时建立。

## 设计原则

### Node.js 环境专用

所有代码必须在 Node.js 环境中运行，可以使用 Node.js 特有的 API：

```typescript
// ✅ 正确：使用 Node.js API
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function loadConfig(configPath: string): Promise<any> {
  const fullPath = join(process.cwd(), configPath)
  const content = await readFile(fullPath, 'utf-8')
  return JSON.parse(content)
}
```

### 异步优先

优先使用 Promise 和 async/await，避免回调风格：

```typescript
// ✅ 正确：使用 Promise
import { readFile } from 'node:fs/promises'

export async function readJSON(filePath: string): Promise<any> {
  const content = await readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

// ❌ 错误：使用回调
import { readFile } from 'node:fs'

export function readJSON(filePath: string, callback: (err: any, data: any) => void): void {
  readFile(filePath, 'utf-8', (err, content) => {
    if (err) return callback(err, null)
    callback(null, JSON.parse(content))
  })
}
```

### 错误处理

提供清晰的错误信息和适当的错误类型：

```typescript
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly configPath: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'ConfigError'
  }
}

export async function loadConfig(configPath: string): Promise<any> {
  try {
    const content = await readFile(configPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new ConfigError(
      `Failed to load config from ${configPath}`,
      configPath,
      error
    )
  }
}
```

## 建议的模块方向

基于后端开发的常见需求，建议添加以下模块：

### 1. 文件系统工具

增强的文件系统操作：
- 递归读取目录
- 文件监听
- 临时文件管理
- 文件锁

```typescript
// 示例：packages/be/src/fs/
export async function readDirRecursive(dir: string): Promise<string[]>
export async function watchFile(path: string, callback: (event: string) => void): Promise<void>
```

### 2. 进程管理

进程和子进程工具：
- 子进程执行
- 进程池
- 优雅退出

```typescript
// 示例：packages/be/src/process/
export async function execCommand(command: string, options?: ExecOptions): Promise<ExecResult>
export function createProcessPool(options: PoolOptions): ProcessPool
```

### 3. 日志工具

结构化日志记录：
- 分级日志
- 日志格式化
- 日志输出（控制台、文件）

```typescript
// 示例：packages/be/src/logger/
export class Logger {
  info(message: string, meta?: Record<string, any>): void
  error(message: string, error?: Error, meta?: Record<string, any>): void
  warn(message: string, meta?: Record<string, any>): void
  debug(message: string, meta?: Record<string, any>): void
}
```

### 4. 环境配置

配置管理：
- 环境变量加载
- 配置文件解析（JSON、YAML、TOML）
- 配置验证

```typescript
// 示例：packages/be/src/config/
export function loadEnv(envPath?: string): Record<string, string>
export async function loadConfig<T>(configPath: string, schema?: Schema): Promise<T>
```

### 5. 缓存工具

内存缓存和持久化缓存：
- LRU 缓存
- TTL 缓存
- 文件缓存

```typescript
// 示例：packages/be/src/cache/
export class LRUCache<K, V> {
  set(key: K, value: V): void
  get(key: K): V | undefined
  has(key: K): boolean
  delete(key: K): boolean
}
```

### 6. 安全工具

安全相关功能：
- 密码哈希
- 加密/解密
- 安全随机数生成

```typescript
// 示例：packages/be/src/security/
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>
export function generateSecureToken(length: number): string
```

## 编码规范

### 使用 Node.js 内置模块

优先使用 `node:` 协议导入内置模块：

```typescript
// ✅ 正确：使用 node: 协议
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

// ❌ 错误：不使用 node: 协议
import { readFile } from 'fs/promises'
import { join } from 'path'
```

### 类型安全

为所有公共 API 提供完整的类型定义：

```typescript
export interface ReadOptions {
  encoding?: BufferEncoding
  flag?: string
}

export async function readTextFile(
  filePath: string,
  options?: ReadOptions
): Promise<string> {
  // 实现
}
```

### 文档注释

所有公共 API 必须有 JSDoc 注释：

```typescript
/**
 * 读取并解析 JSON 文件
 * @param filePath - JSON 文件路径
 * @returns 解析后的 JSON 对象
 * @throws {ConfigError} 当文件不存在或 JSON 格式错误时
 * @example
 * ```ts
 * const config = await readJSONFile('./config.json')
 * console.log(config)
 * ```
 */
export async function readJSONFile<T = any>(filePath: string): Promise<T> {
  // 实现
}
```

## 测试规范

测试文件位于 `packages/tests/be/` 目录：

```typescript
// packages/tests/be/fs/read.test.ts
import { describe, it, expect } from 'vitest'
import { readTextFile } from '@cat-kit/be/src'
import { join } from 'node:path'

describe('readTextFile', () => {
  it('should read text file', async () => {
    const content = await readTextFile(join(__dirname, 'fixtures', 'test.txt'))
    expect(content).toBe('test content')
  })

  it('should throw error for non-existent file', async () => {
    await expect(
      readTextFile('non-existent.txt')
    ).rejects.toThrow()
  })
})
```

## 添加新功能

### 步骤

1. **规划模块**：确定功能应该属于哪个模块（如 `fs/`、`logger/`、`config/` 等）
2. **创建目录**：在 `src/` 下创建模块目录
3. **实现功能**：编写代码，添加类型和文档
4. **导出**：在模块的 `index.ts` 和 `src/index.ts` 中导出
5. **添加测试**：在 `packages/tests/be/` 下添加测试
6. **构建验证**：运行 `cd build && bun run build` 验证构建

### 示例：添加日志模块

```typescript
// packages/be/src/logger/logger.ts

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LoggerOptions {
  level?: LogLevel
  prefix?: string
}

export class Logger {
  constructor(private options: LoggerOptions = {}) {}

  info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta)
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...meta, error })
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta)
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta)
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const timestamp = new Date().toISOString()
    const prefix = this.options.prefix ? `[${this.options.prefix}] ` : ''
    console.log(`${timestamp} ${level.toUpperCase()} ${prefix}${message}`, meta || '')
  }
}
```

然后在 `packages/be/src/logger/index.ts` 中导出：
```typescript
export * from './logger'
```

最后在 `packages/be/src/index.ts` 中导出：
```typescript
export * from './logger'
```

## 性能考虑

- 对于 I/O 密集型操作，使用异步 API
- 对于 CPU 密集型操作，考虑使用 Worker Threads
- 合理使用缓存减少重复计算
- 避免阻塞事件循环

## 安全考虑

- 验证和清理用户输入
- 使用参数化查询防止注入攻击
- 安全处理敏感数据（密码、密钥等）
- 使用最新的加密算法和标准

## 导出策略

所有公共 API 都通过 `src/index.ts` 统一导出。

## 构建配置

构建配置位于 `build/pkgs.ts`：

```typescript
{
  dir: pkg('be'),
  deps: ['@cat-kit/core'],
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']
  }
}
```

## 常见任务

### 添加文件系统工具
→ 在 `src/fs/` 下创建新文件

### 添加日志功能
→ 在 `src/logger/` 下创建新文件

### 添加配置管理
→ 在 `src/config/` 下创建新文件

### 添加缓存功能
→ 在 `src/cache/` 下创建新文件

## Node.js 版本要求

默认目标 Node.js 版本：
- Node.js 18+ （LTS）
- Node.js 20+ （推荐）

使用新 API 时应该：
1. 检查 Node.js 文档确认版本要求
2. 在文档中说明最低版本要求
3. 考虑提供降级方案（如果可能）
