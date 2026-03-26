---
title: 安装
description: Cat Kit 安装指南
outline: deep
sidebarOrder: 2
---

# 安装

## 选择安装范围

CatKit 是按包发布的 ESM 工具库。安装原则很简单：你会直接 `import` 哪个包，就安装哪个包。

## 安装命令

最常见的起点是 `@cat-kit/core`：

::: code-group

```bash [bun]
bun add @cat-kit/core
```

```bash [pnpm]
pnpm add @cat-kit/core
```

```bash [npm]
npm install @cat-kit/core
```

:::

如果你会直接导入多个包，就一起安装：

```bash
bun add @cat-kit/core @cat-kit/fe
```

## 按需安装

| 需求                      | 建议安装                 |
| ------------------------- | ------------------------ |
| 只需要通用工具            | `@cat-kit/core`          |
| 浏览器请求客户端          | `@cat-kit/http`          |
| 浏览器存储、文件、Web API | `@cat-kit/fe`            |
| Node/Bun 后端工具         | `@cat-kit/be`            |
| Excel 导入导出            | `@cat-kit/excel`         |
| monorepo 构建、版本、发布 | `@cat-kit/maintenance`   |
| AI 协作工作流             | `@cat-kit/agent-context` |

如果一个项目会直接导入多个包，就把这些包一起安装。`@cat-kit/http`、`@cat-kit/fe`、`@cat-kit/be`、`@cat-kit/excel` 内部会依赖 `@cat-kit/core`，但如果你的代码也会直接导入 `@cat-kit/core`，仍然建议显式安装。

## 环境要求

- 模块格式：ESM
- Node.js：`>= 16`
- 浏览器：现代浏览器，需支持原生 ES 模块与 ES2020+

Node.js 项目通常需要在 `package.json` 中启用 ESM：

```json
{ "type": "module" }
```

## TypeScript 建议

如果你使用 TypeScript，保持现代模块解析即可：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true
  }
}
```

类型导入建议使用标准的 `type` 语法：

```ts
import { HTTPClient, type HTTPResponse } from '@cat-kit/http'
```

## 验证安装

```ts
import { date } from '@cat-kit/core'

console.log(date('2026-03-13').format('YYYY-MM-DD'))
```

如果这段代码可以被正常类型检查并运行，说明最基础的安装链路已经可用。

## 常见问题

### 导入报错

优先检查这三项：

- 是否真的安装了你直接导入的包
- Node.js 版本是否至少为 16
- 项目是否仍在使用 CommonJS

### CommonJS 可以直接用吗

不建议。CatKit 以 ESM 为主，CommonJS 项目应改为 ESM，或在 Node.js 中使用动态导入：

```js
const { date } = await import('@cat-kit/core')
```

## 下一步

- [指南总览](/guide/getting-started)
- [Core 核心包](/packages/core/)
- [HTTP 请求包](/packages/http/)
- [FE 前端工具包](/packages/fe/)
- [BE 后端工具包](/packages/be/)
