---
title: "@cat-kit/vitepress-theme 默认主题 API"
description: 包根导出的主题对象、CatKitLayout 与 composable 签名
---

## 概述

包根 `@cat-kit/vitepress-theme` 导出默认主题对象、布局组件与三个 composable。完整声明见 [dist/src/index.d.ts](../../../../packages/vitepress-theme/dist/src/index.d.ts)。

## 签名

```ts
// 包根 @cat-kit/vitepress-theme
declare const defaultTheme: {
  extends: typeof DefaultTheme
  Layout: typeof CatKitLayout
  enhanceApp(ctx: { app: App }): void
}
export default defaultTheme
export { CatKitLayout }
export {
  useConsoleInterceptor,
  useFullscreen,
  useDraggable
  // 以及各 composable 导出的类型
}
```

## composable 要点

- `useConsoleInterceptor({ active, containerRef? })`：拦截 console 输出收集日志，返回 `{ logs, clearLogs }`；类型 `LogEntry`、`UseConsoleInterceptorOptions`
- `useDraggable({ initial?, min?, max?, direction?, reverse? })`：拖拽调整尺寸，返回 `{ value, isDragging, onDragStart }`；类型 `UseDraggableOptions`
- `useFullscreen()`：全屏切换，返回 `{ isFullscreen, enter, exit }`

`DemoContainer` / `Mermaid` 由默认主题 `enhanceApp` 注册，一般无需手动导入。
