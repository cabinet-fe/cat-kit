---
title: "@cat-kit/be 配置示例"
description: "加载环境变量、schema 校验并合并多层配置"
---

# 配置示例

典型流程：`loadEnv` 读取 `.env` 集合 → `parseEnv` 按 schema 校验转换 → `loadConfig` 读取配置文件 → `mergeConfig` 合并出最终配置。

```ts
import { loadConfig, loadEnv, mergeConfig, parseEnv } from '@cat-kit/be'

const raw = await loadEnv({ mode: 'production' })
const env = parseEnv(
  { PORT: { type: 'number', default: 3000 } },
  raw
)

const fileCfg = await loadConfig('./config.json')
const cfg = mergeConfig({ port: 3000 }, fileCfg, { port: env.PORT })
```

环境变量 schema 支持多类型与必填校验：

```ts
import { parseEnv } from '@cat-kit/be'

const config = parseEnv({
  port: { type: 'number', default: 3000 },
  debug: { type: 'boolean', default: false },
  apiKey: { type: 'string', required: true },
  hosts: { type: 'array', delimiter: ',' }
})
```

相关文档：[配置管理](index.md)、[配置 API](apis.md)。
