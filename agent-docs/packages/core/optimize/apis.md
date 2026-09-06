---
title: "执行控制 API"
description: "@cat-kit/core 执行控制签名：debounce/throttle/sleep/parallel/safeRun"
keywords:
  - debounce
  - throttle
  - sleep
  - parallel
  - safeRun
  - concurrency
  - 延时函数
  - 并发上限
aliases:
  - 函数签名
  - API 参考
  - 防抖函数签名
  - 并发任务执行
---

# 执行控制 API

本篇列出执行控制工具的完整函数签名，均从 `@cat-kit/core` 包根导入。

```ts
declare function debounce<T extends any[]>(
  fn: (...args: T) => void,
  delay?: number,
  immediate?: boolean
): (this: any, ...args: T) => void

declare function throttle<T extends any[], R>(
  fn: (...args: T) => R,
  delay?: number,
  cb?: (v: R) => void
): (this: any, ...args: T) => R

declare function sleep(ms: number): Promise<void>

declare function parallel<T>(
  tasks: Array<() => Promise<T> | T>,
  options?: { concurrency?: number }
): Promise<T[]>

declare function safeRun<T>(fn: () => T): T | undefined
declare function safeRun<T>(fn: () => T, defaultVal: T): T
```
