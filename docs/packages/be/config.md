# 配置管理

配置管理模块提供了环境变量加载、配置文件解析和配置合并等功能。

## 环境变量

### loadEnv

加载 `.env` 文件集合，支持多环境配置。

```typescript
import { loadEnv } from '@cat-kit/be'

// 加载默认环境变量
const env = await loadEnv()
// 加载顺序：.env -> .env.local -> .env.{mode} -> .env.{mode}.local

// 指定运行模式
const env = await loadEnv({
  mode: 'production'
})
// 加载顺序：.env -> .env.local -> .env.production -> .env.production.local

// 自定义文件列表
const env = await loadEnv({
  files: ['.env', '.env.custom']
})

// 不写入 process.env
const env = await loadEnv({
  injectToProcess: false
})

// 覆盖已存在的环境变量
const env = await loadEnv({
  override: true
})
```

#### API

```typescript
function loadEnv(options?: LoadEnvOptions): Promise<EnvRecord>
```

**参数：**

- `options.cwd` - 工作目录，默认 `process.cwd()`
- `options.mode` - 运行模式（如 `development`、`production`）
- `options.files` - 自定义文件列表，覆盖默认加载顺序
- `options.override` - 是否覆盖 `process.env` 中已有的值，默认 `false`
- `options.injectToProcess` - 是否写入 `process.env`，默认 `true`

**返回值：**

- `Promise<EnvRecord>` - 环境变量键值对对象

**文件加载顺序：**

1. `.env`
2. `.env.local`
3. `.env.{mode}`（如果指定了 mode）
4. `.env.{mode}.local`（如果指定了 mode）

### parseEnv

根据 schema 校验并转换环境变量，提供类型安全的环境变量访问。

```typescript
import { parseEnv } from '@cat-kit/be'

// 基础类型转换
const config = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false },
  API_KEYS: { type: 'array', delimiter: ',' }
})

// JSON 类型
const config = parseEnv({
  DATABASE_CONFIG: {
    type: 'json',
    default: { host: 'localhost', port: 5432 }
  }
})

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

// 使用 transform
const config = parseEnv({
  API_URL: {
    type: 'string',
    transform: (value) => value.endsWith('/') ? value.slice(0, -1) : value
  }
})
```

#### API

```typescript
function parseEnv<T extends Record<string, any>>(
  schema: EnvSchema<T>,
  source?: Record<string, string | undefined>
): T
```

**参数：**

- `schema` - 环境变量定义 schema
- `source` - 数据源，默认 `process.env`

**返回值：**

- `T` - 转换后的类型安全结果

**Schema 定义：**

```typescript
interface EnvDefinition<T> {
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array' | ((value: string | undefined, key: string) => T)
  default?: T
  required?: boolean
  delimiter?: string // 仅用于 array 类型
  transform?: (value: T, key: string) => T
}
```

**支持的类型：**

- `'string'` - 字符串（默认）
- `'number'` - 数字
- `'boolean'` - 布尔值（`'true'`, `'1'`, `'yes'`, `'on'` 为 `true`）
- `'json'` - JSON 字符串解析
- `'array'` - 数组（使用 `delimiter` 分隔，默认 `','`）
- 自定义函数 - 自定义转换逻辑

**异常：**

- 当 `required` 字段缺失时抛出错误
- 当类型转换失败时抛出错误

### parseEnvFile

解析 `.env` 文件内容为键值对。

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

#### API

```typescript
function parseEnvFile(content: string): EnvRecord
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

加载并解析配置文件，支持 JSON、YAML 和 TOML 格式。

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
  }
})
```

#### API

```typescript
function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  filePath: string,
  options?: LoadConfigOptions<T>
): Promise<T>
```

**参数：**

- `filePath` - 配置文件路径（相对或绝对路径）
- `options.cwd` - 工作目录，默认 `process.cwd()`
- `options.format` - 文件格式：`'json'` | `'yaml'` | `'toml'`，默认根据文件扩展名自动检测
- `options.defaults` - 默认配置值
- `options.parser` - 自定义解析器函数
- `options.validate` - 配置验证函数
- `options.mergeDefaults` - 是否与 defaults 深度合并，默认 `true`

**返回值：**

- `Promise<T>` - 解析后的配置对象

**支持的格式：**

- `.json` - JSON 格式（内置支持）
- `.yaml` / `.yml` - YAML 格式（需要 `js-yaml`）
- `.toml` - TOML 格式（需要 `smol-toml`）

**异常：**

- 当可选依赖未安装时，会抛出 `PeerDependencyError`

### mergeConfig

深度合并多个配置对象。

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

#### API

```typescript
function mergeConfig<T extends Record<string, any>>(
  ...configs: Array<Partial<T>>
): T
```

**参数：**

- `...configs` - 待合并的配置对象数组

**返回值：**

- `T` - 合并后的新对象

**合并规则：**

- 对象属性深度合并
- 数组会被替换（不合并）
- 基本类型会被覆盖

## 使用示例

### 应用配置管理

```typescript
import { loadEnv, parseEnv, loadConfig } from '@cat-kit/be'

// 1. 加载环境变量
await loadEnv({ mode: process.env.NODE_ENV })

// 2. 解析环境变量
const envConfig = parseEnv({
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false }
})

// 3. 加载配置文件
const fileConfig = await loadConfig('./config.json', {
  defaults: { port: 3000 }
})

// 4. 合并配置
const finalConfig = {
  ...fileConfig,
  ...envConfig
}
```

### 多环境配置

```typescript
import { loadConfig, mergeConfig } from '@cat-kit/be'

// 加载基础配置
const baseConfig = await loadConfig('./config/base.json')

// 加载环境特定配置
const envConfig = await loadConfig(`./config/${process.env.NODE_ENV}.json`)

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
    if (config.port < 1 || config.port > 65535) {
      throw new Error('Port must be between 1 and 65535')
    }
    if (!config.database.host) {
      throw new Error('Database host is required')
    }
  }
})
```

