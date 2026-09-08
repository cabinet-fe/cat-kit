---
title: "cat-kit 文档入口"
description: cat-kit 全部 8 个公开包的 AI 检索入口：按运行环境选包、安装命令、包级文档路径速查与常见任务路由。
keywords: [cat-kit, "@cat-kit/core", "@cat-kit/http", "@cat-kit/fe", "@cat-kit/be", "@cat-kit/crypto", "@cat-kit/cli", 工具库, monorepo, 选包, 安装, 虚拟滚动, HTTP 客户端, 深拷贝, 日期处理, Cron 调度]
aliases: [catkit, 喵喵工具箱, cabinet-fe, cat-kit 文档]
---

# cat-kit 文档入口

cat-kit 是 TypeScript monorepo（仓库 `cabinet-fe/cat-kit`），包含 8 个公开包：通用工具（core）、HTTP 客户端（http）、前端工具（fe）、后端工具（be）、安全随机（crypto）、提交校验 CLI（cli）、TypeScript 预设（tsconfig）与 VitePress 主题（vitepress-theme）。本页负责选包与路由；具体 API 一律进各包文档查阅，不预读整个目录。

## 安装

按运行环境选包，只引入完成任务所需的最小集合：

| 运行环境 | 可选包 |
| --- | --- |
| 浏览器 | `fe`、`core`、`http`、`crypto` |
| Node.js | `be`、`core`、`http`、`crypto` |
| 浏览器 + Node.js 双端 | `core`、`http`、`crypto` |
| 工程配置（不进运行时） | `tsconfig`、`vitepress-theme`、`cli` |

各包安装命令（`core`/`be`/`fe`/`http` 同理，替换包名即可）：

```bash
npm install @cat-kit/core
```

```bash
pnpm add @cat-kit/core
```

```bash
bun add @cat-kit/core
```

`cli` 设计为一次性执行，通常不安装，直接用 `npx @cat-kit/cli` 或 `bunx @cat-kit/cli`。`tsconfig` 与 `vitepress-theme` 是开发期依赖，用 `npm install -D`（或对应包管理器的 dev 参数）安装。

导入约束（全部包统一）：只从各包文档写明的公开入口导入。`core`、`be`、`fe`、`http`、`crypto` 仅提供包根入口（如 `import { copy } from '@cat-kit/core'`）；`vitepress-theme` 另有 `./config` 与样式子路径；`cli` 提供 `./commands/*` 深路径。禁止引用 `src`、`dist` 深路径或未导出符号。

各包版本以 `packages/<pkg>/package.json` 为准，本目录不维护版本表。

## 模块速查

| 包 | 环境 | 职责 | 文档 |
| --- | --- | --- | --- |
| core | 浏览器 / Node.js | 深拷贝、数组对象链式操作、类型守卫、字节编码与 schema 校验、浮点精度数值、日期、环境检测、树结构、防抖节流并发、状态订阅 | `packages/core/index.md` |
| http | 浏览器 / Node.js | HTTP 客户端：Fetch/XHR 双引擎、插件体系、Token 无感刷新、Method-Override、下载进度与中止 | `packages/http/index.md` |
| fe | 浏览器 | 虚拟滚动列表、数值补间动画、localStorage/sessionStorage/Cookie、剪贴板与权限预查、文件分块读取与保存 | `packages/fe/index.md` |
| be | Node.js | LRU/文件缓存与记忆化、多格式配置加载、文件系统、分级日志、端口与网络信息、Cron 与延时调度、CPU/内存/磁盘快照 | `packages/be/index.md` |
| crypto | 浏览器 / Node.js | 基于 Web Crypto 的随机 ID 与随机字节（nanoid 移植） | `packages/crypto/index.md` |
| cli | Node.js | `cat-cli verify-commit`：校验 Git 提交信息是否符合 Conventional Commits | `packages/cli/index.md` |
| tsconfig | 任意 TS 项目 | 按运行环境划分的 TypeScript 配置预设：base / node / bun / web / vue | `packages/tsconfig/index.md` |
| vitepress-theme | VitePress 站点 | 水墨丹青主题：默认主题扩展、Demo/Mermaid 容器、配置助手 | `packages/vitepress-theme/index.md` |

常见任务路由：

| 任务 | 入口文档 |
| --- | --- |
| 深拷贝 / 防抖节流 / 日期格式化 / 浮点精度 | `packages/core/index.md` |
| 发请求、拦截 401 刷新 Token、下载进度 | `packages/http/client/apis.md`、`packages/http/plugins/apis.md` |
| 大列表虚拟滚动 | `packages/fe/virtualizer/apis.md` |
| 本地存储与 Cookie 读写 | `packages/fe/storage/apis.md` |
| Node 端缓存、日志、Cron 定时任务 | `packages/be/cache/index.md`、`packages/be/logger/index.md`、`packages/be/scheduler/index.md` |
| 生成随机 ID / 验证码 | `packages/crypto/nanoid/apis.md` |
| 提交信息校验（commit-msg hook） | `packages/cli/index.md` |
| 新项目选 TS 预设 | `packages/tsconfig/index.md` |
| VitePress 站点接入主题 | `packages/vitepress-theme/index.md` |
