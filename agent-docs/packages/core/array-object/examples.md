---
title: "数组与对象工具示例"
description: "@cat-kit/core 数组与对象工具示例：unionBy 按字段去重、pick/move/groupBy/set 用法"
keywords:
  - unionBy
  - pick
  - move
  - groupBy
  - set 路径赋值
  - 数组示例
  - 链式操作示例
aliases:
  - 按字段去重示例
  - 对象字段挑选
  - 数组元素移动
  - 示例代码
---

# 数组与对象工具示例

以下示例演示 `unionBy` 按字段去重、`o().pick`、`arr().move/groupBy` 与 `o().set` 的组合用法。

```ts
import { arr, o, unionBy } from '@cat-kit/core'

const users = unionBy(
  'id',
  [{ id: 1, name: '旧名称' }],
  [
    { id: 1, name: '新名称' },
    { id: 2, name: '第二位' }
  ]
)
// unionBy 保留首次出现 → id:1 仍为「旧名称」

const publicUser = o(users[0]!).pick(['id', 'name'])

const moved = arr(['a', 'b', 'c']).move(0, 2) // ['b', 'c', 'a']
const grouped = arr(users).groupBy((u) => (u.id === 1 ? 'one' : 'other'))

o({ a: 1, b: { c: 2 } }).set('b.c', 9)
```
