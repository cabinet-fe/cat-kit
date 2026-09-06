---
title: "@cat-kit/be 包概览"
description: "Node.js 后端工具包总览：文件系统、配置、缓存、日志、网络、任务调度与系统信息"
keywords:
  - 后端工具
  - Node.js 工具库
  - 文件系统
  - 环境变量
  - 缓存
  - 日志
  - 定时任务
  - 服务器信息
aliases:
  - backend
  - 服务端工具
  - node 工具包
---

# @cat-kit/be 包概览

`@cat-kit/be` 是 Node.js 专用后端工具包（兼容支持 `node:` 协议的 Bun），提供文件系统、配置管理、缓存、日志、网络、任务调度与系统信息七类能力。所有 API 从包根统一导入，不要在浏览器代码中使用。

**导入**：

```ts
import { ensureDir, loadEnv, LRUCache, Logger, Scheduler } from '@cat-kit/be'
```

## 主题

| 主题 | 说明 |
| --- | --- |
| [文件系统](fs/index.md) | 目录遍历、读写 JSON/文件、移动、清空与删除 |
| [配置管理](config/index.md) | `.env` 解析、环境变量校验、JSON/YAML/TOML 配置加载与合并 |
| [缓存](cache/index.md) | 进程内 LRU、磁盘文件缓存、函数记忆化 |
| [日志](logger/index.md) | 分级结构化日志，控制台 / 文件多 Transport |
| [网络](net/index.md) | 端口可用性探测、本机 IP 地址 |
| [任务调度](scheduler/index.md) | Cron 表达式、延迟执行、周期任务 |
| [系统信息](system/index.md) | CPU、内存、磁盘、网卡快照 |
| [组合示例](examples.md) | 跨主题组合使用 |
