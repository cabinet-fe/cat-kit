---
title: "@cat-kit/be 组合示例"
description: "组合环境变量加载、日志、缓存与文件系统工具的完整示例"
---

# @cat-kit/be 组合示例

跨主题组合使用 `@cat-kit/be` 的示例：加载并校验环境变量，构建结构化日志器，用记忆化缓存目录遍历结果，最后写出清单文件。

```ts
import {
  Logger,
  LogLevel,
  loadEnv,
  memoize,
  parseEnv,
  readDir,
  writeJson
} from '@cat-kit/be'

const raw = await loadEnv({ mode: 'production' })
const env = parseEnv({ PORT: { type: 'number', default: 3000 } }, raw)

const logger = new Logger({ level: LogLevel.INFO })
const listFiles = memoize(async (dir: string) =>
  readDir(dir, { recursive: true, onlyFiles: true })
)

const files = await listFiles('./data')
await writeJson('./output/manifest.json', { port: env.PORT, files })
await logger.info('manifest written', { count: files.length })
```

相关主题：[配置管理](config/index.md)、[日志](logger/index.md)、[缓存](cache/index.md)、[文件系统](fs/index.md)。
