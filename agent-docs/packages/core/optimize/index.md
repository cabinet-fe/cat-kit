---
title: "执行控制模块（debounce / parallel）"
description: "@cat-kit/core 的 optimize 模块：防抖 debounce（leading+trailing）、节流 throttle、延时 sleep、限并发任务执行 parallel 与同步异常捕获 safeRun。"
aliases: [执行控制模块, 防抖节流模块, 并发控制模块]
keywords: [debounce, throttle, sleep, parallel, safeRun, concurrency, 防抖, 节流, 延时, 限并发, 异常捕获]
---

# 执行控制模块（debounce / parallel）

`optimize` 模块从 `@cat-kit/core` 导出 5 个执行控制函数：`debounce` 防抖（默认 `delay` 300ms、`immediate` true，leading 触发后窗口收尾再补发一次）、`throttle` 节流（仅 leading 触发，抑制期返回最近一次结果）、`sleep` 异步延时、`parallel` 按并发上限执行任务数组并保持结果顺序、`safeRun` 捕获同步异常并提供默认值。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { debounce, parallel, safeRun, sleep, throttle } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `debounce` | 防抖：`immediate` true 时首次立即执行，窗口内重复调用在收尾再执行一次 | `packages/core/optimize/apis.md` |
| `throttle` | 节流：首个调用立即执行，间隔内抑制；被抑制调用返回最近结果 | `packages/core/optimize/apis.md` |
| `sleep` | 等待指定毫秒，返回 `Promise<void>` | `packages/core/optimize/apis.md` |
| `parallel` | 限并发执行任务数组，结果按任务顺序排列 | `packages/core/optimize/apis.md` |
| `safeRun` | 捕获同步抛错；第二参为默认返回值 | `packages/core/optimize/apis.md` |

类型导出：`ParallelOptions`（`parallel` 的并发配置）。debounce/throttle 返回的包装函数保留 `this` 与全部参数。
