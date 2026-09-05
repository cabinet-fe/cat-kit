---
title: "@cat-kit/be 配置 API"
description: "parseEnvFile、loadEnv、parseEnv、loadConfig、mergeConfig 签名与选项"
---

# 配置 API

配置管理全部函数的 TypeScript 签名，类型定义以 `packages/be/dist/config/` 下的声明文件为准。

```ts
declare function parseEnvFile(content: string): EnvRecord
declare function loadEnv(options?: LoadEnvOptions): Promise<EnvRecord>
declare function parseEnv<T extends Record<string, any>>(
  schema: EnvSchema<T>,
  source?: Record<string, string | undefined>
): T

declare function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  file: string,
  options?: LoadConfigOptions<T>
): Promise<T>
declare function mergeConfig<T extends Record<string, any>>(
  ...configs: Array<Partial<T>>
): T
```

## 关键选项

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `LoadEnvOptions` | `cwd` / `mode` / `files` | 工作目录；运行模式（加载 `.env.${mode}` 系列）；自定义加载顺序 |
| `LoadEnvOptions` | `override` | 是否覆盖 `process.env` 已有值，默认 `false` |
| `LoadEnvOptions` | `injectToProcess` | 是否写入 `process.env`，默认 `true` |
| `EnvDefinition` | `type` | `'string' \| 'number' \| 'boolean' \| 'json' \| 'array'` 或自定义转换函数 |
| `EnvDefinition` | `default` / `required` | 默认值；是否必填（原始值为空即失败） |
| `EnvDefinition` | `delimiter` / `transform` | `type: 'array'` 的分隔符（默认 `','`）；类型转换后执行的回调 |
| `LoadConfigOptions` | `cwd` / `format` | 工作目录；格式 `'json' \| 'yaml' \| 'toml'`，缺省按扩展名检测 |
| `LoadConfigOptions` | `defaults` / `mergeDefaults` | 默认配置及是否深合并，`mergeDefaults` 默认 `true` |
| `LoadConfigOptions` | `parser` / `validate` | 自定义解析器（覆盖 `format`）；自定义校验（失败抛错） |

## 类型声明

签名与选项的权威定义：[env.d.ts](../../../../packages/be/dist/config/env.d.ts)、[config.d.ts](../../../../packages/be/dist/config/config.d.ts)、[merge.d.ts](../../../../packages/be/dist/config/merge.d.ts)。
