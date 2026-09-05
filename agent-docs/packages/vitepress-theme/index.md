---
title: "@cat-kit/vitepress-theme"
description: VitePress 水墨丹青主题：默认主题、布局组件、Demo/Mermaid 容器与配置助手
---

## 概述

`@cat-kit/vitepress-theme` 提供水墨丹青风格的 VitePress 文档主题：默认主题（扩展官方 DefaultTheme）、`CatKitLayout` 布局、Demo/Mermaid 全局组件与一组配置助手。包根导入主题与组件，`@cat-kit/vitepress-theme/config` 子路径导入配置助手。

- 版本：1.0.2
- Peers：`vitepress ^2.0.0`、`vue ^3.5.31`

## 文档主题

| 主题 | 说明 |
| --- | --- |
| [默认主题](theme/index.md) | 主题入口、布局、composable |
| [默认主题 API](theme/apis.md) | 包根导出的主题对象与 composable 签名 |
| [配置助手](config/index.md) | `defineThemeConfig` 与 markdown/vite 插件接入 |
| [配置 API](config/apis.md) | config 子路径导出的函数与类型签名 |
| [接入示例](examples.md) | 主题 + 配置 + demo 容器组合示例 |

## 安装

```bash
bun add @cat-kit/vitepress-theme
```

## 导入约定

- 包根 `@cat-kit/vitepress-theme`：默认导出 VitePress theme，命名导出 `CatKitLayout` 与 composables
- 子路径 `@cat-kit/vitepress-theme/config`：`defineThemeConfig`、`demoContainer`、`mermaidPlugin`、`importExamples`，不要从包根导入这些助手
- 类型声明：包根见 [dist/src/index.d.ts](../../../packages/vitepress-theme/dist/src/index.d.ts)，config 子路径见 [dist/src/config.d.ts](../../../packages/vitepress-theme/dist/src/config.d.ts)
