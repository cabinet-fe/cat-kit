---
title: "环境检测 API"
description: "@cat-kit/core 环境检测函数签名与 OSType/DeviceType/BrowserType 类型"
---

# 环境检测 API

本篇列出环境检测的全部公开函数与返回的联合类型，均从 `@cat-kit/core` 包根导入。

```ts
declare function getRuntime(): 'browser' | 'node' | 'unknown'
declare function isInBrowser(): boolean
declare function isInNode(): boolean
declare function getOSType(): OSType
declare function getDeviceType(): DeviceType
declare function getBrowserType(): BrowserType
declare function getBrowserVersion(): string
declare function isMobile(): boolean
declare function isTablet(): boolean
declare function isDesktop(): boolean
declare function isTouchDevice(): boolean
declare function getNodeVersion(): string | undefined
declare function getEnvironmentSummary(): EnvironmentSummary

type OSType = 'Windows' | 'Linux' | 'MacOS' | 'Android' | 'iOS' | 'Unknown'
type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown'
type BrowserType =
  | 'Chrome'
  | 'Firefox'
  | 'Safari'
  | 'Edge'
  | 'IE'
  | 'Opera'
  | 'Unknown'
```

`EnvironmentSummary` 字段见 [packages/core/dist/env/env.d.ts](../../../../packages/core/dist/env/env.d.ts)。
