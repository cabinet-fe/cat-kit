# 环境检测

## 介绍

本页介绍 `@cat-kit/core` 的环境检测能力，覆盖运行时、操作系统、设备类型与浏览器信息判断。

## 快速使用

```typescript
import { isInBrowser, getRuntime, getOSType, getDeviceType } from '@cat-kit/core'

const runtime = getRuntime()
const os = getOSType()
const device = getDeviceType()

if (isInBrowser()) {
  console.log({ runtime, os, device })
}
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 运行环境检测

检测代码运行在浪器还是 Node.js 环境。

### 基本用法

```typescript
import { getRuntime, isInBrowser, isInNode } from '@cat-kit/core'

// 获取运行环境
const runtime = getRuntime()
// 'browser' | 'node' | 'unknown'

// 判断是否在浏览器中
if (isInBrowser()) {
  console.log('Running in browser')
  // 可以安全使用 window, document 等
}

// 判断是否在 Node.js 中
if (isInNode()) {
  console.log('Running in Node.js')
  // 可以安全使用 process, require 等
}
```

### 条件执行

```typescript
import { isInBrowser, isInNode } from '@cat-kit/core'

function initApp() {
  if (isInBrowser()) {
    // 浏览器环境初始化
    setupDOM()
    initRouter()
  } else if (isInNode()) {
    // Node.js 环境初始化
    setupServer()
    initDatabase()
  }
}
```

## 操作系统检测

识别用户的操作系统类型。

### 基本用法

```typescript
import { getOSType } from '@cat-kit/core'

const os = getOSType()
// 'Windows' | 'MacOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown'

switch (os) {
  case 'Windows':
    console.log('Windows系统')
    break
  case 'MacOS':
    console.log('Mac系统')
    break
  case 'Linux':
    console.log('Linux系统')
    break
  case 'iOS':
    console.log('iOS系统')
    break
  case 'Android':
    console.log('Android系统')
    break
  default:
    console.log('未知系统')
}
```

### 实用示例

```typescript
import { getOSType } from '@cat-kit/core'

// 根据系统显示不同的快捷键提示
function getShortcutHint(action: string): string {
  const os = getOSType()
  const modifier = os === 'MacOS' ? '⌘' : 'Ctrl'

  return `${modifier}+${action}`
}

getShortcutHint('S') // Mac: '⌘+S', Others: 'Ctrl+S'
```

## 设备类型检测

识别设备是桌面端还是移动端。

### 基本用法

```typescript
import { getDeviceType } from '@cat-kit/core'

const device = getDeviceType()
// 'Mobile' | 'Desktop' | 'Unknown'

if (device === 'Mobile') {
  console.log('移动设备')
  // 加载移动端UI
} else if (device === 'Desktop') {
  console.log('桌面设备')
  // 加载桌面端UI
}
```

### 响应式布局

```typescript
import { getDeviceType } from '@cat-kit/core'

function setupLayout() {
  const device = getDeviceType()

  if (device === 'Mobile') {
    // 移动端布局
    enableMobileMenu()
    disableHoverEffects()
  } else {
    // 桌面端布局
    enableDesktopMenu()
    enableHoverEffects()
  }
}
```

## 浏览器检测

识别浏览器类型和版本。

### 浏览器类型

```typescript
import { getBrowserType } from '@cat-kit/core'

const browser = getBrowserType()
// 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'IE' | 'Opera' | 'Unknown'

switch (browser) {
  case 'Chrome':
    console.log('Chrome浏览器')
    break
  case 'Firefox':
    console.log('Firefox浏览器')
    break
  case 'Safari':
    console.log('Safari浏览器')
    break
  case 'Edge':
    console.log('Edge浏览器')
    break
  case 'IE':
    console.log('IE浏览器（不推荐）')
    break
}
```

### 浏览器版本

```typescript
import { getBrowserVersion } from '@cat-kit/core'

const version = getBrowserVersion()
// 返回版本号字符串，如 '120.0.6099.109'

const majorVersion = parseInt(version.split('.')[0])
console.log(`浏览器主版本号: ${majorVersion}`)
```

### 特性检测和降级

```typescript
import { getBrowserType, getBrowserVersion } from '@cat-kit/core'

function checkBrowserSupport(): boolean {
  const browser = getBrowserType()
  const version = getBrowserVersion()
  const major = parseInt(version.split('.')[0])

  // 检查最低版本要求
  const minVersions = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90
  }

  const minVersion = minVersions[browser]
  if (!minVersion) {
    return false // 未知浏览器
  }

  return major >= minVersion
}

if (!checkBrowserSupport()) {
  showUpgradeBrowserDialog()
}
```

## 完整示例

### 环境适配

```typescript
import {
  getRuntime,
  getOSType,
  getDeviceType,
  getBrowserType,
  getBrowserVersion
} from '@cat-kit/core'

interface EnvironmentInfo {
  runtime: string
  os: string
  device: string
  browser: string
  version: string
}

function getEnvironmentInfo(): EnvironmentInfo {
  return {
    runtime: getRuntime(),
    os: getOSType(),
    device: getDeviceType(),
    browser: getBrowserType(),
    version: getBrowserVersion()
  }
}

// 使用
const env = getEnvironmentInfo()
console.log('环境信息：', env)

// 根据环境信息做适配
if (env.device === 'Mobile') {
  // 移动端特殊处理
  loadMobileAssets()
}

if (env.browser === 'Safari' && env.os === 'iOS') {
  // iOS Safari 特殊处理
  fixSafariQuirks()
}
```

### 功能检测

```typescript
import { getBrowserType, getBrowserVersion } from '@cat-kit/core'

interface FeatureSupport {
  webgl: boolean
  webrtc: boolean
  serviceWorker: boolean
  webAssembly: boolean
}

function detectFeatureSupport(): FeatureSupport {
  return {
    webgl: !!document.createElement('canvas').getContext('webgl'),
    webrtc: !!navigator.mediaDevices?.getUserMedia,
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly !== 'undefined'
  }
}

// 结合浏览器信息
function checkCompatibility() {
  const browser = getBrowserType()
  const features = detectFeatureSupport()

  if (browser === 'IE') {
    alert('您的浏览器版本过旧，请升级到现代浏览器')
    return false
  }

  if (!features.webgl) {
    console.warn('WebGL 不支持，部分3D功能将不可用')
  }

  return true
}
```

### 性能优化策略

```typescript
import { getDeviceType, getOSType } from '@cat-kit/core'

function getOptimizationStrategy() {
  const device = getDeviceType()
  const os = getOSType()

  return {
    // 移动设备降低质量
    quality: device === 'Mobile' ? 'low' : 'high',

    // 移动设备禁用动画
    enableAnimations: device !== 'Mobile',

    // iOS 特殊优化
    useIOSOptimizations: os === 'iOS',

    // 预加载策略
    prefetchImages: device === 'Desktop',

    // 懒加载阈值
    lazyLoadThreshold: device === 'Mobile' ? 200 : 500
  }
}

const strategy = getOptimizationStrategy()
console.log('优化策略：', strategy)
```

### 错误上报

```typescript
import {
  getRuntime,
  getOSType,
  getDeviceType,
  getBrowserType,
  getBrowserVersion
} from '@cat-kit/core'

function reportError(error: Error) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    environment: {
      runtime: getRuntime(),
      os: getOSType(),
      device: getDeviceType(),
      browser: getBrowserType(),
      browserVersion: getBrowserVersion(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  }

  // 发送到错误追踪服务
  sendToErrorTracker(errorReport)
}

// 全局错误处理
window.addEventListener('error', event => {
  reportError(event.error)
})
```

## API详解

### 运行环境

```typescript
function getRuntime(): 'browser' | 'node' | 'unknown'
function isInBrowser(): boolean
function isInNode(): boolean
```

### 操作系统

```typescript
function getOSType():
  | 'Windows'
  | 'MacOS'
  | 'Linux'
  | 'iOS'
  | 'Android'
  | 'Unknown'
```

### 设备类型

```typescript
function getDeviceType(): 'Mobile' | 'Desktop' | 'Unknown'
```

### 浏览器

```typescript
function getBrowserType():
  | 'Chrome'
  | 'Firefox'
  | 'Safari'
  | 'Edge'
  | 'IE'
  | 'Opera'
  | 'Unknown'

function getBrowserVersion(): string
```

## 注意事项

1. **User-Agent 限制**：浏览器检测基于 User-Agent，可能被用户修改或浏览器隐私设置影响
2. **特性检测优先**：对于特定功能，建议直接检测功能是否可用，而不是依赖浏览器版本
3. **移动端检测**：移动端检测主要基于屏幕尺寸和 User-Agent，在某些设备上可能不准确
4. **服务器端**：在 Node.js 环境中，部分浏览器相关函数可能返回 'Unknown'
5. **Bun 环境**：在 Bun 运行时会被识别为 'node'（兼容 Node.js API）

## 最佳实践

1. **功能检测优先**：优先使用功能检测而非环境检测
2. **渐进增强**：基础功能适配所有环境，高级功能逐步增强
3. **缓存检测结果**：环境信息在运行期间不会变化，可以缓存检测结果
4. **避免过度依赖**：不要过度依赖环境检测做分支逻辑，保持代码通用性
5. **用户友好降级**：对不支持的环境提供友好的提示和降级方案
