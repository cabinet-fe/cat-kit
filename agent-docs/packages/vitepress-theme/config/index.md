---
title: "@cat-kit/vitepress-theme 配置助手"
description: defineThemeConfig 与 demo/mermaid/examples 插件的接入方式与约束
keywords:
  - defineThemeConfig
  - demoContainer
  - mermaidPlugin
  - importExamples
  - 站点配置
  - markdown 插件
  - vite 插件
  - examplesDir
  - CatKitThemeOptions
aliases:
  - config helper
  - 配置助手
  - vitepress config 配置
  - demo 容器配置
  - mermaid 配置
---

## 概述

配置助手从子路径 `@cat-kit/vitepress-theme/config` 导入，用于在 `.vitepress/config.ts` 中接入 demo 容器、Mermaid 图表与 examples 导入插件。核心函数 `defineThemeConfig` 返回可合并进 VitePress 配置的 `markdown` 与 `vite` 配置片段。

## 推荐 API

从 `@cat-kit/vitepress-theme/config` 导入：

- `defineThemeConfig({ examplesDir })` — `examplesDir` 必须为**绝对路径**
- `demoContainer`、`mermaidPlugin`、`importExamples`
- 类型：`CatKitThemeOptions`、`DemoContainerOptions`、`ImportExamplesOptions`

```ts
import { defineThemeConfig } from '@cat-kit/vitepress-theme/config'
import { fileURLToPath } from 'node:url'

export default {
  ...defineThemeConfig({
    examplesDir: fileURLToPath(new URL('../examples', import.meta.url))
  })
}
```

函数与类型签名见 [配置 API](apis.md)。

## 注意事项

- 不要从包根导入 `defineThemeConfig` / `demoContainer` 等
- `defineThemeConfig` 会配置 `markdown` 与 `vite.plugins`；合并时勿浅覆盖这些嵌套字段
- `::: demo path/to/file.vue` 需要配置助手 + 默认主题注册的 `DemoContainer`
