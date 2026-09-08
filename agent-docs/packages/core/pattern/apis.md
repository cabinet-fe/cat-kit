---
title: "Observable 可观察状态 API"
description: "@cat-kit/core Observable 类完整 API：observe 订阅回调值元组与触发时序、unobserve 退订规则、trigger 手动触发、setState 批量赋值，同步/异步与 once/immediate 组合语义。"
aliases: [observable API, 状态订阅 API, 观察者 API]
keywords: [Observable, observe, unobserve, unobserveHandler, trigger, setState, getState, destroyAll, ObserveOptions, PropHandler, once, immediate, sync, 微任务, 属性订阅, Proxy]
---

# Observable 可观察状态 API

`@cat-kit/core` 导出 `Observable<S extends object>` 类。`new Observable(data)` 后 `state` 是包裹 `data` 的 Proxy：顶层属性赋值时触发订阅回调，回调收到按订阅属性顺序排列的值元组（触发瞬间捕获）。赋值与旧值全等（`===`）时不触发。

## 快速上手

```ts
import { Observable } from '@cat-kit/core'

const store = new Observable({ count: 0, name: 'a' })

const stop = store.observe(['count', 'name'], (values) => {
  console.log(`count=${values[0]},name=${values[1]}`)
})

store.state.count = 1 // 微任务中输出 count=1,name=a
stop() // 退订；之后赋值不再触发
```

## API 签名

```ts
export interface PropHandler {
  /** 观察的属性名数组 */
  params: string[]
  /** 属性变化回调，参数为按 params 顺序捕获的值 */
  callback: (state: any) => void | Promise<void>
  /** 同步执行回调 */
  sync?: boolean
  /** 只执行一次后自动退订 */
  once?: boolean
}

export interface ObserveOptions {
  /** 订阅时立即用当前值执行一次（不消耗 once） */
  immediate?: boolean
  /** 首次触发后自动退订 */
  once?: boolean
  /** 同步执行回调；缺省在微任务中执行 */
  sync?: boolean
}

export declare class Observable<S extends object, K extends keyof S = keyof S> {
  /** Proxy 包裹的状态对象，直接对其赋值触发订阅 */
  readonly state: S

  constructor(data: S)

  /**
   * 订阅属性变化；返回取消订阅函数
   * callback(values) 的 values 是按 props 顺序的值元组
   */
  observe<const P extends K[]>(
    props: P,
    callback: (values: { [key in keyof P]: S[P[key]] }) => void,
    options?: ObserveOptions
  ): () => void

  /** 手动触发指定属性的订阅回调（值取当前值） */
  trigger(prop: string | symbol): void

  getState(): S
  /** Object.assign 合并到 state；逐键触发订阅；返回自身 */
  setState(state: Partial<S>): Observable<S, K>

  /** 移除一个处理器（所有相关属性上） */
  unobserveHandler(handler: PropHandler): void
  /** 移除属性上的处理器；handler 缺省时移除这些属性上的全部处理器 */
  unobserve<const P extends K[]>(props: P, handler?: PropHandler): void

  /** 清空全部处理器与待执行微任务 */
  destroyAll(): void
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | :---: |
| `data`（构造） | `S extends object` | — | 是 | 初始状态对象；`Observable` 不做深拷贝，`state` 的赋值直接落在 `data` 上 |
| `props`（`observe`） | `K[]` | — | 是 | 顶层属性名数组；嵌套属性不追踪 |
| `callback`（`observe`） | `(values) => void \| Promise<void>` | — | 是 | `values` 元组顺序与 `props` 一致，值在触发瞬间捕获；回调抛错仅 `console.error`，不影响其他任务 |
| `options.immediate` | `boolean` | `false` | 否 | 订阅时同步执行一次；不消费 `once`，不进入微任务队列 |
| `options.once` | `boolean` | `false` | 否 | 首次触发（含微任务触发）后自动移除该处理器 |
| `options.sync` | `boolean` | `false` | 否 | `true` 时回调在赋值调用栈内同步执行；缺省排队到微任务 |
| `prop`（`trigger`） | `string \| symbol` | — | 是 | 只触发订阅了该属性的处理器 |
| `state`（`setState`） | `Partial<S>` | — | 是 | 逐键赋值；与旧值 `===` 相等的键不触发 |

## 方法与事件

- 触发时序：对 `state.prop` 赋值 → 与旧值全等则跳过 → 否则写入并触发该属性的处理器。缺省配置下回调进入微任务队列，同一次赋值对应的值在入队时捕获；多次赋值产生多个回调任务，按触发顺序执行。
- `sync: true`：回调在赋值语句内同步执行；`once` 处理器执行后立即移除。
- `observe` 返回的退订函数：调用后该处理器从全部订阅属性上移除；重复调用无副作用。
- `unobserve(['a', 'b'])` 不带 `handler`：移除这两个属性上的全部处理器；带 `handler` 时只移除该处理器。
- `destroyAll()`：清空处理器映射与待执行的微任务队列；已入队未执行的任务被丢弃。
- 全部方法同步执行（回调异步性由 `sync` 决定）；方法本身不抛错，回调异常在微任务中被 `console.error`。

## 典型示例

### once 与 immediate 组合

```ts
import { Observable } from '@cat-kit/core'

const store = new Observable({ ready: false })
const fired: boolean[] = []

store.observe(['ready'], ([ready]) => {
  fired.push(ready)
}, { once: true, immediate: true })

console.log(fired) // => [false]（immediate 同步执行一次）
store.state.ready = true
console.log(fired) // => [false, true]
```

### 同步订阅与手动触发

```ts
import { Observable } from '@cat-kit/core'

const store = new Observable({ step: 0 })
const log: string[] = []

store.observe(['step'], ([step]) => log.push(`step:${step}`), { sync: true })

store.setState({ step: 1 }) // 同步回调，无需 await
console.log(log) // => ['step:1']

store.trigger('step') // 手动触发；值仍为 1
console.log(log) // => ['step:1', 'step:1']
```

### 表单联动

```ts
import { Observable, sleep } from '@cat-kit/core'

interface FormState {
  country: string
  province: string
}
const form = new Observable<FormState>({ country: 'CN', province: '' })

const unwatch = form.observe(['country'], ([country]) => {
  form.state.province = '' // 国家切换时清空省份
  console.log(`country=${country}`)
})

form.state.country = 'US'
await sleep(0) // 等待微任务回调执行
console.log(form.state.province) // => ''
unwatch()
```

## 注意事项

> [!WARNING]
> - 本库是浅层订阅：只追踪 `state` 顶层属性的赋值；`state.nested.x = 1` 不触发任何回调，需要替换整个嵌套对象（`state.nested = {...}`）。
> - 赋新值与旧值 `===` 全等时不触发（`NaN` 除外，`NaN !== NaN` 每次都会触发）。
> - 默认回调在微任务中执行且逐次触发：连续两次 `count += 1` 产生两次回调，回调里的值是各次触发瞬间的快照；不是 Vue `watch` 的自动批处理合并。
> - `immediate` 立即执行不消费 `once`：`once + immediate` 的首次触发发生在下一次真实赋值。
> - `trigger` 只触发订阅回调，不修改属性值；与 Vue 的 `forceUpdate` 语义不同。
> - `destroyAll` 会丢弃微任务队列中尚未执行的回调，正在等待回调的代码不会再被通知。
