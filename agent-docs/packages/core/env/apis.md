---
title: "环境检测 API"
description: "@cat-kit/core 环境检测函数签名与 OSType/DeviceType/BrowserType 类型"
keywords:
  - 运行环境
  - 浏览器判断
  - Node.js 判断
  - 操作系统类型
  - 设备类型
  - 移动端检测
  - 环境摘要
  - Electron 环境
aliases:
  - environment
  - 环境探测
  - UA 检测替代
  - getRuntime
---

# 环境检测 API

本篇列出环境检测的全部公开函数与返回的联合类型，均从 `@cat-kit/core` 包根导入。

## API 签名

```ts
declare function getRuntime(): 'browser' | 'node' | 'unknown'
declare function isInBrowser(): boolean
declare function isInNode(): boolean
declare function getOSType(): OSType
declare function getDeviceType(): DeviceType
declare function getBrowserType(): BrowserType
declare function getBrowserVersion(): string | null
declare function isMobile(): boolean
declare function isTablet(): boolean
declare function isDesktop(): boolean
declare function isTouchDevice(): boolean
declare function getNodeVersion(): string | null
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

type EnvironmentSummary =
  | {
      runtime: 'browser'
      os: OSType
      browser: BrowserType
      browserVersion: string | null
      device: DeviceType
      touchSupported: boolean
    }
  | {
      runtime: 'node'
      os: OSType
      nodeVersion: string | null
    }
  | {
      runtime: 'unknown'
      os: OSType
    }
```
