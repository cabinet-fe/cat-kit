---
title: "env 环境检测 API"
description: "@cat-kit/core 环境检测 API：getRuntime 判定顺序、getOSType/getDeviceType/getBrowserType 的 UA 规则、getEnvironmentSummary 判别联合与全部函数签名。"
aliases: [环境 API, 运行时 API, UA 探测 API]
keywords: [getRuntime, isInBrowser, isInNode, getOSType, getDeviceType, getBrowserType, getBrowserVersion, isMobile, isTablet, isDesktop, isTouchDevice, getNodeVersion, getEnvironmentSummary, EnvironmentSummary, OSType, DeviceType, BrowserType, Electron, 运行时判断, UA]
---

# env 环境检测 API

`@cat-kit/core` 导出 13 个环境检测函数与 4 个类型。判定顺序固定：`getRuntime` 先看 `globalThis.window`、再看 `globalThis.process`；Electron 等两者并存的环境结果为 `'browser'`。浏览器相关探测读取 `window.navigator.userAgent`，Node 相关探测读取 `process.platform` / `process.version`。

## 快速上手

```ts
import { getEnvironmentSummary, getRuntime } from '@cat-kit/core'

console.log(getRuntime()) // 浏览器 => 'browser'；Node.js / Bun => 'node'

const env = getEnvironmentSummary()
if (env.runtime === 'browser') {
  console.log(env.browser, env.browserVersion, env.device, env.touchSupported)
} else if (env.runtime === 'node') {
  console.log(env.os, env.nodeVersion)
}
```

## API 签名

```ts
/** 'browser' | 'node' | 'unknown'；window 存在优先判 browser，再判 process，都无则 unknown */
export function getRuntime(): 'browser' | 'node' | 'unknown'

export function isInBrowser(): boolean
export function isInNode(): boolean

export type OSType = 'Windows' | 'Linux' | 'MacOS' | 'Android' | 'iOS' | 'Unknown'
export function getOSType(): OSType

export type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown'
export function getDeviceType(): DeviceType

export type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'IE' | 'Opera' | 'Unknown'
export function getBrowserType(): BrowserType

/** 主次版本号，如 '120.0'；非浏览器或无法识别返回 null */
export function getBrowserVersion(): string | null

export function isMobile(): boolean
export function isTablet(): boolean
export function isDesktop(): boolean
/** 非浏览器恒为 false */
export function isTouchDevice(): boolean

/** 非 Node 运行时返回 null；返回值不含前导 'v'，如 '20.11.0' */
export function getNodeVersion(): string | null

export type EnvironmentSummary =
  | {
      runtime: 'browser'
      os: OSType
      browser: BrowserType
      browserVersion: string | null
      device: DeviceType
      touchSupported: boolean
    }
  | { runtime: 'node'; os: OSType; nodeVersion: string | null }
  | { runtime: 'unknown'; os: OSType }

export function getEnvironmentSummary(): EnvironmentSummary
```

## 参数说明

全部函数无入参、同步执行、不抛错。

| 函数 | 返回 | 非浏览器环境行为 | 判定规则 |
| --- | --- | --- | --- |
| `getRuntime` | `'browser' \| 'node' \| 'unknown'` | Node 返回 `'node'` | `typeof window !== 'undefined'` → `'browser'`；否则 `typeof process !== 'undefined'` → `'node'`；否则 `'unknown'` |
| `getOSType` | `OSType` | 按 `process.platform`：`win32`→Windows、`darwin`→MacOS、`linux`→Linux、`android`→Android；其余 Unknown | 浏览器按 UA 顺序：`android`→Android、`iphone\|ipad`→iOS、`win`→Windows、`mac`→MacOS、`linux\|x11`→Linux |
| `getDeviceType` | `DeviceType` | 恒为 `'Unknown'` | UA 含 `android\|webos\|iphone\|ipod\|blackberry\|iemobile\|opera mini` → Mobile；含 `ipad\|tablet\|playbook\|silk` 或（`android` 且不含 `mobile`）→ Tablet；否则 Desktop |
| `getBrowserType` | `BrowserType` | 恒为 `'Unknown'` | 按序检测：`Edge`→Edge、`Chrome`（非 `Chromium\|Edg`）→Chrome、`Firefox`、`Safari`（非 Chrome）、`MSIE\|Trident`→IE、`Opera\|OPR`→Opera；否则 Unknown |
| `getBrowserVersion` | `string \| null` | `null` | 按浏览器类型取对应 UA 版本段，如 Chrome 匹配 `Chrome/(\d+\.\d+)` |
| `isTouchDevice` | `boolean` | `false` | `'ontouchstart' in window` 或 `maxTouchPoints > 0` 或 `msMaxTouchPoints > 0` |
| `getNodeVersion` | `string \| null` | 非 Node 为 `null` | `process.version.slice(1)` 去掉前导 `v` |
| `isMobile` / `isTablet` / `isDesktop` | `boolean` | 全为 `false` | 等价于 `getDeviceType() === 'Mobile' / 'Tablet' / 'Desktop'` |

## 典型示例

### 按运行时分流初始化

```ts
import { isInBrowser, isInNode } from '@cat-kit/core'

if (isInNode()) {
  console.log('服务端渲染/脚本环境')
}
if (isInBrowser()) {
  console.log('浏览器环境')
}
```

### 移动端降级与浏览器版本门槛

```ts
import { getBrowserType, getBrowserVersion, isMobile } from '@cat-kit/core'

if (isMobile()) {
  console.log('加载移动端布局')
}

const version = getBrowserVersion()
if (getBrowserType() === 'Chrome' && version !== null) {
  const major = Number(version.split('.')[0])
  console.log(major >= 100) // 主版本号比较
}
```

### 环境信息上报

```ts
import { getEnvironmentSummary } from '@cat-kit/core'

const summary = getEnvironmentSummary()
// 浏览器：{ runtime: 'browser', os, browser, browserVersion, device, touchSupported }
// Node：{ runtime: 'node', os, nodeVersion }
// 两者都不是：{ runtime: 'unknown', os }
console.log(summary.runtime)
```

## 注意事项

> [!WARNING]
> - 本库 Electron 判定为 `'browser'`（`window` 优先于 `process`），不是 `'node'`；需要区分 Electron 主进程时自行检测 `process.versions.electron`。
> - Bun 运行时判定为 `'node'`（存在 `process`、无 `window`）；`getNodeVersion()` 返回的是 Bun 兼容层报告的 Node 版本。
> - `getDeviceType` / `getBrowserType` / `getBrowserVersion` 基于 UA 字符串，新版浏览器改 UA（如 iPadOS 桌面模式）时结论随之变化；触摸判断用 `isTouchDevice` 而不是 `isMobile`。
> - `isTouchDevice` 在非浏览器环境恒为 `false`；不要用它判断「有没有鼠标」。
> - Edge 的 UA 同时含 `Edge`（或 `Edg`）与 `Chrome`，本库先匹配 `Edge`，结论为 `'Edge'` 而非 `'Chrome'`。
