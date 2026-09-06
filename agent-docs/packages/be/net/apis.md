---
title: "@cat-kit/be 网络 API"
description: "isPortAvailable、getLocalIP 签名与选项"
keywords:
  - isPortAvailable
  - getLocalIP
  - PortCheckOptions
  - GetLocalIPOptions
  - 端口探测
  - 端口占用
  - 本机 IP
  - 本机地址
aliases:
  - 网络 API
  - net API
  - 端口检测
  - getLocalIp
---

# 网络 API

网络模块两个函数的 TypeScript 签名。

```ts
declare function isPortAvailable(
  port: number,
  options?: PortCheckOptions
): Promise<boolean>

declare function getLocalIP(options?: GetLocalIPOptions): string | undefined
```

## 参数说明

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `PortCheckOptions` | `host` | 探测绑定的主机地址，默认 `'127.0.0.1'` |
| `PortCheckOptions` | `timeout` | 超时时间（毫秒），默认 `1000` |
| `GetLocalIPOptions` | `family` | 地址族 `'IPv4' \| 'IPv6'`，默认 `'IPv4'` |
| `GetLocalIPOptions` | `includeInternal` | 是否包含内网地址，默认 `false` |
