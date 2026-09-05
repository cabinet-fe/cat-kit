---
title: "任意值拷贝 copy 示例"
description: "@cat-kit/core 的 copy：嵌套隔离、函数引用保持、循环引用快照"
---

# 任意值拷贝 copy 示例

以下示例演示 `copy` 的嵌套隔离、函数引用保持与循环引用处理。

```ts
import { copy } from '@cat-kit/core'

const state = { count: 1, nested: { n: 2 }, createdAt: new Date(), run: () => 'ok' }
const snapshot = copy(state)

snapshot.nested.n = 9
state.nested.n // 2
snapshot.run === state.run // true，函数保留同一引用

const cyclic: { self?: unknown } = {}
cyclic.self = cyclic
const clonedCyclic = copy(cyclic)
clonedCyclic.self === clonedCyclic // true，快照内循环引用仍指向自身
```
