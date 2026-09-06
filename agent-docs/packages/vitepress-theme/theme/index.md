---
title: "@cat-kit/vitepress-theme 默认主题"
description: 主题入口、CatKitLayout 布局与内置 composable 的使用
keywords:
  - VitePress 默认主题
  - 主题入口
  - CatKitLayout
  - DemoContainer
  - Mermaid
  - useConsoleInterceptor
  - useFullscreen
  - useDraggable
  - 水墨文档站
aliases:
  - default theme
  - 主题入口文件
  - vitepress default theme 扩展
  - 布局组件
---

## 概述

默认主题是包根 `@cat-kit/vitepress-theme` 的默认导出：扩展 VitePress 官方 DefaultTheme，布局替换为 `CatKitLayout`，并通过 `enhanceApp` 注册 `DemoContainer` 与 `Mermaid` 全局组件。适用于直接采用 CatKit 水墨丹青风格的文档站。

## 接入

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'
export default theme
```

## 包含内容

- 默认导出：VitePress theme（`extends` DefaultTheme、`Layout: CatKitLayout`、`enhanceApp` 注册 `DemoContainer` / `Mermaid`）
- 命名导出：`CatKitLayout`、`useConsoleInterceptor`、`useFullscreen`、`useDraggable` 及对应类型
- 样式：`@cat-kit/vitepress-theme/style.css` 或 `@cat-kit/vitepress-theme/styles/theme.css`（主题入口已引入 theme.css）

函数与类型签名见 [默认主题 API](apis.md)。
