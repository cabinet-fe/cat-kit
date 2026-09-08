---
title: "@cat-kit/be 后端工具库总览"
description: Node.js 后端工具库 @cat-kit/be 的总览：文件系统、配置与环境变量、缓存、日志、网络探测、任务调度、系统信息七类工具，全部 API 从包根统一导入。
aliases: [cat-kit be, backend, 后端工具, 服务端工具, node 工具包, be 工具库]
keywords: [ensureDir, readDir, writeJson, loadEnv, parseEnv, loadConfig, mergeConfig, LRUCache, FileCache, memoize, Logger, isPortAvailable, getLocalIP, CronExpression, Scheduler, getCpuInfo, getDiskInfo, 环境变量, 定时任务, 端口探测]
---

# @cat-kit/be 后端工具库总览

`@cat-kit/be` 是运行在 Node.js / Bun 上的后端工具库（v1.2.1，纯 ESM，不可用于浏览器），提供文件系统、配置管理、缓存、日志、网络、任务调度与系统信息七类能力。全部导出从包根统一导入：

```ts
import { ensureDir, loadEnv, LRUCache, Logger, Scheduler, isPortAvailable } from '@cat-kit/be'
```

## 安装

```bash
bun add @cat-kit/be
# 或
npm install @cat-kit/be
# 或
pnpm add @cat-kit/be
```

依赖随包安装：`@cat-kit/core`、`chalk`、`js-yaml`、`smol-toml`，无需额外安装步骤。

## 模块速查

### cache 缓存

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `LRUCache` | 进程内 LRU 缓存，容量满时淘汰最久未使用项，支持 TTL | `packages/be/cache/apis.md` |
| `LRUCacheOptions` | `LRUCache` 构造选项（`maxSize`、`ttl`） | `packages/be/cache/apis.md` |
| `FileCache` | 基于文件系统的持久化缓存，支持 TTL | `packages/be/cache/apis.md` |
| `FileCacheOptions` | `FileCache` 构造选项（`dir`、`ttl`、`extension`） | `packages/be/cache/apis.md` |
| `memoize` | 函数记忆化，相同参数直接返回缓存结果 | `packages/be/cache/apis.md` |
| `MemoizeOptions` | `memoize` 选项（自定义缓存、键解析、TTL） | `packages/be/cache/apis.md` |
| `CacheAdapter` | 缓存适配器接口，用于替换 `memoize` 的缓存实现 | `packages/be/cache/apis.md` |

### config 配置

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `parseEnvFile` | 将 `.env` 文件内容解析为键值对 | `packages/be/config/apis.md` |
| `loadEnv` | 按优先级读取多个 `.env` 文件并注入 `process.env` | `packages/be/config/apis.md` |
| `LoadEnvOptions` | `loadEnv` 选项（`cwd`、`mode`、`files`、`override` 等） | `packages/be/config/apis.md` |
| `EnvRecord` | 环境变量记录类型 `Record<string, string>` | `packages/be/config/apis.md` |
| `parseEnv` | 按 schema 校验并转换环境变量为类型安全对象 | `packages/be/config/apis.md` |
| `EnvSchema` | `parseEnv` 的 schema 类型 | `packages/be/config/apis.md` |
| `EnvDefinition` | 单个环境变量的定义（类型、默认值、必填等） | `packages/be/config/apis.md` |
| `EnvValueType` | 值类型枚举 `'string' \| 'number' \| 'boolean' \| 'json' \| 'array'` | `packages/be/config/apis.md` |
| `loadConfig` | 加载并解析 JSON / YAML / TOML 配置文件 | `packages/be/config/apis.md` |
| `LoadConfigOptions` | `loadConfig` 选项（`cwd`、`format`、`defaults`、`validate` 等） | `packages/be/config/apis.md` |
| `ConfigFormat` | 配置格式 `'json' \| 'yaml' \| 'toml'` | `packages/be/config/apis.md` |
| `mergeConfig` | 深度合并多个配置对象，返回新对象 | `packages/be/config/apis.md` |

### fs 文件系统

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `readDir` | 读取目录，支持递归、过滤、只返回文件路径 | `packages/be/fs/apis.md` |
| `DirEntry` | `readDir` 返回的目录条目信息 | `packages/be/fs/apis.md` |
| `ReadDirOptions` | `readDir` 选项（`recursive`、`filter`、`onlyFiles`） | `packages/be/fs/apis.md` |
| `ensureDir` | 确保目录存在，递归创建缺失的父目录 | `packages/be/fs/apis.md` |
| `readJson` | 读取 JSON 文件并解析 | `packages/be/fs/apis.md` |
| `ReadJsonOptions` | `readJson` 选项（`encoding`、`reviver`） | `packages/be/fs/apis.md` |
| `writeJson` | 将数据序列化写入 JSON 文件，自动创建父目录 | `packages/be/fs/apis.md` |
| `WriteJsonOptions` | `writeJson` 选项（`replacer`、`space`、`eol` 等） | `packages/be/fs/apis.md` |
| `writeFile` | 增强版写文件：自动建父目录，支持流与可迭代数据 | `packages/be/fs/apis.md` |
| `WriteFileData` | `writeFile` 支持的数据类型联合 | `packages/be/fs/apis.md` |
| `WriteFileOptions` | `writeFile` 选项（`encoding`、`mode`、`flag`） | `packages/be/fs/apis.md` |
| `movePath` | 移动文件或目录，支持覆盖与跨设备回退 | `packages/be/fs/apis.md` |
| `MoveOptions` | `movePath` 选项（`overwrite`） | `packages/be/fs/apis.md` |
| `emptyDir` | 清空目录内容，保留（或创建）目录本身 | `packages/be/fs/apis.md` |
| `removePath` | 递归删除文件或目录 | `packages/be/fs/apis.md` |
| `RemoveOptions` | `removePath` 选项（`force`） | `packages/be/fs/apis.md` |
| `readFile` / `cp` / `copyFile` / `existsSync` | Node.js `node:fs` 原生函数再导出，无增强 | `packages/be/fs/apis.md` |

### logger 日志

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Logger` | 结构化日志器，支持四级日志与多传输器 | `packages/be/logger/apis.md` |
| `LoggerOptions` | `Logger` 构造选项（`level`、`format`、`transports` 等） | `packages/be/logger/apis.md` |
| `LogLevel` | 日志级别枚举 `DEBUG` / `INFO` / `WARN` / `ERROR` | `packages/be/logger/apis.md` |
| `LogFormat` | 日志格式 `'text' \| 'json'` | `packages/be/logger/apis.md` |
| `LogEntry` | 结构化日志条目 | `packages/be/logger/apis.md` |
| `TextFormatConfig` | text 格式模板字符串或格式化函数 | `packages/be/logger/apis.md` |
| `TextFormatVars` | 格式化回调收到的变量对象 | `packages/be/logger/apis.md` |
| `TextFormatter` | text 格式化函数类型 | `packages/be/logger/apis.md` |
| `Transport` | 传输器接口，自定义日志输出目标 | `packages/be/logger/apis.md` |
| `ConsoleTransport` | 控制台传输器，带级别配色 | `packages/be/logger/apis.md` |
| `ConsoleTransportOptions` | `ConsoleTransport` 选项（`useColors`、`level`） | `packages/be/logger/apis.md` |
| `FileTransport` | 文件传输器，支持按大小轮转与按日期分文件 | `packages/be/logger/apis.md` |
| `FileTransportOptions` | `FileTransport` 选项（`path`、`maxSize`、`newline` 等） | `packages/be/logger/apis.md` |

### net 网络

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `isPortAvailable` | 探测端口当前是否可绑定 | `packages/be/net/apis.md` |
| `PortCheckOptions` | `isPortAvailable` 选项（`host`、`timeout`） | `packages/be/net/apis.md` |
| `getLocalIP` | 获取本机网卡的首个匹配 IP 地址 | `packages/be/net/apis.md` |
| `GetLocalIPOptions` | `getLocalIP` 选项（`family`、`includeInternal`） | `packages/be/net/apis.md` |

### scheduler 任务调度

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Scheduler` | 任务调度器：Cron、延迟执行、周期任务 | `packages/be/scheduler/apis.md` |
| `TaskInfo` | 任务运行信息（`id`、`type`、`nextRun`、`running`） | `packages/be/scheduler/apis.md` |
| `TaskFunction` | 任务函数类型 `() => void \| Promise<void>` | `packages/be/scheduler/apis.md` |
| `CronExpression` | 5 位 Cron 表达式解析器，查询下次执行时间 | `packages/be/scheduler/apis.md` |
| `parseCron` | `new CronExpression(expression)` 的便捷函数 | `packages/be/scheduler/apis.md` |
| `CronFieldConfig` | Cron 字段取值范围配置 | `packages/be/scheduler/apis.md` |

### system 系统信息

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `getCpuInfo` | CPU 型号、核心数、主频与平均负载 | `packages/be/system/apis.md` |
| `CpuInfo` | `getCpuInfo` 返回结构 | `packages/be/system/apis.md` |
| `getCpuUsage` | 采样一段时间计算 CPU 使用率 | `packages/be/system/apis.md` |
| `CpuUsage` | `getCpuUsage` 返回结构 | `packages/be/system/apis.md` |
| `getMemoryInfo` | 系统内存总量、空闲、已用与使用率 | `packages/be/system/apis.md` |
| `MemoryInfo` | `getMemoryInfo` 返回结构 | `packages/be/system/apis.md` |
| `getDiskInfo` | 指定路径所在磁盘的容量信息 | `packages/be/system/apis.md` |
| `DiskInfo` | `getDiskInfo` 返回结构 | `packages/be/system/apis.md` |
| `getNetworkInterfaces` | 本机网络接口列表 | `packages/be/system/apis.md` |
| `NetworkInterfaceInfo` | 单个网络接口信息 | `packages/be/system/apis.md` |
| `GetNetworkInterfacesOptions` | `getNetworkInterfaces` 选项（`includeInternal`） | `packages/be/system/apis.md` |

跨模块组合的端到端示例见 `packages/be/examples.md`。
