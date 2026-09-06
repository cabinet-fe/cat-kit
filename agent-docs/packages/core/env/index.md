---
title: "环境检测"
description: "@cat-kit/core 环境检测：运行时、操作系统、浏览器、设备类型与汇总信息"
keywords:
  - 环境检测
  - 运行时判断
  - getRuntime
  - getOSType
  - getBrowserType
  - getDeviceType
  - isInBrowser
  - isInNode
  - getEnvironmentSummary
aliases:
  - UA 探测
  - 平台检测
  - 客户端环境
  - isMobile
  - 浏览器版本检测
---

# 环境检测

`@cat-kit/core` 的环境检测工具提供运行时判断（browser/node）、操作系统与设备类型识别、浏览器种类与版本探测，以及一份汇总的环境信息对象，用于跨环境代码分支与兼容性处理。

## 适用场景

探测运行时、操作系统、浏览器、设备类型或汇总环境信息。

## 推荐 API

`getRuntime`、`isInBrowser`、`isInNode`、`getOSType`、`getDeviceType`、`getBrowserType`、`getBrowserVersion`、`isMobile`、`isTablet`、`isDesktop`、`isTouchDevice`、`getNodeVersion`、`getEnvironmentSummary`

```ts
import { getEnvironmentSummary, getRuntime } from '@cat-kit/core'

getRuntime() // 'browser' | 'node' | 'unknown'
getEnvironmentSummary()
```

## 注意事项

- `getRuntime`：先看 `globalThis.window`，再看 `process`；Electron 等同时存在时为 `browser`
- 浏览器/设备相关 API 在非浏览器环境可能返回 `Unknown` 或受限结果

## 更多

- API：[环境检测 API](apis.md)
