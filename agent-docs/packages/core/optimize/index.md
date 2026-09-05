---
title: "执行控制 防抖节流延时并发"
description: "@cat-kit/core 的 debounce/throttle/sleep/parallel/safeRun：执行控制工具集"
---

# 执行控制 防抖节流延时并发

`@cat-kit/core` 的执行控制工具覆盖高频事件的防抖与节流（`debounce`/`throttle`）、异步延时（`sleep`）、按并发上限执行任务数组（`parallel`），以及只捕获同步异常的 `safeRun`。

## 适用场景

防抖、节流、延时、限并发任务、捕获同步异常。

## 推荐公开 API

`debounce`、`throttle`、`sleep`、`parallel`、`safeRun`

```ts
import { debounce, parallel, sleep } from '@cat-kit/core'

const onResize = debounce(() => {}, 300)
await parallel([async () => 1, async () => 2], { concurrency: 1 })
await sleep(100)
```

## 约束

- `debounce` 默认 `300ms`、`immediate: true`；窗口内再调用最终 trailing 一次
- `throttle` 仅 leading；被抑制调用返回最近一次结果
- `parallel` 保持结果顺序；默认全并发；`concurrency` 须为正整数；拒绝后已启动任务不取消
- `safeRun` 只捕获同步抛错

## 类型声明

- [packages/core/dist/optimize/timer.d.ts](../../../../packages/core/dist/optimize/timer.d.ts)
- [packages/core/dist/optimize/parallel.d.ts](../../../../packages/core/dist/optimize/parallel.d.ts)
- [packages/core/dist/optimize/safe.d.ts](../../../../packages/core/dist/optimize/safe.d.ts)

## 更多

- API：[执行控制 API](apis.md)
