---
title: "@cat-kit/vitepress-theme 默认主题"
description: 水墨丹青 VitePress 默认主题：包根默认导出扩展官方 DefaultTheme 的主题对象，CatKitLayout 注入祥云、印章、笔触首页装饰，enhanceApp 注册 DemoContainer 与 Mermaid 全局组件，自带全部样式。
aliases: [default theme, 水墨主题, CatKit 主题, 主题入口, catkit theme]
keywords: [CatKitLayout, DemoContainer, Mermaid, useConsoleInterceptor, useDraggable, useFullscreen, LogEntry, enhanceApp, DefaultTheme, style.css, theme.css, prefers-reduced-motion, 默认主题, 全局组件, 水墨装饰, 暗色模式]
---

# @cat-kit/vitepress-theme 默认主题

包根 `@cat-kit/vitepress-theme` 的默认导出是 VitePress 主题对象：`extends` 官方 `DefaultTheme`，`Layout` 替换为 `CatKitLayout`（首页注入祥云 `CloudPatterns`、印章 `SealStamp`、笔触 `BrushStrokes` 装饰，并全局启用 `prefers-reduced-motion` 降级），`enhanceApp` 注册全局组件 `DemoContainer` 与 `Mermaid`，入口文件自带主题样式导入。包根另命名导出 `CatKitLayout` 与 3 个组合式函数。

## 安装

```bash
bun add -D @cat-kit/vitepress-theme mermaid
# peers 需已安装：vitepress ^2.0.0-alpha.20、vue ^3.5.42
# mermaid 供 Mermaid 全局组件渲染图表使用，站点必须自行安装
```

主题接入（完整文件）：

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'

// 默认导出已包含：DefaultTheme 扩展、CatKitLayout 布局、
// 全局组件 DemoContainer 与 Mermaid、主题样式
export default theme
```

- 样式由默认导出自动加载（主题入口 import 了打包产物内的 `theme.css`）；扩展默认主题时无需再手动引样式
- `@cat-kit/vitepress-theme/style.css` 与 `@cat-kit/vitepress-theme/styles/theme.css` 指向同一份 CSS，供不使用默认主题入口时手动引入：`import '@cat-kit/vitepress-theme/style.css'`
- 需要站点配置（demo 容器、Mermaid 围栏）时配合 `@cat-kit/vitepress-theme/config`，见 `packages/vitepress-theme/config/index.md`
- `Mermaid` 全局组件动态 `import('mermaid')`，而主题未把 `mermaid` 列为运行时依赖（仅 `devDependencies`），站点必须自行安装，未安装时图表区域显示错误信息并在控制台输出 `Mermaid render error`
- 宿主在 vite `resolve.conditions` 中加入 `development` 时，包根导入直接解析到 `src/index.ts` 源码

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| 默认导出（主题对象） | `extends: DefaultTheme`、`Layout: CatKitLayout`、`enhanceApp` 注册 `DemoContainer` 与 `Mermaid` | `packages/vitepress-theme/theme/apis.md` |
| `CatKitLayout` | 布局组件，包裹默认主题 Layout，首页插槽注入装饰组件 | `packages/vitepress-theme/theme/apis.md` |
| `useConsoleInterceptor` | 拦截 `console` 的 `log` / `warn` / `error` / `info` / `debug` 并收集为 `LogEntry[]` | `packages/vitepress-theme/theme/apis.md` |
| `useDraggable` | 鼠标拖拽调整数值，默认 `initial: 200`、`min: 80`、`max: 500` | `packages/vitepress-theme/theme/apis.md` |
| `useFullscreen` | 样式级全屏切换，Escape 键退出 | `packages/vitepress-theme/theme/apis.md` |
| 全局组件 `DemoContainer` | 示例容器：预览、源码高亮、复制、控制台、全屏 | `packages/vitepress-theme/theme/apis.md` |
| 全局组件 `Mermaid` | Mermaid 图表渲染，随暗色模式重绘 | `packages/vitepress-theme/theme/apis.md` |
| `style.css` | 主题样式入口，与 `./styles/theme.css` 同一份 CSS | `packages/vitepress-theme/theme/apis.md` |

类型导出：`LogEntry`、`UseConsoleInterceptorOptions`、`UseDraggableOptions`，签名与默认值见 `packages/vitepress-theme/theme/apis.md`。

`CatKitLayout` 首页（`frontmatter.layout` 为 `'home'`）通过默认主题插槽注入异步加载的装饰组件 `CloudPatterns`（祥云）、`SealStamp`（印章）与 `BrushStrokes`（笔触）；这三个装饰组件不在包导出之列，仅随布局渲染。布局同时全局启用 `prefers-reduced-motion` 降级（动画与过渡时长压到 0.01ms）。

端到端组合示例见 `packages/vitepress-theme/examples.md`；站点配置（`defineThemeConfig`、demo 容器插件）见 `packages/vitepress-theme/config/index.md`。
