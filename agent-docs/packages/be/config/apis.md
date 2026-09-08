---
title: "@cat-kit/be 配置 API（loadEnv parseEnv loadConfig mergeConfig）"
description: "@cat-kit/be 配置模块 API 参考：parseEnvFile 解析 .env 文本、loadEnv 多文件加载、parseEnv schema 校验、loadConfig 读取 JSON/YAML/TOML、mergeConfig 深度合并。"
aliases: [配置 API, 环境变量校验, dotenv, config loader, 深合并]
keywords: [parseEnvFile, loadEnv, parseEnv, loadConfig, mergeConfig, EnvRecord, LoadEnvOptions, EnvDefinition, EnvSchema, EnvValueType, ConfigFormat, LoadConfigOptions, 环境变量, schema 校验, 配置加载, 深度合并, 默认值, 必填校验, 类型转换]
---

# @cat-kit/be 配置 API（loadEnv parseEnv loadConfig mergeConfig）

`@cat-kit/be` 导出五个配置函数：`parseEnvFile` 解析 `.env` 文本，`loadEnv` 按优先级读取 `.env` 文件集合，`parseEnv` 按 schema 校验并转换环境变量，`loadConfig` 加载 JSON / YAML / TOML 配置文件，`mergeConfig` 深度合并配置对象。除 `parseEnv` 与 `parseEnvFile` 为同步外，其余均为异步。

## 快速上手

```ts
import { parseEnv } from '@cat-kit/be'

const config = parseEnv({
  PORT: { type: 'number', default: 3000 },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: { type: 'string', required: true }
})

console.log(config.PORT) // => 3000（process.env.PORT 未设置时取 default）
// process.env.API_KEY 未设置时抛出 Error('Environment variable "API_KEY" is required')
```

## API 签名

```ts
export type EnvRecord = Record<string, string>

export interface LoadEnvOptions {
  /** 工作目录。默认 process.cwd() */
  cwd?: string
  /** 运行模式；指定后追加加载 .env.${mode} 与 .env.${mode}.local */
  mode?: string
  /** 自定义加载文件列表（相对 cwd），指定后忽略默认文件序列 */
  files?: string[]
  /** 是否覆盖 process.env 中已有的值。默认 false */
  override?: boolean
  /** 是否把解析结果写入 process.env。默认 true */
  injectToProcess?: boolean
}

/** 解析 .env 文本。支持 KEY=v、export KEY=v、单双引号值、# 注释行与行内注释 */
export function parseEnvFile(content: string): EnvRecord

/** 按优先级读取 .env 文件集合；缺失的文件跳过；返回聚合结果 */
export function loadEnv(options?: LoadEnvOptions): Promise<EnvRecord>

export type EnvValueType = 'string' | 'number' | 'boolean' | 'json' | 'array'

export interface EnvDefinition<T = any> {
  /** 转换类型，或自定义转换函数 (value, key) => T。默认 'string' */
  type?: EnvValueType | ((value: string | undefined, key: string) => T)
  /** 原始值缺失或为空串时的默认值 */
  default?: T
  /** 是否必填；原始值缺失或为空串时抛错（优先于 default） */
  required?: boolean
  /** type 为 'array' 时的分隔符。默认 ',' */
  delimiter?: string
  /** 值转换函数，在类型转换之后执行 */
  transform?: (value: T, key: string) => T
}

export type EnvSchema<T extends Record<string, any>> = {
  [K in keyof T]: EnvDefinition<T[K]>
}

/** 按 schema 校验并转换环境变量。source 默认 process.env */
export function parseEnv<T extends Record<string, any>>(
  schema: EnvSchema<T>,
  source?: Record<string, string | undefined>
): T

export type ConfigFormat = 'json' | 'yaml' | 'toml'

export interface LoadConfigOptions<T extends Record<string, unknown>> {
  /** 工作目录。默认 process.cwd() */
  cwd?: string
  /** 配置格式；不指定时按文件扩展名推断（.yaml/.yml → yaml，.toml → toml，其余 → json） */
  format?: ConfigFormat
  /** 默认配置，与文件配置合并 */
  defaults?: Partial<T>
  /** 自定义解析器；提供后忽略 format */
  parser?: (source: string) => T | Promise<T>
  /** 自定义校验；校验失败直接抛出错误 */
  validate?: (config: T) => void
  /** 是否与 defaults 深度合并；false 时用 Object.assign 浅覆盖。默认 true */
  mergeDefaults?: boolean
}

export function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  filePath: string,
  options?: LoadConfigOptions<T>
): Promise<T>

/** 深度合并多个配置对象；后面的覆盖前面的；数组整体替换；返回新对象 */
export function mergeConfig<T extends Record<string, any>>(
  ...configs: Array<Partial<T>>
): T
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `cwd`（loadEnv / loadConfig） | `string` | `process.cwd()` | 否 | 相对路径基于它解析 |
| `mode` | `string` | 无 | 否 | 如 `'production'`；追加 `.env.production` 与 `.env.production.local` 两个文件 |
| `files` | `string[]` | 无 | 否 | 非空时完全替代默认文件序列，按数组顺序加载 |
| `override` | `boolean` | `false` | 否 | `false` 时 `process.env` 已有的键不覆盖；返回值仍为文件值 |
| `injectToProcess` | `boolean` | `true` | 否 | `false` 时只返回解析结果，不写 `process.env` |
| `type` | `EnvValueType` 或函数 | `'string'` | 否 | `'boolean'`：`'true'/'1'/'yes'/'on'`（不分大小写）为 `true`，其余为 `false`；`'number'`：`NaN` 抛错；`'json'`：`JSON.parse` 失败抛错；`'array'`：按 `delimiter` 分割、逐项 trim、滤掉空项 |
| `default` | `T` | 无 | 否 | 原始值为 `undefined`、空串时生效；`required: true` 时优先抛错 |
| `required` | `boolean` | `false` | 否 | 原始值缺失或为空串时抛 `Error('Environment variable "KEY" is required')` |
| `delimiter` | `string` | `','` | 否 | 仅 `type: 'array'` 时使用 |
| `transform` | `(value, key) => T` | 无 | 否 | 类型转换后执行，可再加工 |
| `format` | `ConfigFormat` | 按扩展名推断 | 否 | 无扩展名或未知扩展名按 `json` 解析 |
| `defaults` | `Partial<T>` | 无 | 否 | 与解析结果合并；`mergeDefaults: true` 时深合并，否则浅覆盖 |
| `mergeDefaults` | `boolean` | `true` | 否 | `false` 时执行 `Object.assign({}, defaults, parsed)` |
| `parser` | `(source: string) => T \| Promise<T>` | 无 | 否 | 提供后忽略 `format`，整段文本交给它解析 |
| `validate` | `(config: T) => void` | 无 | 否 | 在合并完成后调用；内部抛出的错误原样向上抛 |
| `mergeConfig` 的 `configs` | `Array<Partial<T>>` | 无 | 是 | `null` / `undefined` 项跳过；数组整体替换不拼接；嵌套普通对象递归合并 |

## 典型示例

### loadEnv 与 parseEnv 组合校验

```ts
import { loadEnv, parseEnv } from '@cat-kit/be'

// 默认顺序：.env → .env.local → .env.${mode} → .env.${mode}.local
const raw = await loadEnv({ mode: 'production', injectToProcess: false })

interface Env {
  PORT: number
  HOSTS: string[]
  META: { replicas: number }
  TOKEN: string
}

const env = parseEnv<Env>(
  {
    PORT: { type: 'number', default: 3000 },
    HOSTS: { type: 'array', delimiter: ',' },
    META: { type: 'json', default: { replicas: 1 } },
    TOKEN: { type: 'string', required: true }
  },
  raw
)

console.log(env.PORT) // => 3000
console.log(env.HOSTS) // => ['a.example.com', 'b.example.com']（HOSTS=a.example.com,b.example.com）
try {
  parseEnv({ TOKEN: { type: 'string', required: true } }, {})
} catch (err) {
  console.log((err as Error).message) // => 'Environment variable "TOKEN" is required'
}
```

### loadConfig 加载 YAML 并校验

```ts
import { loadConfig } from '@cat-kit/be'

interface AppConfig {
  port: number
  db: { host: string; name: string }
}

const config = await loadConfig<AppConfig>('./config/app.yaml', {
  defaults: { port: 3000, db: { host: 'localhost', name: 'app' } },
  validate: (c) => {
    if (c.port <= 0 || c.port > 65535) throw new Error('port 取值须为 1~65535')
  }
})

console.log(config.db.host) // => 'localhost'（文件未写 db 时取 defaults）
// 文件不存在时 readFile 抛 ENOENT；YAML 语法错误时 js-yaml 抛出解析错误
```

### mergeConfig 合并多层配置

```ts
import { mergeConfig } from '@cat-kit/be'

interface ServerConfig {
  port: number
  tls: { enabled: boolean; cert?: string }
  origins: string[]
}

const merged = mergeConfig<ServerConfig>(
  { port: 3000, tls: { enabled: false }, origins: ['a.com'] },
  { tls: { enabled: true }, origins: ['b.com'] }
)

console.log(merged) // => { port: 3000, tls: { enabled: true }, origins: ['b.com'] }
console.log(merged.tls.enabled) // => true（嵌套对象深合并）
console.log(merged.origins) // => ['b.com']（数组整体替换，不是拼接）
```

## 注意事项

> [!WARNING]
> - 本库 `loadEnv` 中 `.env.local` 优先于 `.env`（后加载覆盖先加载）；未指定 `files` 且指定 `mode` 时加载 `.env` → `.env.local` → `.env.${mode}` → `.env.${mode}.local` 四个文件。
> - 本库 `parseEnv` 的 `required: true` 优先于 `default`：原始值缺失时直接抛错，不会回落到 `default`。
> - 本库 `mergeConfig` 的数组是整体替换，不是 `lodash.merge` 风格的按下标合并。
> - 本库 `parseEnv` 的 `'boolean'` 转换只认 `'true'/'1'/'yes'/'on'`（不区分大小写）为 `true`，其余任何字符串（包括 `'false'`、`'0'`、`'no'`）一律转为 `false`。
> - YAML / TOML 解析通过动态 `import('js-yaml')` / `import('smol-toml')` 完成；模块缺失时抛出错误，原文为 `可选依赖 "js-yaml" 未安装，请运行 "bun add js-yaml" 后重试。`。

## 常见问题

### 报错 `Environment variable "API_KEY" is required`

原因：`parseEnv` 的 schema 把 `API_KEY` 标为 `required`，而数据源中该键缺失或为空串。修复：在环境中补齐变量，或补齐 `.env` 文件。

```bash
# .env
API_KEY=sk-123456
```

```ts
import { parseEnv } from '@cat-kit/be'

const env = parseEnv({ API_KEY: { type: 'string', required: true } })
console.log(env.API_KEY) // => 'sk-123456'
```

### 报错 `Environment variable "PORT" is not a number`

原因：`type: 'number'` 时 `Number(value)` 结果为 `NaN`（如 `PORT=8080a`）。修复：修正变量值，或改用自定义转换函数兜底。

```ts
import { parseEnv } from '@cat-kit/be'

const env = parseEnv({
  PORT: {
    type: (value, key) => {
      const num = Number(value)
      if (Number.isNaN(num)) throw new Error(`Environment variable "${key}" is not a number`)
      return num
    },
    default: 3000
  }
})
console.log(env.PORT) // => 3000
```
