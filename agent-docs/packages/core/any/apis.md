---
title: "copy 深拷贝"
description: "@cat-kit/core 的 copy 深拷贝任意值：structuredClone 优先，Proxy（Vue 3 响应式）与克隆异常时图遍历回退；循环引用安全，不向外抛错。"
aliases: [cloneDeep, structuredClone, clone, 深拷贝, 拷贝对象, 快照]
keywords: [copy, 深拷贝, structuredClone, 结构化克隆, 循环引用, Proxy, Vue 响应式, 响应式快照, 浅拷贝, 函数引用, Map, Set, TypedArray]
---

# copy 深拷贝

`@cat-kit/core` 导出 `copy(value)`：深拷贝任意值并返回同类型快照。优先使用原生 `structuredClone`；能探测到输入是 Proxy（Vue 3 响应式对象也是 Proxy，无法结构化克隆）时直接走图遍历，否则先尝试结构化克隆、抛错再回退图遍历。全程不向外抛错。

## 快速上手

```ts
import { copy } from '@cat-kit/core'

const source = {
  id: 1,
  tags: ['a', 'b'],
  meta: { createdAt: new Date('2024-01-01') }
}
const snapshot = copy(source)

snapshot.meta.createdAt = new Date('2025-06-01')
console.log(source.meta.createdAt.getFullYear()) // => 2024（原对象不受影响）
console.log(snapshot.tags === source.tags) // => false（嵌套数组是新数组）
```

## API 签名

```ts
/**
 * 深拷贝任意值。
 *
 * 优先原生 `structuredClone`；能探测到 Proxy 输入（Vue 3 响应式也是 Proxy）
 * 直接图遍历，否则捕获结构化克隆抛错后回退图遍历。不向外抛错。
 *
 * @param value 任意值
 * @returns 拷贝后的快照（原始值与函数原样返回）
 */
export function copy<T>(value: T): T
```

同步函数，无异步重载。

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `value` | `T`（任意值） | — | 是 | 任意值；`null`、原始值与函数原样返回（同一引用） |

返回类型 `T` 与入参同型；不抛错，任何输入都有返回值。

## 典型示例

### Vue 响应式对象转普通快照

```ts
import { copy } from '@cat-kit/core'

// reactive 返回的是 Proxy，structuredClone 对 Proxy 直接抛错
const state: any = new Proxy({ count: 1, list: [1, 2] }, {})
const plain = copy(state)

plain.count = 99
console.log(state.count) // => 1
console.log(Array.isArray(plain.list)) // => true
```

### 循环引用与嵌套对象

```ts
import { copy } from '@cat-kit/core'

interface Node {
  name: string
  self?: Node
}
const node: Node = { name: 'root' }
node.self = node

const cloned = copy(node)
console.log(cloned.self === cloned) // => true（快照内循环引用仍指向快照自身）
console.log(cloned === node) // => false
```

### 特殊对象的处理边界

```ts
import { copy } from '@cat-kit/core'

const source = {
  at: new Date('2024-01-01'),
  reg: /ab/gi,
  map: new Map([['k', { v: 1 }]]),
  set: new Set([1]),
  bytes: new Uint8Array([1, 2]),
  task: Promise.resolve(1),
  run: () => 'ok'
}
const cloned: any = copy(source)

console.log(cloned.at instanceof Date && cloned.at !== source.at) // => true（Date 深拷贝）
console.log(cloned.reg.flags) // => 'gi'（RegExp 深拷贝且保留 lastIndex）
console.log(cloned.map.get('k') !== source.map.get('k')) // => true（Map 深拷贝）
console.log(cloned.bytes instanceof Uint8Array && cloned.bytes !== source.bytes) // => true
console.log(cloned.task === source.task) // => true（Promise 保留原引用）
console.log(cloned.run === source.run) // => true（函数保留原引用）
```

## 注意事项

> [!WARNING]
> - 函数、`Promise`、`Error`、`WeakMap`、`WeakSet`、`Blob`、`FormData`、`SharedArrayBuffer` 保留原引用，不是新对象。
> - class 实例拷贝结果是普通对象，原型方法丢失；本库是「数据快照」，不是 lodash `cloneDeep`（后者保留原型链）。
> - 仅拷贝自有可枚举属性（含 `symbol` 键）；不可枚举属性、原型链属性不拷贝。
> - 本库是「不抛错、回退图遍历」，不是原生 `structuredClone` 的直接透传（后者对 Proxy、函数抛 `DataCloneError`）。
> - 拷贝 Proxy 时得到的是 Proxy 背后目标数据的快照，不保留响应式。
