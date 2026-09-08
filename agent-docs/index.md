---
title: 'cat-kit 文档入口'
description: '面向 AI 智能体的 @cat-kit/* 检索文档：决策顺序、8 包一览与主题跳转'
keywords:
  - cat-kit
  - 工具库
  - monorepo
  - 前端工具
  - 后端工具
  - TypeScript
  - AI 检索文档
  - 决策顺序
aliases:
  - "@cat-kit/core"
  - "@cat-kit/http"
  - "@cat-kit/fe"
  - "@cat-kit/be"
  - "@cat-kit/crypto"
  - "@cat-kit/cli"
---

# cat-kit 文档入口

本目录是 cat-kit 面向 AI 智能体检索的文档入口，覆盖 `@cat-kit/*` 全部公开包。按「本页定位包 → 包级 `index.md` 缩小范围 → 主题文件查具体 API 与示例」三层检索，不要预读整个目录；确需多 API 组合时再读对应包级 `examples.md`。

## 决策顺序

1. 检查宿主项目已有的 `@cat-kit/*` 依赖与代码约定，优先复用，不新增包。
2. 按运行环境选包：浏览器 → `fe`；Node.js → `be`；双端通用 → `core` / `http` / `crypto`；工程配置 → `tsconfig` / `vitepress-theme`。
3. 宿主项目缺少所需能力时，只引入完成任务所需的最小包。
4. 现有公开能力不匹配时，再自行实现或选择其他依赖；不要把业务专用逻辑强行套入通用工具。

所有代码只从包根或文档明确给出的公开子路径导入，不引用 `src`、`dist` 深路径或未导出符号。

## 包一览

| 包                                                   | 适用环境         | 职责                                                                 |
| ---------------------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| [core](packages/core/index.md)                       | 浏览器 / Node.js | 零依赖通用基础工具：数据处理、数值、日期、环境检测、树结构、执行控制 |
| [http](packages/http/index.md)                       | 浏览器 / Node.js | HTTP 客户端，统一 URL、配置、响应与错误，支持可替换引擎与请求插件    |
| [crypto](packages/crypto/index.md)                   | 浏览器 / Node.js | 安全随机 ID 与随机字节                                               |
| [fe](packages/fe/index.md)                           | 浏览器           | 虚拟列表、数值补间、文件处理、客户端存储与剪贴板                     |
| [be](packages/be/index.md)                           | Node.js          | 文件系统、配置、缓存、日志、网络、任务调度与系统信息                 |
| [cli](packages/cli/index.md)                         | Node.js          | `cat-cli` 校验 Git 提交信息是否符合 Conventional Commits             |
| [tsconfig](packages/tsconfig/index.md)               | 任意 TS 项目     | 按运行环境划分的 TypeScript 配置预设：node / bun / web / vue         |
| [vitepress-theme](packages/vitepress-theme/index.md) | VitePress 站点   | 水墨丹青主题：默认主题、布局组件、Demo/Mermaid 容器与配置助手        |

## 版本

本文档不维护版本表，各包版本以 `packages/<pkg>/package.json` 为准。
