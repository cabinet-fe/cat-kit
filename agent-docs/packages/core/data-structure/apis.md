---
title: "树与森林数据结构 API"
description: "@cat-kit/core 树与森林 API 签名：dfs/bfs/TreeManager/Forest 及节点方法清单"
---

# 树与森林数据结构 API

本篇列出树与森林工具的公开签名：`dfs`/`bfs` 遍历函数、`TreeManager`/`Forest` 管理类，以及节点对象提供的方法。

```ts
declare function dfs<T extends Record<string, unknown>>(
  data: T,
  cb: (node: T, index: number, parent?: T) => void | boolean,
  childrenKey?: string
): boolean | void

declare function bfs<T extends Record<string, unknown>>(
  data: T,
  cb: (node: T, index: number, parent?: T) => void | boolean,
  childrenKey?: string
): boolean | void

declare class TreeManager<T extends Record<string, unknown>, Node = T> {
  constructor(
    data: T,
    options?: {
      childrenKey?: string
      createNode?: NodeCreator<T>
    }
  )
  flatten(filter?: (node: Node) => boolean): Node[]
  flattenVisible(isExpanded: (node: Node) => boolean): Node[]
  // find、dfs、bfs、getRoot 等方法见下方声明文件
}

declare class Forest<T extends Record<string, unknown>, Node = T> {
  constructor(
    roots: T[],
    options?: {
      childrenKey?: string
      createNode?: ForestNodeCreator<T>
    }
  )
  flatten(filter?: (node: Node) => boolean): Node[]
  flattenVisible(isExpanded: (node: Node) => boolean): Node[]
}
```

`TreeNode` / `ForestNode` 提供 `remove`、`insert`、祖先/可见后代等方法。完整签名见：

- [packages/core/dist/data-structure/tree.d.ts](../../../../packages/core/dist/data-structure/tree.d.ts)
- [packages/core/dist/data-structure/forest.d.ts](../../../../packages/core/dist/data-structure/forest.d.ts)
