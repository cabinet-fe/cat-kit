---
title: "@cat-kit/be 网络 API（isPortAvailable getLocalIP）"
description: "@cat-kit/be 网络模块 API 参考：isPortAvailable 端口可绑定探测（异步、可配 host 与超时）与 getLocalIP 本机网卡 IP 获取（可配地址族与内网过滤）。"
aliases: [网络 API, 端口检测 API, 本机 IP API, 端口占用检查]
keywords: [isPortAvailable, getLocalIP, PortCheckOptions, GetLocalIPOptions, host, timeout, family, includeInternal, IPv4, IPv6, 端口探测, 端口占用, 端口冲突, 本机 IP, 内网地址, 服务注册]
---

# @cat-kit/be 网络 API（isPortAvailable getLocalIP）

`@cat-kit/be` 导出两个网络函数：`isPortAvailable(port, options?)` 异步探测端口是否可绑定，返回 `Promise<boolean>`；`getLocalIP(options?)` 同步获取本机网卡首个匹配 IP，返回 `string | undefined`。

## 快速上手

```ts
import { isPortAvailable } from '@cat-kit/be'

async function startServer(preferred: number): Promise<void> {
  if (await isPortAvailable(preferred)) {
    console.log(`端口 ${preferred} 可用`) // => 端口 3000 可用
  } else {
    console.log(`端口 ${preferred} 已被占用或探测超时`)
  }
}

void startServer(3000)
```

## API 签名

```ts
export interface PortCheckOptions {
  /** 绑定探测的主机地址。默认 '127.0.0.1' */
  host?: string
  /** 探测超时（毫秒），超时按不可用处理。默认 1000 */
  timeout?: number
}

/**
 * 探测端口当前是否可绑定：在 host:port 上创建服务器，
 * 监听成功后立即关闭并返回 true；绑定失败或超时返回 false。
 */
export function isPortAvailable(port: number, options?: PortCheckOptions): Promise<boolean>

export interface GetLocalIPOptions {
  /** 地址族。默认 'IPv4' */
  family?: 'IPv4' | 'IPv6'
  /** 是否包含内网地址。默认 false（排除 internal 地址） */
  includeInternal?: boolean
}

/** 遍历全部网卡，返回首个匹配条件的 IP；无匹配返回 undefined */
export function getLocalIP(options?: GetLocalIPOptions): string | undefined
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `port` | `number` | — | 是 | 目标端口号，1~65535；`0` 由系统分配后立即关闭，结果无意义 |
| `host` | `string` | `'127.0.0.1'` | 否 | 探测绑定地址；查所有网卡可达性传 `'0.0.0.0'` |
| `timeout` | `number` | `1000` | 否 | 毫秒；超时的定时器已 `unref`，不阻止进程退出 |
| `family` | `'IPv4' \| 'IPv6'` | `'IPv4'` | 否 | 只返回该地址族的地址 |
| `includeInternal` | `boolean` | `false` | 否 | Node `address.internal` 标记（loopback 等）是否纳入结果 |

## 典型示例

### 端口被占用时自动换端口

```ts
import { isPortAvailable } from '@cat-kit/be'

async function findAvailablePort(start: number, attempts: number): Promise<number> {
  for (let offset = 0; offset < attempts; offset++) {
    const port = start + offset
    // 检测 0.0.0.0，覆盖绑定到全部网卡的占用者
    if (await isPortAvailable(port, { host: '0.0.0.0', timeout: 2000 })) {
      return port
    }
  }
  throw new Error(`连续 ${attempts} 个端口均不可用（起始 ${start}）`)
}

const port = await findAvailablePort(3000, 10)
console.log(port) // => 3000（可用时）；被占用时依次尝试 3001、3002 …
```

### 获取本机 IP 拼服务注册地址

```ts
import { getLocalIP } from '@cat-kit/be'

// 排除 loopback 的首个 IPv4
const ip = getLocalIP({ family: 'IPv4' })
if (ip === undefined) {
  throw new Error('本机没有可用的 IPv4 网卡地址')
}
console.log(`http://${ip}:3000`) // => 'http://192.168.1.23:3000'

// 调试场景：连 loopback 也要列出来
const anyIp = getLocalIP({ includeInternal: true })
console.log(anyIp) // => '127.0.0.1'（只有 loopback 网卡的机器上）
```

## 注意事项

> [!WARNING]
> - 本库 `isPortAvailable` 是「绑定后立即关闭」式探测，关闭到真正监听之间存在竞态窗口：探测通过不代表后续 `listen` 一定成功，不是端口预留。
> - 本库 `isPortAvailable` 探测失败返回 `false`，不抛错、不区分「被占用」与「超时」两种失败原因。
> - 本库 `getLocalIP` 的 `includeInternal: false` 过滤的是 Node 标记为 `internal` 的地址（loopback）；返回的第一个外部地址多为局域网 IP，不是公网 IP。
> - 本库 `getLocalIP` 按系统网卡枚举顺序返回第一个匹配项，不提供按网卡名筛选；要指定网卡改用 `node:os` 的 `networkInterfaces()` 自行过滤。

## 常见问题

### 探测返回 `false` 但没有进程监听该端口

原因：`host` 指向的地址与占用者的绑定地址不匹配，或探测在 `timeout` 内未完成。修复：改用 `'0.0.0.0'` 探测 IPv4 全网卡占用，并放宽 `timeout`。

```ts
import { isPortAvailable } from '@cat-kit/be'

const usable = await isPortAvailable(5432, { host: '0.0.0.0', timeout: 5000 })
console.log(usable) // => false 表示 IPv4 层面确实被占用
```
