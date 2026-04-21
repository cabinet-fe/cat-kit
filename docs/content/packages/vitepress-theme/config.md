---
title: 主题配置
description: '@cat-kit/vitepress-theme 的主题入口、defineThemeConfig 与按需导出'
outline: deep
---

# 主题配置

## 介绍

`@cat-kit/vitepress-theme` 当前公开两类入口：

- 默认主题入口：直接作为 `.vitepress/theme/index.ts` 的 `theme` 导出
- 配置辅助入口：`defineThemeConfig`、`demoContainer`、`mermaidPlugin`、`importExamples`

## 快速使用

主题入口：

```ts
import theme from '@cat-kit/vitepress-theme'

export default theme
```

配置辅助：

```ts
import { defineConfig } from 'vitepress'
import { defineThemeConfig } from '@cat-kit/vitepress-theme/config'

export default defineConfig({
  ...defineThemeConfig({
    examplesDir: '/absolute/path/to/docs/examples'
  })
})
```

## API参考

### 默认主题入口

```ts
import theme from '@cat-kit/vitepress-theme'
```

默认导出会：

- 继承 VitePress `DefaultTheme`
- 使用 `CatKitLayout`
- 注册 `DemoContainer` 和 `Mermaid` 组件
- 引入主题样式

根入口额外暴露：

```ts
export { CatKitLayout } from '@cat-kit/vitepress-theme'
```

`defineThemeConfig`、`demoContainer`、`mermaidPlugin`、`importExamples` 这些配置辅助函数走 `@cat-kit/vitepress-theme/config`。

### `defineThemeConfig`

```ts
defineThemeConfig(options: { examplesDir: string }): Partial<UserConfig>
```

它会返回一段可直接合并进 VitePress 配置的片段，当前包含：

- `markdown.lineNumbers = true`
- `demoContainer(md, { examplesDir })`
- `md.use(mermaidPlugin)`
- `vite.plugins = [importExamples({ examplesDir })]`

### 按需导出

```ts
import {
  defineThemeConfig,
  demoContainer,
  mermaidPlugin,
  importExamples
} from '@cat-kit/vitepress-theme/config'
```

适合：

- 只想复用 Demo 容器能力
- 自己维护主题，但想复用 CatKit 的 Markdown / Vite 插件组合
