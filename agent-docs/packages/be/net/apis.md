---
title: "@cat-kit/be 网络 API"
description: "isPortAvailable、getLocalIP 签名与选项"
---

# 网络 API

网络模块两个函数的 TypeScript 签名，类型定义以 `packages/be/dist/net/` 下的声明文件为准。

```ts
declare function isPortAvailable(
  port: number,
  options?: PortCheckOptions
): Promise<boolean>

declare function getLocalIP(options?: GetLocalIPOptions): string | undefined
```

## 关键选项

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `PortCheckOptions` | `host` | 探测绑定的主机地址，默认 `'127.0.0.1'` |
| `PortCheckOptions` | `timeout` | 超时时间（毫秒），默认 `1000` |
| `GetLocalIPOptions` | `family` | 地址族 `'IPv4' \| 'IPv6'`，默认 `'IPv4'` |
| `GetLocalIPOptions` | `includeInternal` | 是否包含内网地址，默认 `false` |

## 类型声明

签名与选项的权威定义：[port.d.ts](../../../../packages/be/dist/net/port.d.ts)、[ip.d.ts](../../../../packages/be/dist/net/ip.d.ts)。
