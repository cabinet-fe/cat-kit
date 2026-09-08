---
title: "@cat-kit/be 网络模块总览"
description: "@cat-kit/be 网络模块总览：isPortAvailable 端口可绑定探测与 getLocalIP 本机网卡 IP 获取两个工具的入口与适用边界。"
aliases: [net, 网络工具, 端口检测, 本机 IP]
keywords: [isPortAvailable, getLocalIP, PortCheckOptions, GetLocalIPOptions, host, timeout, family, includeInternal, 端口探测, 端口占用, 端口冲突, 本机 IP, 网卡地址, IPv4, IPv6]
---

# @cat-kit/be 网络模块总览

网络模块从 `@cat-kit/be` 包根导出两个函数：`isPortAvailable` 通过「尝试绑定后立即关闭」探测端口当前是否可用，`getLocalIP` 遍历本机网卡返回首个匹配条件的 IP 地址。两者仅依赖 Node.js `node:net` 与 `node:os`，无额外系统调用依赖。

## 安装

```bash
bun add @cat-kit/be
```

网络相关导出从包根导入：

```ts
import { isPortAvailable, getLocalIP } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `isPortAvailable` | 探测端口是否可绑定；可用返回 `true`，被占用或超时返回 `false` | `packages/be/net/apis.md` |
| `PortCheckOptions` | `isPortAvailable` 选项：`host`（默认 `'127.0.0.1'`）、`timeout`（默认 `1000` 毫秒） | `packages/be/net/apis.md` |
| `getLocalIP` | 获取本机网卡首个匹配的 IP；无匹配返回 `undefined` | `packages/be/net/apis.md` |
| `GetLocalIPOptions` | `getLocalIP` 选项：`family`（默认 `'IPv4'`）、`includeInternal`（默认 `false`） | `packages/be/net/apis.md` |

选型规则：启动服务前防端口冲突用 `isPortAvailable`；做服务注册、监听地址展示用 `getLocalIP`。完整签名与示例见 `packages/be/net/apis.md`。
