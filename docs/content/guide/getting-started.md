---
title: 指南总览
description: 按场景快速找到 CatKit 的包、安装方式和文档入口
outline: deep
sidebarTitle: 指南总览
sidebarOrder: 1
---

# 指南总览

CatKit 是一组按运行环境和能力拆分的 TypeScript 工具包。阅读顺序建议是：先在本页定位包，再进入对应包入口页，最后去具体功能页查 API 与示例。

## 如何使用这份文档

- 不确定装什么：先看本页的“包总览”和“按场景找包”
- 已经知道包名：直接进入对应包入口页
- 已经知道具体能力：进入包入口页后，继续看该包下的功能页
- 只想先安装：跳到 [安装](/guide/installation)

## 安装

最小安装通常从 `@cat-kit/core` 开始：

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

如果你会直接导入多个包，就把这些包一起安装。完整安装方式、ESM 要求和验证步骤见 [安装](/guide/installation)。

## 包总览

| 包                       | 主要用途                                     | 适用环境                | 入口页                                           |
| ------------------------ | -------------------------------------------- | ----------------------- | ------------------------------------------------ |
| `@cat-kit/core`          | 数据处理、日期、环境检测、性能优化、设计模式 | Browser / Node.js / Bun | [Core 核心包](/packages/core/)            |
| `@cat-kit/http`          | HTTP 客户端、插件扩展、请求类型系统          | Browser / Node.js / Bun | [HTTP 请求包](/packages/http/)            |
| `@cat-kit/fe`            | 浏览器存储、文件处理、Web API、虚拟化        | Browser                 | [FE 前端工具包](/packages/fe/)            |
| `@cat-kit/be`            | 文件系统、配置、日志、缓存、网络、系统、调度 | Node.js / Bun           | [BE 后端工具包](/packages/be/)            |
| `@cat-kit/cli`           | 提交信息规范校验等命令行能力                 | Node.js                 | [CLI 命令行工具包](/packages/cli/)        |
| `@cat-kit/agent-context` | 为 AI 编程助手安装统一的协作工作流           | Node.js                 | [Agent Context](/packages/agent-context/) |
| `@cat-kit/tsconfig`      | TypeScript 配置预设                          | 编译期 / 工程配置       | [TSConfig 预设](/packages/tsconfig/)      |
| `@cat-kit/vitepress-theme` | CatKit 文档主题与 Markdown / Vite 辅助配置 | VitePress 2             | [VitePress 主题](/packages/vitepress-theme/) |

## 按场景找包

| 你的任务                                     | 推荐包                   | 继续阅读                                                                                                                              |
| -------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 通用工具函数、日期处理、数据结构             | `@cat-kit/core`          | [数据处理](/packages/core/data) / [日期处理](/packages/core/date)                                                                     |
| 浏览器或 Node/Bun 里发请求、做鉴权或插件扩展 | `@cat-kit/http`          | [HTTP 客户端](/packages/http/client) / [插件系统](/packages/http/plugins)                                                             |
| 浏览器存储、下载上传、文件读取、剪贴板、权限 | `@cat-kit/fe`            | [存储](/packages/fe/storage) / [文件操作](/packages/fe/file) / [Web API](/packages/fe/web-api)                                        |
| Node/Bun 侧文件、配置、日志、缓存、任务调度  | `@cat-kit/be`            | [文件系统](/packages/be/fs) / [配置管理](/packages/be/config) / [日志系统](/packages/be/logger)                                       |
| 校验提交信息、接入 commit-msg Hook           | `@cat-kit/cli`           | [提交信息校验](/packages/cli/verify-commit)                                                                                           |
| 让多个 AI 助手围绕同一份计划协作             | `@cat-kit/agent-context` | [协作协议](/packages/agent-context/protocols) / [CLI 命令](/packages/agent-context/cli)                                              |
| 给项目统一 TypeScript 配置                    | `@cat-kit/tsconfig`      | [TSConfig 预设](/packages/tsconfig/) / [预设说明](/packages/tsconfig/presets)                                                         |
| 搭建 CatKit 风格的 VitePress 站点             | `@cat-kit/vitepress-theme` | [VitePress 主题](/packages/vitepress-theme/) / [主题配置](/packages/vitepress-theme/config)                                         |

## AI 导航索引

这一节是给 AI 助手和全文检索用的稳定入口。优先按“任务关键词 -> 包 -> 页面”定位，再进入具体 API 页面。

| 任务或关键词                                                                                                      | 推荐包                   | 入口页                                           | 继续阅读                                                                                                                                                                           | 检索关键词                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 数组、对象、字符串、日期、比较、格式化、环境检测                                                                  | `@cat-kit/core`          | [Core 核心包](/packages/core/)                   | [数据处理](/packages/core/data) / [日期处理](/packages/core/date) / [环境检测](/packages/core/env)                                                                                 | `core data date env pattern optimize`                                                                                               |
| request、client、plugin、token、retry、method override、engine、types                                             | `@cat-kit/http`          | [HTTP 请求包](/packages/http/)                   | [HTTP 客户端](/packages/http/client) / [插件系统](/packages/http/plugins) / [类型定义](/packages/http/types)                                                                       | `http client plugins token retry engine types`                                                                                      |
| storage、localStorage、sessionStorage、cookie、file、save、read、clipboard、permission、virtualizer               | `@cat-kit/fe`            | [FE 前端工具包](/packages/fe/)                   | [存储](/packages/fe/storage) / [文件操作](/packages/fe/file) / [Web API](/packages/fe/web-api) / [虚拟化](/packages/fe/virtualizer)                                                | `fe storage file web api virtualizer`                                                                                               |
| fs、config、logger、cache、net、system、scheduler                                                                 | `@cat-kit/be`            | [BE 后端工具包](/packages/be/)                   | [文件系统](/packages/be/fs) / [配置管理](/packages/be/config) / [日志系统](/packages/be/logger) / [任务调度](/packages/be/scheduler)                                               | `be fs config logger cache net system scheduler`                                                                                    |
| commit、verify-commit、commit-msg、hook、conventional commit                                                      | `@cat-kit/cli`           | [CLI 命令行工具包](/packages/cli/)               | [提交信息校验](/packages/cli/verify-commit)                                                                                                                                        | `cli verify-commit commit-msg hook conventional commit`                                                                             |
| agent、ac-workflow、init、plan、replan、implement、patch、rush、review、done、CLI、prompt-gen、生命周期、协议流转 | `@cat-kit/agent-context` | [Agent Context](/packages/agent-context/)        | [协作协议](/packages/agent-context/protocols) / [AI 协作场景](/packages/agent-context/collaboration) / [CLI 命令](/packages/agent-context/cli)                                    | `agent-context ac-workflow lifecycle protocol routing init plan replan implement patch rush review done cli scope index prompt-gen upgrade` |
| tsconfig、extends、node、bun、web、vue                                                                             | `@cat-kit/tsconfig`      | [TSConfig 预设](/packages/tsconfig/)             | [预设说明](/packages/tsconfig/presets)                                                                                                                                               | `tsconfig presets node bun web vue`                                                                                                 |
| vitepress、theme、demo-container、mermaid、import-examples                                                         | `@cat-kit/vitepress-theme` | [VitePress 主题](/packages/vitepress-theme/)   | [主题配置](/packages/vitepress-theme/config)                                                                                                                                         | `vitepress theme demo-container mermaid import-examples`                                                                            |

## LLM 检索约定

- 先问“这是哪个包的能力”，再问“这个包里的哪一页”
- 查概览时优先看本页；查包边界时优先看各包 `index.md`
- 查 API、参数、返回值时进入对应功能页，不要停留在总览页
- 先根据运行环境筛选：
  - Browser：优先看 `http`、`fe`
  - Node.js / Bun：优先看 `be`、`cli`、`agent-context`
  - 全环境通用：优先看 `core`
- 若任务同时涉及基础能力和环境能力，通常先查 `core`，再查环境包
- 推荐检索短语：
  - `cat-kit core date`
  - `cat-kit http plugins`
  - `cat-kit fe storage`
  - `cat-kit be config`
  - `cat-kit cli verify-commit`
  - `cat-kit agent-context cli`
  - `cat-kit ac-workflow actions`

## 下一步

- [安装](/guide/installation)
- [Core 核心包](/packages/core/)
- [HTTP 请求包](/packages/http/)
- [FE 前端工具包](/packages/fe/)
- [BE 后端工具包](/packages/be/)
- [CLI 命令行工具包](/packages/cli/)
- [Agent Context](/packages/agent-context/)
- [TSConfig 预设](/packages/tsconfig/)
- [VitePress 主题](/packages/vitepress-theme/)
