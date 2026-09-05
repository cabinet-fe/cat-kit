---
title: "@cat-kit/fe 包概览"
description: "浏览器专用工具包：虚拟列表、数值补间、文件处理、客户端存储与剪贴板"
---

# @cat-kit/fe

`@cat-kit/fe` 是浏览器专用工具包，提供虚拟滚动列表、数值补间动画、文件分块读取与保存、类型化客户端存储以及剪贴板等 Web API 封装。所有能力依赖 DOM / 浏览器 Web API，不适用于 Node.js 服务端逻辑。

**导入**：`import { ... } from '@cat-kit/fe'`（仅包根）

## 主题

| 主题 | 说明 |
| --- | --- |
| [virtualizer](virtualizer/index.md) | 虚拟滚动、动态尺寸、滚动到指定项 |
| [tween](tween/index.md) | 数值补间、缓动、暂停/恢复 |
| [file](file/index.md) | 分块读取、保存 Blob |
| [storage](storage/index.md) | localStorage、sessionStorage、Cookie |
| [web-api](web-api/index.md) | 剪贴板、权限预查 |
| [组合示例](examples.md) | 跨主题组合 |

## 类型声明

完整公共类型与签名见 [packages/fe/dist/index.d.ts](../../../packages/fe/dist/index.d.ts)。
