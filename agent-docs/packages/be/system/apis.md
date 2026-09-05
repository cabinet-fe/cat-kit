---
title: "@cat-kit/be 系统信息 API"
description: "getCpuInfo、getCpuUsage、getMemoryInfo、getDiskInfo、getNetworkInterfaces 签名与返回结构"
---

# 系统信息 API

系统信息模块全部函数的 TypeScript 签名与返回结构，类型定义以 `packages/be/dist/system/` 下的声明文件为准。

```ts
declare function getCpuInfo(): CpuInfo
declare function getCpuUsage(interval?: number): Promise<CpuUsage>
declare function getMemoryInfo(): MemoryInfo
declare function getDiskInfo(path?: string): Promise<DiskInfo>
declare function getNetworkInterfaces(
  options?: GetNetworkInterfacesOptions
): NetworkInterfaceInfo[]
```

## 返回结构

| 类型 | 字段 |
| --- | --- |
| `CpuInfo` | `model`、`cores`、`speed`（MHz）、`loadAverage`（1/5/15 分钟元组） |
| `CpuUsage` | `user`、`system`、`idle`、`total`（毫秒）、`percent`（使用率） |
| `MemoryInfo` | `total`、`free`、`used`（字节）、`usedPercent` |
| `DiskInfo` | `path`、`total`、`free`、`used`（字节）、`usedPercent` |
| `NetworkInterfaceInfo` | `name`、`address`、`family`（`'IPv4' \| 'IPv6'`）、`mac`、`internal`、`netmask`、`cidr?` |
| `GetNetworkInterfacesOptions` | `includeInternal`（是否包含内网地址，默认 `false`） |

## 类型声明

签名与结构的权威定义：[cpu.d.ts](../../../../packages/be/dist/system/cpu.d.ts)、[memory.d.ts](../../../../packages/be/dist/system/memory.d.ts)、[disk.d.ts](../../../../packages/be/dist/system/disk.d.ts)、[network.d.ts](../../../../packages/be/dist/system/network.d.ts)。
