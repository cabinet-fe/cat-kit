---
title: "Observable 可观察状态模块"
description: "@cat-kit/core 的 pattern 模块：Observable 基于 Proxy 对普通对象做浅层属性订阅，回调默认进微任务、可同步执行、支持 once 与 immediate，返回取消订阅函数。"
aliases: [观察者模块, 状态订阅模块, observer 模块]
keywords: [Observable, observe, unobserve, trigger, setState, ObserveOptions, PropHandler, 状态订阅, 属性监听, 微任务, 发布订阅]
---

# Observable 可观察状态模块

`pattern` 模块从 `@cat-kit/core` 导出 `Observable` 类：构造时用 Proxy 包裹初始状态对象，通过 `observe(props, callback, options?)` 订阅指定顶层属性，赋值触发回调。回调默认在微任务中异步执行，`sync: true` 同步执行；`once` 自动退订；`immediate` 立即以当前值执行一次。适合不引入响应式框架的轻量状态同步。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { Observable } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `Observable` | 可观察状态类：`observe`、`unobserve`、`trigger`、`setState`、`getState`、`destroyAll` | `packages/core/pattern/apis.md` |

类型导出：`ObserveOptions`（订阅选项）、`PropHandler`（订阅处理器描述）。`Observable` 内部的微任务队列与暂停标记未导出；模块只含这一个类，浅层订阅意味着嵌套对象内部的变化不会被追踪。
