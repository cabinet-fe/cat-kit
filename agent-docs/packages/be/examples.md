---
title: "@cat-kit/be 应用配置加载与定时巡检场景"
description: 用 @cat-kit/be 搭建服务启动流程：loadEnv 与 parseEnv 校验环境变量，loadConfig 与 mergeConfig 合并配置，FileTransport 落盘日志，memoize 加速目录清单，Scheduler 定时输出系统快照。
aliases: [组合示例, 服务启动配置, 综合场景, 启动流程]
keywords: [loadEnv, parseEnv, loadConfig, mergeConfig, Logger, LogLevel, FileTransport, memoize, Scheduler, interval, FileCache, writeJson, getMemoryInfo, 环境变量校验, 配置合并, 定时巡检, 日志落盘, 记忆化]
---

# @cat-kit/be 应用配置加载与定时巡检场景

本方案用一个可运行的 Node.js 程序串联 `@cat-kit/be` 的五个模块：启动时用 `loadEnv` / `parseEnv` 加载并校验环境变量，用 `loadConfig` / `mergeConfig` 合并配置文件，用 `Logger` + `FileTransport` 写结构化日志，用 `memoize` 缓存目录清单，最后用 `Scheduler` 周期输出内存快照并写入 `FileCache`。

## 场景

- 何时用本方案：服务进程需要在启动时读取 `.env` 与配置文件、输出文件日志、按固定周期巡检系统资源。
- 何时不用：只需要单一模块时直接读对应文档——纯文件操作用 `packages/be/fs/index.md`，只解析环境变量用 `packages/be/config/index.md`，只配日志用 `packages/be/logger/index.md`。

## 完整示例

项目根目录准备两个文件：

```text
# .env
APP_PORT=8080
APP_DEBUG=true
DATA_DIR=./data
```

```yaml
# config/app.yaml
logLevel: info
cacheDir: ./.cache
```

主程序：

```ts
// src/main.ts
import {
  FileCache,
  FileTransport,
  Logger,
  LogLevel,
  Scheduler,
  getMemoryInfo,
  loadConfig,
  loadEnv,
  memoize,
  mergeConfig,
  parseEnv,
  readDir,
  writeJson
} from '@cat-kit/be'

interface AppConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  cacheDir: string
}

// 1. 读取 .env（injectToProcess 默认 true，进程内后续读 process.env 也能拿到）
const rawEnv = await loadEnv({ mode: process.env.NODE_ENV })

// 2. 按 schema 校验并转换；失败会抛出 Error，启动即失败
const env = parseEnv({
  APP_PORT: { type: 'number', default: 3000 },
  APP_DEBUG: { type: 'boolean', default: false },
  DATA_DIR: { type: 'string', required: true }
}, rawEnv)

// 3. 读取 YAML 配置并与代码内默认值深合并
const fileConfig = await loadConfig<AppConfig>('./config/app.yaml')
const config = mergeConfig<AppConfig>(
  { logLevel: 'info', cacheDir: './.cache' },
  fileConfig
)

// 4. 日志同时输出到控制台与文件（目录模式：按日期命名文件）
const logger = new Logger({
  level: LogLevel.INFO,
  format: 'json',
  transports: [new FileTransport({ path: './logs' })]
})

// 5. 记忆化目录清单：相同目录的重复扫描直接命中缓存
const listFiles = memoize(
  async (dir: string) => readDir(dir, { recursive: true, onlyFiles: true }),
  { ttl: 60_000 }
)
const files = await listFiles(env.DATA_DIR)

// 6. 清单写入磁盘缓存目录
const cache = new FileCache<string[]>({ dir: config.cacheDir, ttl: 3_600_000 })
await cache.set('manifest', files)
await writeJson('./manifest.json', { port: env.APP_PORT, fileCount: files.length })

await logger.info('service started', { port: env.APP_PORT, fileCount: files.length })

// 7. 每 60 秒巡检一次内存；任务抛错不会中断调度
const scheduler = new Scheduler()
scheduler.interval('memory-report', 60_000, () => {
  const memory = getMemoryInfo()
  logger.info('memory report', { usedPercent: memory.usedPercent })
})
scheduler.start()

// 进程退出前停止调度并清空缓存目录中的过期项
process.on('SIGINT', () => {
  scheduler.stop()
  void logger.warn('service stopped')
})
```

运行：

```bash
bun run src/main.ts
```

`./logs/2026-09-08.log`（按当天日期命名）中出现 JSON 行日志；`./manifest.json` 写入端口与文件数；进程内每 60 秒输出一次内存巡检日志。

## 要点说明

- `parseEnv` 在 `DATA_DIR` 缺失时抛出 `Environment variable "DATA_DIR" is required`，把配置错误拦在启动阶段，而不是运行中途。
- `mergeConfig` 逐层深合并普通对象；数组整体替换而不是拼接，`cacheDir` 这类标量直接被文件配置覆盖。
- `new Logger({ format: 'json' })` 配合 `FileTransport({ path: './logs' })`：`path` 无扩展名时按目录模式处理，日志文件名为 `yyyy-MM-dd.log`。
- `memoize` 的 `ttl` 以毫秒计，60_000 表示单条缓存 60 秒；过期后下一次调用重新执行原函数。
- `scheduler.interval` 的任务抛错时被调度器捕获并 `console.error`，调度继续；`scheduler.stop()` 清掉全部定时器，任务定义保留，可再次 `start()`。

## 注意事项

> [!WARNING]
> - `loadEnv` 默认把变量写入 `process.env` 且不覆盖已有值；要拿到纯解析结果不污染进程，传 `injectToProcess: false`。
> - `mergeConfig` 返回新对象，数组是整体替换；要拼接数组必须先取出旧数组自行合并。
> - `Logger` 默认级别是 `LogLevel.INFO`，不是 `DEBUG`；`logger.debug()` 在默认配置下不输出。
> - `Scheduler` 的 `start()` 必须调用；只注册任务不启动不会执行。
> - Cron 任务（`schedule`）的定时器已 `unref`，不阻止进程退出；`interval` 与 `once` 任务的定时器会阻止进程退出。
