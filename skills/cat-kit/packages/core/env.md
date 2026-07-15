# core — 环境检测

## 何时使用

- 在通用代码中区分浏览器、Node.js 或未知运行时。
- 获取用于提示、日志或非关键分支的系统、浏览器和设备概况。

环境探测不是功能检测。决定能否调用某个 Web API 时，应直接检查对应 API 是否存在。

## 推荐公开 API

- `getRuntime`、`isInBrowser`、`isInNode`：运行时。
- `getOSType`：操作系统。
- `getDeviceType`、`isMobile`、`isTablet`、`isDesktop`、`isTouchDevice`：设备。
- `getBrowserType`、`getBrowserVersion`：浏览器。
- `getNodeVersion`：Node.js 版本。
- `getEnvironmentSummary`：按 `runtime` 区分的完整摘要。

## 最小示例

```ts
import { getEnvironmentSummary } from '@cat-kit/core'

const environment = getEnvironmentSummary()

if (environment.runtime === 'node') {
  console.log(environment.nodeVersion)
} else if (environment.runtime === 'browser') {
  console.log(environment.browser, environment.device)
}
```

## 约束与边界

- `getRuntime()` 返回 `'browser' | 'node' | 'unknown'`；同时存在 `window` 与 `process` 时判为 `browser`。
- `EnvironmentSummary` 是以 `runtime` 为判别字段的联合类型。浏览器分支包含浏览器、设备和触摸信息；Node.js 分支包含 `nodeVersion`。
- 操作系统、浏览器和设备判断可能返回 `'Unknown'`；浏览器版本和 Node.js 版本在不适用时返回 `null`。
- 浏览器与设备结果来自运行环境公开信息，只适合界面适配和诊断，不应作为安全或授权依据。
- `isTouchDevice` 表示检测到触摸能力，不代表当前输入一定来自触摸屏。

## 精确类型入口

[环境声明](../../generated/core/env/env.d.ts)
