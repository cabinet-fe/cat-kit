# core — 树与森林

## 何时使用

- 遍历、查找或扁平化已有树形数据。
- 统一管理单根树 `TreeManager` 或多根森林 `Forest`。
- 需要带父子关系、深度、索引和增删能力的 `TreeNode` / `ForestNode`。

仅做一次遍历时优先使用 `dfs` 或 `bfs`；需要重复查找、可见节点计算或多根管理时再创建管理器。

## 推荐公开 API

- `dfs(root, callback, childrenKey?)`、`bfs(...)`：遍历原始数据；回调返回 `true` 可提前停止。
- `TreeManager`：`root`、`dfs`、`bfs`、`flatten`、`find`、`findAll`、`getLeaves`、`getNodesAtDepth`、`getMaxDepth`、`flattenVisible`。
- `Forest`：`roots`、`size` 以及与 `TreeManager` 对应的遍历、查找和可见节点方法。
- `TreeNode`：`remove`、`insert`、`getPath`、`getAncestors`、`isAncestorOf`、`isDescendantOf`。
- `ForestNode`：在 `TreeNode` 基础上支持从森林中移除根节点。

## 最小示例

```ts
import { TreeManager } from '@cat-kit/core'

const tree = new TreeManager({
  id: 'root',
  children: [{ id: 'a' }, { id: 'b' }]
})

const ids = tree.flatten().map((node) => node.id)
console.log(ids) // ['root', 'a', 'b']
```

## 约束与边界

- 不传 `createNode` 时，`TreeManager` 和 `Forest` 直接管理原始节点；节点不会自动拥有 `.data`、`.depth`、`.index`、`.parent` 或节点方法。
- 需要深度、父节点或可变节点能力时，传入 `createNode` 创建符合需求的公开节点形状；`TreeNode` 和 `ForestNode` 可作为基础类。
- `childrenKey` 默认为 `'children'`，自定义后遍历、查找和可见节点方法都使用该字段。
- `find` 未命中时返回 `null`，不是 `undefined`。
- `Forest.size` 是所有节点总数，不是根节点数量；根节点数量使用 `forest.roots.length`。
- `getNodesAtDepth` 和 `getMaxDepth` 读取节点的 `depth` 字段；直接管理不含该字段的原始数据时，不会自动推导层级。
- `flattenVisible` 始终包含根节点；只有 `isExpanded(node)` 为真时才继续包含该节点的子级。

## 精确类型入口

- [树声明](../../generated/core/data-structure/tree.d.ts)
- [森林声明](../../generated/core/data-structure/forest.d.ts)
