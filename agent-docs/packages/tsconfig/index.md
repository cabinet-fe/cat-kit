---
title: "@cat-kit/tsconfig"
description: 按运行环境划分的 TypeScript 配置预设：node / bun / web / vue
---

## 概述

`@cat-kit/tsconfig` 是共享 TypeScript 预设（JSON）集合，非编程 API。所有预设使用 ESM / bundler 解析（未启用 NodeNext）；按运行环境选择对应预设后 `extends`。

- 版本：2.0.1
- Peer：`typescript >= 6.0.0`

## 预设选择

| 文件 | 用途 |
| --- | --- |
| [tsconfig.json](../../../packages/tsconfig/tsconfig.json) | 基础共享选项 |
| [tsconfig.node.json](../../../packages/tsconfig/tsconfig.node.json) | Node.js 项目（需另装 `@types/node`） |
| [tsconfig.bun.json](../../../packages/tsconfig/tsconfig.bun.json) | Bun 项目（需另装 `@types/bun`） |
| [tsconfig.web.json](../../../packages/tsconfig/tsconfig.web.json) | 浏览器 / 打包前端（补 DOM lib） |
| [tsconfig.vue.json](../../../packages/tsconfig/tsconfig.vue.json) | Vue 项目（不继承 web 预设；需要浏览器 lib 时自行补充） |

## 用法

```bash
bun add -d @cat-kit/tsconfig typescript
```

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.node.json"
}
```

预设内容以仓库 [packages/tsconfig/](../../../packages/tsconfig/) 内实际 JSON 文件为准。
