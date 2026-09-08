---
title: "@cat-kit/be 环境变量校验与多层配置合并场景"
description: 用 @cat-kit/be 实现后端服务配置流水线：loadEnv 读取 .env 文件集合，parseEnv 按 schema 校验转换，loadConfig 读取 YAML 文件，mergeConfig 合并出最终配置对象。
aliases: [配置流水线, 环境变量校验, 配置合并, env 校验]
keywords: [loadEnv, parseEnv, loadConfig, mergeConfig, EnvDefinition, required, default, transform, defaults, validate, 环境变量, schema 校验, 配置合并, 深合并, 默认值, 多环境配置, 启动校验]
---

# @cat-kit/be 环境变量校验与多层配置合并场景

本方案为后端服务搭建一条配置流水线：`loadEnv` 按优先级读入 `.env` 文件集合，`parseEnv` 用 schema 把环境变量转成带类型的配置，`loadConfig` 读取 YAML 配置文件，`mergeConfig` 把「代码默认值 → 文件配置 → 环境变量覆盖」三层合并成最终配置对象。

## 场景

- 何时用本方案：服务有多层配置来源（代码默认值、配置文件、环境变量），且希望任何缺失或非法配置在启动阶段就报错退出。
- 何时不用：只有单一 `.env` 文件且全是字符串消费时，`loadEnv` 一次即可，见 `packages/be/config/index.md`；只在运行期热更新配置时本方案无热更新能力。

## 完整示例

项目根目录准备两个文件：

```text
# .env
APP_PORT=8080
DB_HOST=postgres.internal
```

```yaml
# config/app.yaml
tls:
  enabled: true
origins:
  - https://a.example.com
```

主程序：

```ts
// src/config-loader.ts
import { loadConfig, loadEnv, mergeConfig, parseEnv } from '@cat-kit/be'

interface AppConfig {
  port: number
  dbHost: string
  tls: { enabled: boolean }
  origins: string[]
}

interface EnvVars {
  APP_PORT: number
  DB_HOST: string
}

// 第 1 层：代码默认值。任何环境都不提供时兜底。
const defaults = {
  port: 3000,
  dbHost: 'localhost',
  tls: { enabled: false },
  origins: [] as string[]
}

async function loadAppConfig(): Promise<AppConfig> {
  // 读取 .env 文件集合；injectToProcess: false 避免污染 process.env
  const raw = await loadEnv({ mode: process.env.NODE_ENV, injectToProcess: false })

  // 第 2 层：环境变量。APP_PORT 必须是数字，DB_HOST 必填，否则抛错终止启动。
  const env = parseEnv<EnvVars>({
    APP_PORT: { type: 'number', default: 3000 },
    DB_HOST: { type: 'string', required: true }
  }, raw)

  // 读取 YAML 配置文件；文件缺失会抛 ENOENT
  const fileConfig = await loadConfig<{ tls?: { enabled: boolean }; origins?: string[] }>(
    './config/app.yaml',
    {
      validate: (c) => {
        if (c.origins && !Array.isArray(c.origins)) throw new Error('origins 必须是数组')
      }
    }
  )

  // 第 3 层：环境变量覆盖文件配置。mergeConfig 深合并普通对象，数组整体替换。
  const config = mergeConfig<AppConfig>(
    defaults,
    { tls: fileConfig.tls, origins: fileConfig.origins },
    { port: env.APP_PORT, dbHost: env.DB_HOST }
  )

  return config
}

const config = await loadAppConfig()
console.log(config.port) // => 8080（.env 的 APP_PORT 覆盖默认 3000）
console.log(config.dbHost) // => 'postgres.internal'
console.log(config.tls.enabled) // => true（来自 YAML）
console.log(config.origins) // => ['https://a.example.com']
```

运行：

```bash
bun run src/config-loader.ts
```

输出：

```text
8080
postgres.internal
true
[ 'https://a.example.com' ]
```

把 `.env` 中 `APP_PORT` 改成 `8080a` 后再运行会直接抛出 `Error: Environment variable "APP_PORT" is not a number`，服务不启动。

## 要点说明

- 三层优先级由 `mergeConfig` 的参数顺序决定：越靠后优先级越高；本例顺序为默认值 → 文件 → 环境变量。
- `parseEnv` 的 `required: true` 把配置错误前移到启动阶段；`DB_HOST` 缺失时报 `Environment variable "DB_HOST" is required`，不会带病运行。
- `loadEnv({ injectToProcess: false })` 只返回聚合结果、不写 `process.env`；显式传入 `raw` 给 `parseEnv` 可让校验只作用于文件值。
- `loadConfig` 的 `validate` 在合并 `defaults` 之后执行，校验的是最终对象；抛出的错误原样向上传递并终止启动。
- `mergeConfig` 对 `tls` 这类嵌套对象逐字段合并（YAML 只写了 `enabled`，默认值对象的其他字段保留）；对 `origins` 数组整体替换，不做拼接。

## 注意事项

> [!WARNING]
> - 本库 `mergeConfig` 数组是整体替换：默认值里的 `origins` 会被文件配置的数组完全覆盖，要追加必须自行合并后再传入。
> - 本库 `parseEnv` 的 `required` 优先于 `default`：`required: true` 且值缺失时抛错，不会使用 `default`。
> - 本库 `loadEnv` 的 `.env.local` 覆盖 `.env`；`.env.${mode}.local` 覆盖其余文件，与 dotenv-cli 的部分约定不同，迁移时核对优先级。
> - 本库 `loadConfig` 按扩展名识别格式：`.yaml` / `.yml` → YAML，`.toml` → TOML，其余一律按 JSON 解析；JSON 语法错误抛 `SyntaxError`。
