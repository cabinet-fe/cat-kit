---
title: "@cat-kit/be 系统信息"
description: "读取 CPU、内存、磁盘与网卡信息快照"
keywords:
  - getCpuInfo
  - getCpuUsage
  - getMemoryInfo
  - getDiskInfo
  - getNetworkInterfaces
  - CPU 使用率
  - 内存占用
  - 磁盘容量
  - 网卡列表
aliases:
  - 系统信息
  - system info
  - 硬件快照
  - 本机资源
---

# 系统信息

系统信息模块提供本机资源快照：`getCpuInfo`（型号、核心数、平均负载）、`getCpuUsage`（采样区间使用率）、`getMemoryInfo`（内存使用）、`getDiskInfo`（磁盘容量）、`getNetworkInterfaces`（网卡列表）。

```ts
import { getCpuUsage, getMemoryInfo } from '@cat-kit/be'

await getCpuUsage(200)
getMemoryInfo().usedPercent
```

详情见 [API](apis.md)。

## 注意事项

- `getCpuUsage` / `getDiskInfo` 为异步；`getCpuInfo` / `getMemoryInfo` / `getNetworkInterfaces` 为同步
- `getCpuUsage` 通过采样间隔（默认 500ms）内的 CPU 时间计算使用率
- `getDiskInfo` 默认查询当前工作目录所在磁盘，Windows 用 PowerShell、Unix 用 `statfs`

## 类型定义

- `getCpuInfo`、`getCpuUsage`、`CpuInfo`、`CpuUsage`
- `getMemoryInfo`、`MemoryInfo`
- `getDiskInfo`、`DiskInfo`
- `getNetworkInterfaces`、`NetworkInterfaceInfo`
