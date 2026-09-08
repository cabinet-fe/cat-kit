---
title: "环境检测模块（env）"
description: "@cat-kit/core 的 env 模块：运行时判断（browser/node）、操作系统、设备与浏览器类型版本探测、触摸支持检测与 Node.js 版本读取，并提供一份可判别的环境信息汇总。"
aliases: [环境模块, 运行时检测模块, ua 检测模块]
keywords: [getRuntime, isInBrowser, isInNode, getOSType, getDeviceType, getBrowserType, getBrowserVersion, isMobile, isTablet, isTouchDevice, getNodeVersion, getEnvironmentSummary, 环境检测, 运行时判断]
---

# 环境检测模块（env）

`env` 模块从 `@cat-kit/core` 导出运行时与环境探测函数：`getRuntime` 通过 `globalThis` 判定 `'browser'` / `'node'` / `'unknown'`；UA 探测提供操作系统 `getOSType`、设备 `getDeviceType`、浏览器 `getBrowserType` / `getBrowserVersion`；`getEnvironmentSummary` 返回按 `runtime` 可判别的汇总对象。全部函数同步、不抛错。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { getEnvironmentSummary, getRuntime } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `getRuntime` | 返回 `'browser'` / `'node'` / `'unknown'` | `packages/core/env/apis.md` |
| `isInBrowser` | 是否浏览器运行时 | `packages/core/env/apis.md` |
| `isInNode` | 是否 Node.js 运行时 | `packages/core/env/apis.md` |
| `getOSType` | 操作系统：`Windows` / `Linux` / `MacOS` / `Android` / `iOS` / `Unknown` | `packages/core/env/apis.md` |
| `getDeviceType` | 设备类型：`Mobile` / `Tablet` / `Desktop` / `Unknown` | `packages/core/env/apis.md` |
| `getBrowserType` | 浏览器：`Chrome` / `Firefox` / `Safari` / `Edge` / `IE` / `Opera` / `Unknown` | `packages/core/env/apis.md` |
| `getBrowserVersion` | 浏览器主次版本号字符串或 `null` | `packages/core/env/apis.md` |
| `isMobile` | 是否移动设备 | `packages/core/env/apis.md` |
| `isTablet` | 是否平板设备 | `packages/core/env/apis.md` |
| `isDesktop` | 是否桌面设备 | `packages/core/env/apis.md` |
| `isTouchDevice` | 是否支持触摸 | `packages/core/env/apis.md` |
| `getNodeVersion` | Node.js 版本号（去掉前导 `v`）或 `null` | `packages/core/env/apis.md` |
| `getEnvironmentSummary` | 按 `runtime` 判别的环境汇总对象 | `packages/core/env/apis.md` |

类型导出：`OSType`、`DeviceType`、`BrowserType`、`EnvironmentSummary`。
