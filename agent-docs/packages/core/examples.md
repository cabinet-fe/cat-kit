---
title: "@cat-kit/core 组合示例"
description: "core 包跨主题组合使用示例：schema 校验、高精度计算、日期格式化、树遍历与并发执行"
keywords:
  - 组合示例
  - $n
  - date format
  - object schema
  - parallel 并发
  - TreeManager
  - 树扁平化
  - safeParse
aliases:
  - 使用示例
  - 跨模块组合
  - 并发任务示例
  - 日期格式化示例
---

# @cat-kit/core 组合示例

本篇展示 `@cat-kit/core` 多个主题的 API 组合使用：对象 schema 校验、数值高精度运算、日期格式化、树结构扁平化与并发任务执行。

```ts
import {
  $n,
  date,
  object,
  parallel,
  TreeManager,
  vNumber,
  vString
} from '@cat-kit/core'

const schema = object({
  amount: vNumber(),
  label: vString()
})

const parsed = schema.parse({ amount: 19.9, label: 'item' })
const total = $n.mul(parsed.amount, 100)
const due = date().addDays(7).format('yyyy-MM-dd')

const tree = new TreeManager({
  id: 'root',
  children: [{ id: 'a' }, { id: 'b' }]
})

const ids = await parallel(
  tree.flatten((n) => n.id !== 'root').map((n) => async () => n.id),
  { concurrency: 2 }
)

console.log(total, due, ids)
```
