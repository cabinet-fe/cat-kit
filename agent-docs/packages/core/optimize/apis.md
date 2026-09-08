---
title: "debounce 与 parallel 执行控制 API"
description: "@cat-kit/core 执行控制 API：debounce 防抖的 leading+trailing 语义、throttle 节流返回值、parallel 并发上限与拒绝行为、safeRun 捕获范围，全部签名与约束。"
aliases: [防抖 API, 节流 API, 并发控制 API, 执行控制 API]
keywords: [debounce, throttle, sleep, parallel, safeRun, ParallelOptions, concurrency, immediate, 防抖, 节流, 延时, 限并发, 并发上限, 异常捕获, Promise]
---

# debounce 与 parallel 执行控制 API

`@cat-kit/core` 导出 `debounce`、`throttle`、`sleep`、`parallel`、`safeRun` 五个函数。包装函数保留 `this` 与参数；`parallel` 是异步函数，返回按任务顺序排列的 `Promise<T[]>`；`concurrency` 非正整数时抛 `Error`。

## 快速上手

```ts
import { debounce } from '@cat-kit/core'

const onResize = debounce(() => {
  console.log('resized')
}, 300, true)

onResize()
// 立即输出 'resized'（immediate=true 首次立即执行）
// 若 300ms 窗口内再次调用，窗口结束后用最后参数再补发一次
```

## API 签名

```ts
/**
 * 防抖。immediate=true（默认）：空闲期首个调用立即执行；
 * 窗口内的后续调用把执行推迟到窗口结束，用最后一次参数执行。
 * immediate=false：所有调用都在停止触发 delay 后执行一次（trailing）。
 */
export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  delay?: number,
  immediate?: boolean
): (this: any, ...args: T) => void

/**
 * 节流。首个调用立即执行；delay 毫秒内的后续调用被抑制，
 * 返回最近一次执行的结果；cb 只在真正执行时收到结果。
 */
export function throttle<T extends any[], R>(
  fn: (...args: T) => R,
  delay?: number,
  cb?: (v: R) => void
): (this: any, ...args: T) => R

/** 等待 ms 毫秒 */
export function sleep(ms: number): Promise<void>

export interface ParallelOptions {
  /**
   * 并发上限：缺省等于 tasks.length（全部并发）；
   * 必须为正整数，否则抛 Error('parallel: options.concurrency 必须为正整数')
   */
  concurrency?: number
}

/** 限并发执行任务；结果与任务顺序一致；任一任务失败整体 reject，已启动任务不会取消 */
export function parallel<T>(
  tasks: ReadonlyArray<() => T | Promise<T>>,
  options?: ParallelOptions
): Promise<T[]>

/** 捕获同步异常：fn 同步抛错时返回 defaultVal（未提供则 undefined）；返回的 Promise reject 不会被捕获 */
export function safeRun<T>(fn: () => T): T | undefined
export function safeRun<T>(fn: () => T, defaultVal: T): T
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | :---: |
| `fn`（`debounce`） | `(...args: T) => void` | — | 是 | 返回值被丢弃 |
| `delay`（`debounce` / `throttle`） | `number` | `300` | 否 | 毫秒 |
| `immediate`（`debounce`） | `boolean` | `true` | 否 | `true` 为 leading + trailing（见注意事项）；`false` 为纯 trailing |
| `fn`（`throttle`） | `(...args: T) => R` | — | 是 | 返回值经包装函数与 `cb` 透出 |
| `cb`（`throttle`） | `(v: R) => void` | — | 否 | 只在真正执行时调用，被抑制的调用不触发 |
| `ms`（`sleep`） | `number` | — | 是 | 毫秒；`0` 在下一个定时器轮次 resolve |
| `tasks`（`parallel`） | `ReadonlyArray<() => T \| Promise<T>>` | — | 是 | 每项是返回值或 Promise 的任务函数；数组本身不被修改 |
| `options.concurrency`（`parallel`） | `number` | `tasks.length` | 否 | 正整数；非法值抛 `Error('parallel: options.concurrency 必须为正整数')` |
| `fn`（`safeRun`） | `() => T` | — | 是 | 只捕获同步抛错；异步 reject 原样向外传播 |
| `defaultVal`（`safeRun`） | `T` | `undefined` | 否 | 仅在捕获异常时返回 |

## 方法与事件

- `debounce` / `throttle` 返回的包装函数：同步调用、返回节流的最近结果（`throttle`）或 `undefined`（`debounce`）；内部用 `fn.call(this, ...)` 绑定调用方 `this`。
- `sleep`：异步；`await sleep(ms)` 后继续，无取消接口。
- `parallel`：异步；resolve 为与 `tasks` 等长、按任务顺序排列的结果数组；首个失败的任务使整体以该错误 reject，此后未启动的任务不再启动，已启动任务的执行不会被取消；空数组 resolve 为 `[]`。
- `safeRun`：同步执行 `fn`；`fn` 返回 Promise 时异常发生在微任务中，`safeRun` 不会捕获。

## 典型示例

### 防抖搜索：leading + trailing

```ts
import { debounce, sleep } from '@cat-kit/core'

const seen: string[] = []
const search = debounce((kw: string) => {
  seen.push(kw)
}, 300, true)

search('a') // 立即执行，seen => ['a']
search('ab') // 窗口内：等待
search('abc') // 窗口内：重置等待
await sleep(350)
console.log(seen) // => ['a', 'abc']（窗口收尾用最后参数补发一次）
```

### 限并发拉取接口

```ts
import { parallel } from '@cat-kit/core'

const ids = [1, 2, 3, 4, 5]
const results = await parallel(
  ids.map((id) => async () => {
    const res = await fetch(`https://api.example.com/users/${id}`)
    return res.json() as Promise<{ id: number }>
  }),
  { concurrency: 2 } // 最多同时 2 个请求
)
console.log(results.map((r) => r.id)) // => [1, 2, 3, 4, 5]（与任务顺序一致）
```

### safeRun 兜底解析

```ts
import { safeRun } from '@cat-kit/core'

const parsed = safeRun(() => JSON.parse('{"ok":true}') as { ok: boolean }, { ok: false })
console.log(parsed.ok) // => true

const fallback = safeRun(() => JSON.parse('not-json') as { ok: boolean }, { ok: false })
console.log(fallback.ok) // => false（同步抛错被捕获并返回默认值）
```

## 注意事项

> [!WARNING]
> - 本库 `debounce` 的 `immediate: true`（默认值）是 leading + trailing：首次立即执行，窗口收尾还会用最后参数补发一次；lodash 的 leading 防抖在首次执行后丢弃窗口内调用，不会补发。
> - `debounce` / `throttle` 不返回 Promise、不透出被抑制调用的返回值（`debounce` 的 `fn` 返回值直接丢弃）；需要拿到结果时用 `throttle` 的 `cb` 参数。
> - `throttle` 的计时基准是 `Date.now()`：首个调用立即执行（leading），没有 trailing 补发；窗口内被抑制的调用返回最近一次执行的结果。
> - `parallel` 任一任务失败即整体 reject；需要「失败也继续、失败位给默认值」时在任务内部 try/catch，不要依赖 `parallel` 聚合错误。
> - `safeRun` 只捕获同步异常：`safeRun(() => fetch(url))` 的网络拒绝不会被捕获。
