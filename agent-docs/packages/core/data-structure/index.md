---
title: "树与森林数据结构模块（TreeManager / Forest）"
description: "@cat-kit/core 的 data-structure 模块：dfs/bfs 遍历、TreeNode/ForestNode 节点操作（插入、移除、路径、祖先、可见后代）与 TreeManager/Forest 管理器（查找、扁平化、可见展平、深度统计）。"
aliases: [树模块, 森林模块, 数据结构模块]
keywords: [dfs, bfs, TreeNode, TreeManager, ForestNode, Forest, childrenKey, createNode, flatten, flattenVisible, getVisibleDescendants, 树遍历, 树扁平化, 虚拟滚动]
---

# 树与森林数据结构模块（TreeManager / Forest）

`data-structure` 模块从 `@cat-kit/core` 导出树遍历函数 `dfs` / `bfs`、节点类 `TreeNode` / `ForestNode` 与管理器 `TreeManager` / `Forest`：遍历回调返回 `true` 提前终止；`TreeManager` 管理单棵树、`Forest` 管理多棵树；不传 `createNode` 时节点就是原始数据对象本身，传 `createNode` 时用自定义节点（如 `TreeNode`）承载 `depth` / `index` / `parent` 元数据。可见后代与可见展平系列方法面向树形虚拟滚动的增量更新。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { Forest, TreeManager, bfs, dfs } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `dfs` | 单树深度优先遍历，回调返回 `true` 终止 | `packages/core/data-structure/apis.md` |
| `bfs` | 单树广度优先遍历，回调返回 `true` 终止 | `packages/core/data-structure/apis.md` |
| `TreeNode` | 树节点类：`insert`、`remove`、`getPath`、`getAncestors`、`isAncestorOf`、`getVisibleDescendants` 等 | `packages/core/data-structure/apis.md` |
| `TreeManager` | 树管理器：`root`、`dfs`、`bfs`、`flatten`、`find`、`findAll`、`getLeaves`、`getMaxDepth`、`flattenVisible` | `packages/core/data-structure/apis.md` |
| `ForestNode` | 森林节点类，继承 `TreeNode`，支持移除根节点 | `packages/core/data-structure/apis.md` |
| `Forest` | 森林管理器：多棵树的遍历、查找、扁平化与 `size` | `packages/core/data-structure/apis.md` |

类型导出：`ITreeNode`、`NodeCreator`、`TreeManagerOptionsBase`、`TreeManagerOptionsWithCreator`、`IForestNode`、`ForestNodeCreator`、`ForestOptionsBase`、`ForestOptionsWithCreator`。
