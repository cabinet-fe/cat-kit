# 数据结构

## 介绍

本页介绍 `@cat-kit/core` 的树与森林数据结构能力，适用于菜单、组织架构、评论树等层级数据处理。

## 快速使用

```typescript
import { dfs, TreeNode, TreeManager, Forest } from '@cat-kit/core'

dfs({ id: 1, children: [{ id: 2 }] }, (node) => console.log(node.id))

const root = new TreeNode({ id: 1 }, 0, 0)
const manager = new TreeManager({ id: 1, children: [{ id: 2 }] })
const forest = new Forest({ data: [{ id: 1 }, { id: 2 }] })

console.log(root.isLeaf, manager.flatten().length, forest.size)
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

