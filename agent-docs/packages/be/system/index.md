---
title: "@cat-kit/be 系统信息模块总览"
description: "@cat-kit/be 系统信息模块总览：读取 CPU 信息与使用率、内存占用、磁盘容量、网络接口列表五个快照函数的入口与平台差异。"
aliases: [system, 系统信息, 硬件快照, 系统监控, 本机资源]
keywords: [getCpuInfo, getCpuUsage, getMemoryInfo, getDiskInfo, getNetworkInterfaces, CpuInfo, CpuUsage, MemoryInfo, DiskInfo, NetworkInterfaceInfo, CPU 使用率, 内存占用, 磁盘容量, 网卡列表, 平均负载, 健康检查]
---

# @cat-kit/be 系统信息模块总览

系统信息模块从 `@cat-kit/be` 包根导出五个快照函数：`getCpuInfo`（型号、核心数、主频、平均负载）、`getCpuUsage`（采样一段时间算使用率）、`getMemoryInfo`（内存总量与占用）、`getDiskInfo`（指定路径所在磁盘容量）、`getNetworkInterfaces`（网卡列表）。`getCpuUsage` 与 `getDiskInfo` 为异步，其余为同步。

## 安装

```bash
bun add @cat-kit/be
```

系统信息相关导出从包根导入：

```ts
import { getCpuInfo, getCpuUsage, getMemoryInfo, getDiskInfo, getNetworkInterfaces } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `getCpuInfo` | 同步返回 CPU 型号、核心数、主频（MHz）与 1/5/15 分钟平均负载 | `packages/be/system/apis.md` |
| `CpuInfo` | `getCpuInfo` 返回结构 | `packages/be/system/apis.md` |
| `getCpuUsage` | 异步采样指定毫秒区间（默认 500ms）计算 CPU 使用率 | `packages/be/system/apis.md` |
| `CpuUsage` | `getCpuUsage` 返回结构：`user`、`system`、`idle`、`total`、`percent` | `packages/be/system/apis.md` |
| `getMemoryInfo` | 同步返回内存总量、空闲、已用（字节）与使用率 | `packages/be/system/apis.md` |
| `MemoryInfo` | `getMemoryInfo` 返回结构 | `packages/be/system/apis.md` |
| `getDiskInfo` | 异步返回指定路径（默认 `process.cwd()`）所在磁盘容量；Unix 走 `statfs`，Windows 走 PowerShell | `packages/be/system/apis.md` |
| `DiskInfo` | `getDiskInfo` 返回结构：`path`、`total`、`free`、`used`、`usedPercent` | `packages/be/system/apis.md` |
| `getNetworkInterfaces` | 同步返回本机网卡列表，可过滤内网地址 | `packages/be/system/apis.md` |
| `NetworkInterfaceInfo` | 单个网卡信息：`name`、`address`、`family`、`mac`、`internal`、`netmask`、`cidr?` | `packages/be/system/apis.md` |
| `GetNetworkInterfacesOptions` | `getNetworkInterfaces` 选项：`includeInternal`（默认 `false`） | `packages/be/system/apis.md` |

选型规则：一次性健康检查快照用 `getCpuInfo` + `getMemoryInfo`（同步零开销）；要看真实使用率窗口用 `getCpuUsage`（阻塞等待采样区间）；磁盘水位告警用 `getDiskInfo`；服务注册展示网卡用 `getNetworkInterfaces`。完整签名见 `packages/be/system/apis.md`。
