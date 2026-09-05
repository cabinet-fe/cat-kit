---
title: "@cat-kit/be 网络工具"
description: "端口可绑定探测与本机网卡 IP 地址获取"
---

# 网络工具

网络模块提供两个工具：`isPortAvailable` 探测端口当前是否可绑定（bind-and-close），`getLocalIP` 获取本机网卡的首个匹配 IP 地址。

```ts
import { getLocalIP, isPortAvailable } from '@cat-kit/be'

if (!(await isPortAvailable(3000))) throw new Error('port busy')
getLocalIP({ includeInternal: false })
```

详情见 [API](apis.md)。

## 约束

- 端口探测为 bind-and-close，存在竞态，不是预留
- `isPortAvailable` 的 `host` 默认 `'127.0.0.1'`，`timeout` 默认 `1000` 毫秒
- `getLocalIP` 的 `includeInternal: false` 排除 Node `address.internal`（通常 loopback），**不是**公网 IP，也不排除 RFC1918 局域网地址
- `getLocalIP` 的 `family` 取值 `'IPv4' | 'IPv6'`

## 类型声明

- [port.d.ts](../../../../packages/be/dist/net/port.d.ts) —— `isPortAvailable`、`PortCheckOptions`
- [ip.d.ts](../../../../packages/be/dist/net/ip.d.ts) —— `getLocalIP`、`GetLocalIPOptions`
