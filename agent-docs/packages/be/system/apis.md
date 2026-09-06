---
title: "@cat-kit/be 系统信息 API"
description: "getCpuInfo、getCpuUsage、getMemoryInfo、getDiskInfo、getNetworkInterfaces 签名与返回结构"
keywords:
  - getCpuInfo
  - getCpuUsage
  - getMemoryInfo
  - getDiskInfo
  - getNetworkInterfaces
  - CpuInfo
  - MemoryInfo
  - DiskInfo
  - NetworkInterfaceInfo
  - 负载平均值
aliases:
  - 系统信息 API
  - system info API
  - CPU 使用率
  - 磁盘信息
---

# 系统信息 API

系统信息模块全部函数的 TypeScript 签名与返回结构。

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
