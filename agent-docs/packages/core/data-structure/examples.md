---
title: "树与森林数据结构示例"
description: "@cat-kit/core 树与森林示例：dfs 遍历与 TreeManager 扁平化过滤"
---

# 树与森林数据结构示例

以下示例演示 `dfs` 遍历树形数据与 `TreeManager` 按条件扁平化的用法。

```ts
import { TreeManager, dfs } from '@cat-kit/core'

const data = {
  id: 'root',
  children: [{ id: 'a' }, { id: 'b', children: [{ id: 'b1' }] }]
}

dfs(data, (node) => {
  console.log(node.id)
})

const tree = new TreeManager(data)
const ids = tree.flatten((node) => node.id !== 'root').map((n) => n.id)
```
