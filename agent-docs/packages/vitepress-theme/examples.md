---
title: "@cat-kit/vitepress-theme 接入示例"
description: 主题入口、defineThemeConfig 与 demo 容器的组合示例
keywords:
  - defineThemeConfig
  - demo 容器
  - Mermaid
  - examplesDir
  - 主题入口
  - 站点配置
  - 接入示例
  - VitePress 配置
aliases:
  - usage example
  - 接入示例
  - demo container 用法
  - 主题配置示例
---

## 概述

组合使用默认主题与配置助手：主题入口提供布局与全局组件，`defineThemeConfig` 注入 markdown 与 vite 插件，Markdown 中即可使用 demo 容器与 Mermaid。

## 安装

```bash
bun add @cat-kit/vitepress-theme
# peers: vitepress ^2、vue ^3.5.31
```

## 主题入口

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'
export default theme
```

## 站点配置

```ts
// .vitepress/config.ts
import { defineThemeConfig } from '@cat-kit/vitepress-theme/config'
import { fileURLToPath } from 'node:url'

const examplesDir = fileURLToPath(new URL('../../examples', import.meta.url))

export default {
  title: 'Docs',
  ...defineThemeConfig({ examplesDir })
}
```

## Markdown 中使用

```md
::: demo my-pkg/demo.vue
:::
```
