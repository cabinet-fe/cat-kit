---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 一站式 TypeScript 工具库，统一浏览器与 Node.js 开发体验，告别片段化依赖管理。
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

  - title: 完善文档
    details: 详尽易读的文档、完整的类型定义和 LLM 上下文支持，人机协作开发体验俱佳。
---

## 安装

```bash
bun add @cat-kit/core
```

[查看指南总览](/guide/getting-started)快速定位包与文档入口。

## 使用

```ts
import { $n } from '@cat-kit/core'
$n.calc('1 + 3 * (2 + 1)')
```

如果你使用 vite 做前端开发, 可以使用 [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) 插件， 这样可以免写导入语句。
