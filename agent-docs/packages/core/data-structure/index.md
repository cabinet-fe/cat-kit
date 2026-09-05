---
title: "树与森林数据结构"
description: "@cat-kit/core 的 dfs/bfs/TreeManager/Forest：树与森林遍历、扁平化、可见节点与节点关系"
---

# 树与森林数据结构

`@cat-kit/core` 的树与森林工具以 `dfs`/`bfs` 函数和 `TreeManager`/`Forest` 类为核心，提供树形数据的遍历、查找、扁平化、可见节点展开与节点关系操作，节点形状可通过 `childrenKey` 与 `createNode` 自定义。

## 适用场景

树/森林遍历、查找、扁平化、可见节点与节点关系。

## 推荐公开 API

- `dfs`、`bfs`
- `TreeNode`、`TreeManager`、`ForestNode`、`Forest`

## 约束

- 遍历回调 `(node, index, parent?)`；返回 `true` 停止当前直接遍历
- 无 `createNode` 时 `TreeManager` 管理原始节点，不注入元数据方法
- `Forest.dfs`/`bfs` 在一棵树上停止后仍继续后续根
- 可见扁平化始终含根，仅沿 `isExpanded(node)` 为真的节点下行

## 类型声明

- [packages/core/dist/data-structure/tree.d.ts](../../../../packages/core/dist/data-structure/tree.d.ts)
- [packages/core/dist/data-structure/forest.d.ts](../../../../packages/core/dist/data-structure/forest.d.ts)

## 更多

- API：[树与森林数据结构 API](apis.md)
- 示例：[树与森林数据结构示例](examples.md)
