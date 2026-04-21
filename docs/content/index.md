---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 一站式 TypeScript 工具库，统一浏览器、Node.js 与 Bun 开发体验。
  image:
    src: /logo.png
    alt: CatKit
  actions:
    - theme: brand
      text: 指南总览
      link: /guide/getting-started

    - theme: alt
      text: GitHub
      link: https://github.com/cabinet-fe/cat-kit

features:
  - title: 现代 API 设计
    details: 简洁直观的函数式 API，符合现代 JavaScript 开发习惯，学习成本低，上手即用。

  - title: 完整类型推导
    details: 从输入到输出的全链路类型安全，智能提示开箱即用，编译时捕获潜在错误。

  - title: Tree-Shaking 友好
    details: 纯 ESM 模块，细粒度导出设计，只打包你使用的代码，保持应用体积最小。

  - title: 轻量零依赖
    details: 核心包零外部依赖，减少供应链风险，更小的包体积，更快的安装速度。

  - title: 全栈链路
    details: 统一的 API 设计，支持浏览器和 Node.js/Bun 环境各种工具。

  - title: 工程化友好
    details: 使用 Turborepo、Changesets 与 tsdown 维护 monorepo，开发、测试和发布链路清晰。
---

## 安装

```bash
bun add @cat-kit/core
```

[查看指南总览](/guide/getting-started) 快速定位包与文档入口。

## 使用

```ts
import { date, parallel } from '@cat-kit/core'

const nextWeek = date('2026-04-21').addDays(7).format('YYYY-MM-DD')
const result = await parallel([() => Promise.resolve('cat'), () => Promise.resolve('kit')])

console.log(nextWeek, result)
```

## 包入口

- 基础能力：[Core 核心包](/packages/core/)
- 跨端请求：[HTTP 请求包](/packages/http/)
- 浏览器工具：[FE 前端工具包](/packages/fe/)
- Node.js / Bun 工具：[BE 后端工具包](/packages/be/)
- CLI 能力：[CLI 命令行工具包](/packages/cli/)
- AI 协作工作流：[Agent Context](/packages/agent-context/)
- TypeScript 预设：[TSConfig 预设](/packages/tsconfig/)
- 文档主题：[VitePress 主题](/packages/vitepress-theme/)
