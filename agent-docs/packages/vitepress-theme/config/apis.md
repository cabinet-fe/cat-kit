---
title: "@cat-kit/vitepress-theme 配置 API"
description: config 子路径导出的函数与类型签名
keywords:
  - defineThemeConfig
  - demoContainer
  - mermaidPlugin
  - importExamples
  - CatKitThemeOptions
  - DemoContainerOptions
  - ImportExamplesOptions
  - config 导出
  - 类型签名
aliases:
  - config api
  - 配置 API
  - 类型定义
  - 插件函数签名
---

## 概述

`@cat-kit/vitepress-theme/config` 导出配置函数与 markdown/vite 插件。

## API 签名

```ts
// @cat-kit/vitepress-theme/config
interface CatKitThemeOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string
}

declare function defineThemeConfig(
  options: CatKitThemeOptions
): Partial<UserConfig>

declare function demoContainer(
  md: MarkdownRenderer,
  options: DemoContainerOptions
): Promise<void>
declare function mermaidPlugin(md: MarkdownRenderer): void
declare function importExamples(options: ImportExamplesOptions): Plugin
```

- `DemoContainerOptions` / `ImportExamplesOptions` 均为 `{ examplesDir: string }`（绝对路径）
- `MarkdownRenderer`、`Plugin` 来自 vitepress；`defineThemeConfig` 返回可合并的 `Partial<UserConfig>`
