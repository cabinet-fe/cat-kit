# 配置管理

## 介绍

本页介绍 `@cat-kit/be` 的配置能力：环境变量加载与校验、配置文件读取、配置合并，适用于多环境部署。

## 快速使用

```typescript
import { loadEnv, parseEnv, loadConfig, mergeConfig } from '@cat-kit/be'

const envRaw = await loadEnv({ mode: 'production' })
const env = parseEnv({ PORT: { type: 'number', default: 3000 } }, envRaw)

const fileConfig = await loadConfig('./app.config.json')
const finalConfig = mergeConfig(fileConfig, { port: env.PORT })
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

配置管理模块包含以下功能：

- **环境变量管理** - 加载和解析 `.env` 文件，支持多环境配置
- **类型安全解析** - 根据 schema 验证和转换环境变量，提供类型安全
- **配置文件加载** - 支持 JSON、YAML、TOML 格式的配置文件
- **配置合并** - 深度合并多个配置对象

## 环境变量

### loadEnv

加载 `.env` 文件集合，支持多环境配置。可以自动加载多个环境文件，后加载的文件会覆盖先加载的文件。

**适用场景：**
- 应用启动时加载环境变量
- 多环境配置管理（开发、测试、生产）
- 敏感信息管理（不提交到版本控制）

#### 基本用法

```typescript
import { loadEnv } from '@cat-kit/be'

// 加载默认环境变量
// 加载顺序：.env -> .env.local -> .env.{mode} -> .env.{mode}.local
const env = await loadEnv()

// 指定运行模式（如 development、production）
const env = await loadEnv({
  mode: 'production'
})
// 加载顺序：.env -> .env.local -> .env.production -> .env.production.local

// 自定义文件列表
const env = await loadEnv({
  files: ['.env', '.env.custom']
})

// 不写入 process.env（只返回对象）
const env = await loadEnv({
  injectToProcess: false
})

// 覆盖已存在的环境变量
const env = await loadEnv({
  override: true
})
```

#### API参考

```typescript
function loadEnv(options?: LoadEnvOptions): Promise<EnvRecord>
```

**参数说明：**

- `options.cwd` - 工作目录，默认 `process.cwd()`
- `options.mode` - 运行模式（如 `development`、`production`）。如果指定，会加载 `.env.{mode}` 和 `.env.{mode}.local` 文件
- `options.files` - 自定义文件列表，覆盖默认加载顺序
- `options.override` - 是否覆盖 `process.env` 中已有的值，默认 `false`
- `options.injectToProcess` - 是否写入 `process.env`，默认 `true`

**返回值：**

返回一个包含所有环境变量的对象（`Record<string, string>`）。

**文件加载顺序：**

1. `.env` - 基础环境变量
2. `.env.local` - 本地环境变量（通常不提交到版本控制）
3. `.env.{mode}` - 模式特定环境变量（如果指定了 mode）
4. `.env.{mode}.local` - 模式特定的本地环境变量（如果指定了 mode）

**示例文件结构：**

```
项目根目录/
├── .env                 # 基础配置
├── .env.local          # 本地配置（不提交）
├── .env.development    # 开发环境配置
├── .env.production     # 生产环境配置
└── .env.production.local # 生产环境本地配置（不提交）
```

### parseEnv

根据 schema 校验并转换环境变量，提供类型安全的环境变量访问。支持多种数据类型转换，包括数字、布尔值、JSON 和数组。

**适用场景：**
- 环境变量类型转换和验证
- 配置项默认值设置
- 必需配置项检查
- 类型安全的配置访问

#### 基本用法

```typescript
import { parseEnv } from '@cat-kit/be'

// 基础类型转换
const config = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false },
  API_KEYS: { type: 'array', delimiter: ',' }
})

console.log(config.PORT)      // number
console.log(config.NODE_ENV)  // string
console.log(config.DEBUG)      // boolean
console.log(config.API_KEYS)   // string[]
```

#### 高级用法

```typescript
// JSON 类型
const config = parseEnv({
  DATABASE_CONFIG: {
    type: 'json',
    default: { host: 'localhost', port: 5432 }
  }
})
// config.DATABASE_CONFIG 是解析后的对象

// 自定义转换函数
const config = parseEnv({
  PORT: {
    type: (value) => {
      const port = parseInt(value || '3000', 10)
      if (port < 1 || port > 65535) {
        throw new Error('Port must be between 1 and 65535')
      }
      return port
    },
    default: 3000
  }
})

// 使用 transform 进行后处理
const config = parseEnv({
  API_URL: {
    type: 'string',
    transform: (value) => value.endsWith('/') ? value.slice(0, -1) : value
  }
})

// 从自定义数据源解析
const customSource = { PORT: '8080', DEBUG: 'true' }
const config = parseEnv(
  {
    PORT: { type: 'number' },
    DEBUG: { type: 'boolean' }
  },
  customSource
)
```

#### API参考

```typescript
function parseEnv<T extends Record<string, any>>(
  schema: EnvSchema<T>,
  source?: Record<string, string | undefined>
): T
```

**参数说明：**

- `schema` - 环境变量定义 schema，描述每个环境变量的类型和规则
- `source` - 数据源，默认 `process.env`

**返回值：**

返回转换后的类型安全结果，类型由 schema 推断。

**Schema 定义：**

```typescript
interface EnvDefinition<T> {
  // 类型：内置类型字符串、自定义转换函数
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array'
        | ((value: string | undefined, key: string) => T)

  // 默认值
  default?: T

  // 是否必需
  required?: boolean

  // 数组分隔符（仅用于 array 类型）
  delimiter?: string

  // 后处理转换函数
  transform?: (value: T, key: string) => T
}
```

**支持的类型：**

- `'string'` - 字符串（默认类型）
- `'number'` - 数字（使用 `parseInt` 或 `parseFloat` 转换）
- `'boolean'` - 布尔值（`'true'`, `'1'`, `'yes'`, `'on'` 为 `true`，其他为 `false`）
- `'json'` - JSON 字符串（使用 `JSON.parse` 解析）
- `'array'` - 数组（使用 `delimiter` 分隔，默认 `','`）
- 自定义函数 - 自定义转换逻辑

**异常处理：**

- 当 `required` 字段缺失时抛出错误
- 当类型转换失败时抛出错误
- 当 JSON 解析失败时抛出错误

### parseEnvFile

解析 `.env` 文件内容为键值对对象。这是一个底层工具函数，通常不需要直接使用。

```typescript
import { parseEnvFile } from '@cat-kit/be'

const content = `
PORT=3000
NODE_ENV=production
DEBUG=true
API_URL="https://api.example.com"
`

const env = parseEnvFile(content)
// { PORT: '3000', NODE_ENV: 'production', DEBUG: 'true', API_URL: 'https://api.example.com' }
```

**支持的格式：**

- `KEY=value` - 标准格式
- `export KEY=value` - 带 export 关键字
- `KEY="value"` - 双引号字符串
- `KEY='value'` - 单引号字符串
- `# 注释` - 注释行
- `KEY=value # 行内注释` - 行内注释

## 配置文件

### loadConfig

加载并解析配置文件，支持 JSON、YAML 和 TOML 格式。可以合并默认值，支持自定义解析器和验证函数。

**适用场景：**
- 应用配置文件加载
- 多环境配置文件管理
- 配置验证和默认值合并

#### 基本用法

```typescript
import { loadConfig } from '@cat-kit/be'

// 加载 JSON 配置文件
const config = await loadConfig<AppConfig>('./config.json')

// 加载 YAML 配置文件（需要安装 js-yaml）
const config = await loadConfig('./config.yaml')

// 加载 TOML 配置文件（需要安装 smol-toml）
const config = await loadConfig('./config.toml')

// 指定格式
const config = await loadConfig('./config', {
  format: 'yaml'
})

// 合并默认值
const config = await loadConfig('./config.json', {
  defaults: {
    port: 3000,
    host: 'localhost'
  }
})
```

#### 高级用法

```typescript
// 自定义解析器
const config = await loadConfig('./config.custom', {
  parser: async (source) => {
    // 自定义解析逻辑
    return JSON.parse(source)
  }
})

// 配置验证
const config = await loadConfig('./config.json', {
  validate: (config) => {
    if (!config.port || config.port < 1) {
      throw new Error('Invalid port')
    }
    if (!config.database?.host) {
      throw new Error('Database host is required')
    }
  }
})

// 不合并默认值（完全替换）
const config = await loadConfig('./config.json', {
  defaults: { port: 3000 },
  mergeDefaults: false
})
```

#### API参考

```typescript
function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  filePath: string,
  options?: LoadConfigOptions<T>
): Promise<T>
```

**参数说明：**

- `filePath` - 配置文件路径（相对或绝对路径）
- `options.cwd` - 工作目录，默认 `process.cwd()`
- `options.format` - 文件格式：`'json'` | `'yaml'` | `'toml'`，默认根据文件扩展名自动检测
- `options.defaults` - 默认配置值，会与文件配置深度合并
- `options.parser` - 自定义解析器函数
- `options.validate` - 配置验证函数，验证失败时抛出错误
- `options.mergeDefaults` - 是否与 defaults 深度合并，默认 `true`

**返回值：**

返回解析后的配置对象，类型由泛型参数指定。

**支持的格式：**

- `.json` - JSON 格式（内置支持）
- `.yaml` / `.yml` - YAML 格式（需要安装 `js-yaml`）
- `.toml` - TOML 格式（需要安装 `smol-toml`）

**异常处理：**

- 当可选依赖未安装时，会抛出 `PeerDependencyError`
- 当文件不存在时，会抛出文件系统错误
- 当解析失败时，会抛出解析错误
- 当验证失败时，会抛出验证错误

### mergeConfig

深度合并多个配置对象。对象属性会深度合并，数组会被替换（不合并）。

**适用场景：**
- 合并多个配置文件
- 合并默认配置和用户配置
- 多环境配置合并

#### 基本用法

```typescript
import { mergeConfig } from '@cat-kit/be'

// 合并配置
const merged = mergeConfig(
  { port: 3000, db: { host: 'localhost' } },
  { port: 4000 },
  { db: { port: 5432 } }
)
// { port: 4000, db: { host: 'localhost', port: 5432 } }

// 数组会被替换（不合并）
const merged = mergeConfig(
  { items: [1, 2] },
  { items: [3, 4] }
)
// { items: [3, 4] }
```

#### API参考

```typescript
function mergeConfig<T extends Record<string, any>>(
  ...configs: Array<Partial<T>>
): T
```

**参数说明：**

- `...configs` - 待合并的配置对象数组，后面的配置会覆盖前面的配置

**返回值：**

返回合并后的新对象，不会修改原始对象。

**合并规则：**

- 对象属性深度合并
- 数组会被替换（不合并）
- 基本类型会被覆盖
- `null` 和 `undefined` 会被覆盖

## 使用示例

### 完整的配置管理流程

```typescript
import { loadEnv, parseEnv, loadConfig, mergeConfig } from '@cat-kit/be'

// 1. 加载环境变量
await loadEnv({ mode: process.env.NODE_ENV })

// 2. 解析环境变量（类型安全）
const envConfig = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false },
  DATABASE_URL: { type: 'string', required: true }
})

// 3. 加载配置文件
const fileConfig = await loadConfig('./config.json', {
  defaults: { port: 3000 }
})

// 4. 合并配置（环境变量优先级最高）
const finalConfig = mergeConfig(
  fileConfig,
  { port: envConfig.PORT },
  { debug: envConfig.DEBUG }
)
```

### 多环境配置管理

```typescript
import { loadConfig, mergeConfig } from '@cat-kit/be'

// 加载基础配置
const baseConfig = await loadConfig('./config/base.json')

// 加载环境特定配置
const env = process.env.NODE_ENV || 'development'
const envConfig = await loadConfig(`./config/${env}.json`)

// 合并配置
const config = mergeConfig(baseConfig, envConfig)
```

### 配置验证

```typescript
import { loadConfig } from '@cat-kit/be'

interface AppConfig {
  port: number
  host: string
  database: {
    host: string
    port: number
  }
}

const config = await loadConfig<AppConfig>('./config.json', {
  validate: (config) => {
    // 验证端口范围
    if (config.port < 1 || config.port > 65535) {
      throw new Error('Port must be between 1 and 65535')
    }

    // 验证数据库配置
    if (!config.database?.host) {
      throw new Error('Database host is required')
    }

    if (!config.database?.port || config.database.port < 1) {
      throw new Error('Database port is required and must be positive')
    }
  }
})
```

### 环境变量类型转换

```typescript
import { parseEnv } from '@cat-kit/be'

// 复杂的环境变量配置
const config = parseEnv({
  // 数字类型
  PORT: { type: 'number', default: 3000 },

  // 布尔类型
  ENABLED: { type: 'boolean', default: false },

  // JSON 类型
  DATABASE: {
    type: 'json',
    default: { host: 'localhost', port: 5432 }
  },

  // 数组类型
  ALLOWED_ORIGINS: {
    type: 'array',
    delimiter: ';',
    default: ['http://localhost:3000']
  },

  // 自定义转换
  TIMEOUT: {
    type: (value) => {
      const timeout = parseInt(value || '5000', 10)
      if (timeout < 0) {
        throw new Error('Timeout must be non-negative')
      }
      return timeout
    },
    default: 5000
  },

  // 后处理
  API_URL: {
    type: 'string',
    transform: (value) => {
      // 移除末尾的斜杠
      return value.endsWith('/') ? value.slice(0, -1) : value
    }
  }
})
```

## 最佳实践

1. **使用环境变量管理敏感信息**：不要将敏感信息（如 API 密钥、数据库密码）提交到版本控制
2. **使用 `.env.local` 文件**：本地开发配置放在 `.env.local`，不提交到版本控制
3. **类型安全**：使用 `parseEnv` 进行类型转换和验证，避免运行时错误
4. **配置分层**：基础配置 + 环境配置 + 本地配置，便于管理
5. **配置验证**：使用 `validate` 函数验证配置的完整性和正确性
6. **默认值**：为所有配置项设置合理的默认值，提高应用的健壮性
