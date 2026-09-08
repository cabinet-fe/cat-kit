---
title: "@cat-kit/vitepress-theme VitePress 水墨主题"
description: 水墨丹青风格的 VitePress 主题：扩展官方默认主题，CatKitLayout 注入祥云、印章、笔触首页装饰，注册 DemoContainer 与 Mermaid 全局组件，并提供 defineThemeConfig 一行接入 markdown 与 vite 插件。
aliases: [水墨丹青, catkit theme, vitepress theme, 文档站主题, CatKit 主题]
keywords: [defineThemeConfig, demoContainer, mermaidPlugin, importExamples, CatKitLayout, useConsoleInterceptor, useDraggable, useFullscreen, DemoContainer, Mermaid, examplesDir, style.css, theme.css, VitePress 主题, 文档站, Demo 容器, Mermaid 图表, 首页装饰]
---

# @cat-kit/vitepress-theme VitePress 水墨主题

`@cat-kit/vitepress-theme` 提供水墨丹青风格的 VitePress 文档主题：包根默认导出主题对象（扩展官方 `DefaultTheme`，布局替换为 `CatKitLayout`，`enhanceApp` 注册 `DemoContainer` 与 `Mermaid` 全局组件），包根另导出 3 个组合式函数；`@cat-kit/vitepress-theme/config` 子路径导出 4 个站点配置入口。当前版本 1.0.2；peer 依赖 `vitepress ^2.0.0-alpha.20` 与 `vue ^3.5.42`。

## 安装

```bash
bun add -D @cat-kit/vitepress-theme mermaid
# peers 需已安装：vitepress ^2.0.0-alpha.20、vue ^3.5.42
# mermaid 供 Mermaid 图表渲染使用，主题未把它列为运行时依赖，站点必须自行安装
```

导入约定：

- 包根 `@cat-kit/vitepress-theme`：默认导出主题对象，命名导出 `CatKitLayout` 与 `useConsoleInterceptor`、`useDraggable`、`useFullscreen`
- 子路径 `@cat-kit/vitepress-theme/config`：`defineThemeConfig`、`demoContainer`、`mermaidPlugin`、`importExamples`；包根不导出这 4 个函数
- 样式 `@cat-kit/vitepress-theme/style.css`：使用包根默认导出作为主题时样式自动加载；扩展默认主题或只复用样式时手动引入

最小接入（完整文件）：

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'

export default theme
```

包根 exports 含 `development` 条件：宿主在 vite `resolve.conditions` 中加入 `development` 时，导入直接解析到 `src/*.ts` 源码，跳过 `dist` 产物。

三个导入路径一览：

```ts
// 1. 主题入口（默认导出 + 组合式函数 + CatKitLayout）
import theme, { CatKitLayout, useConsoleInterceptor, useDraggable, useFullscreen } from '@cat-kit/vitepress-theme'

// 2. 站点配置（defineThemeConfig 与 3 个插件，包根不导出）
import { defineThemeConfig, demoContainer, mermaidPlugin, importExamples } from '@cat-kit/vitepress-theme/config'

// 3. 主题样式（副作用导入，使用默认主题入口时可省略）
import '@cat-kit/vitepress-theme/style.css'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| 默认导出（主题对象） | 扩展 `DefaultTheme`，注册全局组件 `DemoContainer`、`Mermaid`，自带主题样式 | `packages/vitepress-theme/theme/index.md` |
| `CatKitLayout` | 主题布局组件，首页注入祥云、印章、笔触装饰 | `packages/vitepress-theme/theme/apis.md` |
| `useConsoleInterceptor` | 拦截 `console` 五个方法并收集为 `LogEntry[]`，原始输出透传 | `packages/vitepress-theme/theme/apis.md` |
| `useDraggable` | 鼠标拖拽调整数值（面板高度、宽度），带 min / max 钳制 | `packages/vitepress-theme/theme/apis.md` |
| `useFullscreen` | 样式级全屏切换，按 Escape 退出 | `packages/vitepress-theme/theme/apis.md` |
| `defineThemeConfig` | 一次生成 demo 容器、Mermaid、示例导入插件的完整站点配置 | `packages/vitepress-theme/config/apis.md` |
| `demoContainer` | markdown-it 容器插件，渲染 `::: demo` 代码块为可交互示例 | `packages/vitepress-theme/config/apis.md` |
| `mermaidPlugin` | 把 info 为 `mermaid` 的围栏代码块替换为 `Mermaid` 组件 | `packages/vitepress-theme/config/apis.md` |
| `importExamples` | Vite 插件，为页面里的 `::: demo` 自动生成组件 import | `packages/vitepress-theme/config/apis.md` |
| `style.css` | 主题样式入口，与 `./styles/theme.css` 指向同一份 CSS | `packages/vitepress-theme/theme/index.md` |
| Demo 容器接入示例 | 主题 + 配置 + 示例组件的端到端组合 | `packages/vitepress-theme/examples.md` |

类型导出：`LogEntry`、`UseConsoleInterceptorOptions`、`UseDraggableOptions`（包根，见 `packages/vitepress-theme/theme/apis.md`）；`CatKitThemeOptions`、`DemoContainerOptions`、`ImportExamplesOptions`（config 子路径，见 `packages/vitepress-theme/config/apis.md`）。

按意图选文档：接入主题与 demo 容器读 `packages/vitepress-theme/examples.md`；查主题行为、组合式函数与全局组件 props 读 `packages/vitepress-theme/theme/apis.md`；拆配单个 markdown / vite 插件读 `packages/vitepress-theme/config/apis.md`。子路径 `./config` 的总览见 `packages/vitepress-theme/config/index.md`。
