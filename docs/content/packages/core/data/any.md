---
title: 任意值拷贝
sidebarOrder: 15
---

# 任意值拷贝

## 介绍

`copy` 用于深拷贝任意值：优先委托 native `structuredClone`（循环引用、Date、Map/Set、TypedArray 等交给引擎）。**Proxy**（Vue 3 响应式对象也是 Proxy）不能结构化克隆，会改走图遍历，**不向外抛错**。

与旧的 `o().copy()`（JSON 语义）不同：`copy` 会保留函数引用、保留 Date/Map 等类型，并支持循环引用。`o().copy()` 已移除。

## 快速使用

```typescript
import { copy } from '@cat-kit/core'

const state = { a: 1, nested: { b: 2 }, createdAt: new Date() }
const snapshot = copy(state)

snapshot.nested.b = 9
state.nested.b // 2
```

Vue 响应式对象会产出**普通数据快照**（不保留响应式）：

```typescript
import { copy } from '@cat-kit/core'
import { reactive } from 'vue'

const state = reactive({ count: 1, nested: { n: 2 } })
const snapshot = copy(state)
snapshot.count = 9
state.count // 1
```

## API参考

```typescript
function copy<T>(value: T): T
```

| 参数    | 说明   |
| ------- | ------ |
| `value` | 任意值 |

返回与输入同类型的快照。原始值（含 `null`）与函数原样返回。

### 策略

1. `null` / 非 object：原样返回。
2. 根对象是 Proxy：直接图遍历（Vue 3 `reactive` / `readonly` 属于这一类，不读 `__v_*` 之类的框架私有字段）。
3. 存在 `globalThis.structuredClone`：走 native；抛错则回退。
4. 无 `structuredClone`（如 Node 16）：走同一套图遍历。

Node / Bun 可用 `util.types.isProxy` 在抛错前识别 Proxy。浏览器没有等价 API，会先尝试 `structuredClone`，对 Proxy 抛错后再回退。

### 回退遍历

- 循环引用：`WeakMap`
- `Date` / `RegExp` / `Array` / `Map` / `Set` / `ArrayBuffer` / TypedArray / `DataView`
- 普通对象：拷贝自有可枚举键（含 symbol 键），**不保留 class 原型方法**（与 `structuredClone` 一致）
- 函数：保留同一引用（native `structuredClone` 会抛；旧 JSON 拷贝会丢掉函数）
- `Blob` / `File` 等：优先指望 native；回退时保留引用

native `structuredClone` **不会**拷贝 symbol 键；只有回退路径会保留可枚举 symbol 键。

### 与旧 `o().copy()` 的差异

|           | 旧 `o().copy()`（已移除） | `copy`               |
| --------- | ------------------------- | -------------------- |
| 函数      | 丢弃                      | 保留同一引用         |
| Date      | 变成字符串                | 仍为 Date            |
| 循环引用  | 抛错                      | 保留                 |
| Vue Proxy | 取决于 JSON 序列化        | 普通对象快照，不抛错 |
