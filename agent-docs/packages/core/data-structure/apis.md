---
title: "dfs 与 TreeManager 树结构 API"
description: "@cat-kit/core 树结构 API：dfs/bfs 遍历契约、TreeNode/ForestNode 节点方法、TreeManager/Forest 管理器签名、createNode 构建与可见后代系列方法的约束。"
aliases: [树 API, 森林 API, 遍历 API, tree api]
keywords: [dfs, bfs, TreeNode, ForestNode, TreeManager, Forest, childrenKey, createNode, flatten, flattenVisible, getVisibleDescendants, getVisibleDescendantCount, getLeaves, getMaxDepth, getPath, getAncestors, 树遍历, 树扁平化, 虚拟滚动, 树查找]
---

# dfs 与 TreeManager 树结构 API

`@cat-kit/core` 导出遍历函数 `dfs` / `bfs`、节点类 `TreeNode` / `ForestNode` 与管理器 `TreeManager` / `Forest`。`childrenKey` 缺省 `'children'`；不传 `createNode` 时节点即原始数据对象（无 `depth` / `index` 元数据），传 `createNode` 时按创建函数构建节点树。全部 API 同步执行。

## 快速上手

```ts
import { TreeManager, dfs } from '@cat-kit/core'

const data = {
  id: 'root',
  children: [{ id: 'a' }, { id: 'b', children: [{ id: 'b1' }] }]
}

dfs(data, (node) => {
  console.log(node.id) // 依次输出 root、a、b、b1
})

const tree = new TreeManager(data)
console.log(tree.flatten().map((n) => n.id)) // => ['root', 'a', 'b', 'b1']
console.log(tree.find((n) => n.id === 'b1')!.id) // => 'b1'
```

## API 签名

```ts
type Obj = Record<string, unknown>

/** 深度优先遍历；cb(node, index, parent?) 返回 true 提前终止；提前终止时 dfs 返回 true */
export function dfs<T extends Obj>(data: T, cb: (node: T, index: number, parent?: T) => void | boolean, childrenKey?: string): boolean | void

/** 广度优先遍历；契约同 dfs */
export function bfs<T extends Obj>(data: T, cb: (node: T, index: number, parent?: T) => void | boolean, childrenKey?: string): boolean | void

export interface ITreeNode<T extends Obj = Obj, Self = ITreeNode<T, unknown>> {
  data: T
  /** 深度，根为 0 */
  depth: number
  index: number
  isLeaf: boolean
  parent?: Self
  children?: Self[]
}

/** 树节点：构造参数为 (data, index, depth, parent?) */
export declare class TreeNode<T extends Obj = Obj, Self extends TreeNode<T, Self> = TreeNode<T, any>> implements ITreeNode<T, Self> {
  data: T
  parent?: Self
  children?: Self[]
  depth: number
  index: number
  get isLeaf(): boolean
  /** 从父节点移除自己并重排兄弟 index */
  remove(): void
  /** 插入子节点；index 缺省追加到末尾；自动修正兄弟 index 与子树 depth */
  insert(node: Self, index?: number): void
  /** 根到自身的路径数组 */
  getPath(): Self[]
  /** 父节点到根的祖先数组 */
  getAncestors(): Self[]
  isAncestorOf(node: Self): boolean
  isDescendantOf(node: Self): boolean
  /** 展开节点的可见后代（深度优先顺序） */
  getVisibleDescendants(isExpanded: (node: Self) => boolean): Self[]
  getVisibleDescendantCount(isExpanded: (node: Self) => boolean): number
}

export type NodeCreator<T extends Obj, Node> = (data: T, index: number, depth: number, parent: Node | undefined) => Node

export interface TreeManagerOptionsBase {
  childrenKey?: string
}
export interface TreeManagerOptionsWithCreator<T extends Obj, Node> extends TreeManagerOptionsBase {
  createNode: NodeCreator<T, Node>
}

export declare class TreeManager<T extends Obj, Node extends Obj = T> {
  get root(): Node
  constructor(data: T, options?: TreeManagerOptionsBase)
  constructor(data: T, options: TreeManagerOptionsWithCreator<T, Node>)
  dfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void
  bfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void
  /** 扁平化为数组；filter 返回 false 的节点被跳过 */
  flatten(filter?: (node: Node) => boolean): Node[]
  /** 未命中返回 null */
  find(predicate: (node: Node) => boolean): Node | null
  findAll(predicate: (node: Node) => boolean): Node[]
  getLeaves(): Node[]
  /** 依赖节点带 depth 字段：无 createNode 时原始数据没有 depth，结果按字段缺失处理 */
  getNodesAtDepth(depth: number): Node[]
  getMaxDepth(): number
  getVisibleDescendants(node: Node, isExpanded: (node: Node) => boolean): Node[]
  getVisibleDescendantCount(node: Node, isExpanded: (node: Node) => boolean): number
  /** 仅含可见节点的扁平化：根恒在列，只沿 isExpanded 为 true 的节点下行 */
  flattenVisible(isExpanded: (node: Node) => boolean): Node[]
}

export interface IForestNode<T extends Obj = Obj, Self = IForestNode<T, unknown>> extends ITreeNode<T, Self> {
  forest: Forest<T, Self extends Obj ? Self : Obj>
}

/** 森林节点：构造参数为 (data, index, depth, forest, parent?)；remove() 对根节点从 forest.roots 中移除 */
export declare class ForestNode<T extends Obj = Obj, Self extends ForestNode<T, Self> = ForestNode<T, any>> extends TreeNode<T, Self> {
  readonly forest: Forest<T, Self>
}

export type ForestNodeCreator<T extends Obj, Node extends Obj> = (data: T, index: number, depth: number, forest: Forest<T, Node>, parent: Node | undefined) => Node

export interface ForestOptionsBase<T extends Obj> {
  data: T[]
  childrenKey?: string
}
export interface ForestOptionsWithCreator<T extends Obj, Node extends Obj> extends ForestOptionsBase<T> {
  createNode: ForestNodeCreator<T, Node>
}

export declare class Forest<T extends Obj, Node extends Obj = T> {
  roots: Node[]
  constructor(options: ForestOptionsBase<T>)
  constructor(options: ForestOptionsWithCreator<T, Node>)
  dfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void
  bfs(callback: (node: Node, index: number, parent?: Node) => void | boolean): void
  flatten(filter?: (node: Node) => boolean): Node[]
  find(predicate: (node: Node) => boolean): Node | null
  findAll(predicate: (node: Node) => boolean): Node[]
  getLeaves(): Node[]
  get size(): number
  getMaxDepth(): number
  getVisibleDescendants(node: Node, isExpanded: (node: Node) => boolean): Node[]
  getVisibleDescendantCount(node: Node, isExpanded: (node: Node) => boolean): number
  flattenVisible(isExpanded: (node: Node) => boolean): Node[]
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `data`（`dfs` / `bfs`） | `T`（单个对象） | — | 是 | 根节点；子节点字段由 `childrenKey` 指定且必须是数组 |
| `childrenKey` | `string` | `'children'` | 否 | 全部 API 共用；子节点字段值不是数组时按无子节点处理 |
| `cb` / `callback` | `(node, index, parent?) => void \| boolean` | — | 是 | `index` 是节点在兄弟中的序号；返回 `true` 终止（`Forest` 只终止当前一棵树） |
| `createNode` | `NodeCreator` / `ForestNodeCreator` | — | 否 | 传入后节点由该函数创建；`index` / `depth` / `parent`（森林还有 `forest`）由构建过程注入 |
| `filter`（`flatten`） | `(node) => boolean` | — | 否 | 返回 `false` 跳过该节点，但继续遍历其子节点 |
| `predicate`（`find` / `findAll` / `getLeaves`） | `(node) => boolean` | — | 是 | `find` 返回首个命中（`null` 表示未找到）；叶子判定为 `children` 非数组或为空数组 |
| `isExpanded` | `(node) => boolean` | — | 是 | `getVisibleDescendants` / `flattenVisible` 只在展开节点处继续下行 |
| `node`（`TreeNode.insert`） | `Self` | — | 是 | 插入后自动修正插入点之后的兄弟 `index` 与被插入子树的 `depth` |
| `index`（`TreeNode.insert`） | `number` | 末尾 | 否 | 超出长度时按末尾追加 |

## 方法与事件

- `dfs` / `bfs`（含管理器与森林上的同名方法）：同步、不抛错；`dfs` / `bfs` 函数本体提前终止时返回 `true`，管理器版本返回 `void`；`Forest.dfs` / `bfs` 的终止只作用于当前根，后续根继续遍历。
- `TreeNode.remove()`：同步；从父节点移除并清空自身 `parent`；`index` 过期时按 `indexOf` 兜底并从头重排兄弟 `index`。根节点调用 `TreeNode.remove()` 无效果，`ForestNode.remove()` 会从 `forest.roots` 移除并重排根的 `index`。
- `TreeNode.insert(node, index?)`：同步；建立 `parent` 双向关系，更新兄弟 `index`，并递归修正被插入子树所有节点的 `depth`。
- `flattenVisible`（`TreeManager` / `Forest`）：返回按深度优先顺序的可见节点数组，根节点恒在结果中；`Forest.flattenVisible` 依次处理每棵根。
- `Forest.size`：getter，遍历全部节点计数，非存储字段。

## 典型示例

### createNode 构建带元数据的树

```ts
import { TreeNode, TreeManager } from '@cat-kit/core'

type Raw = {
  id: string
  children?: Raw[]
}

const tree = new TreeManager<Raw, TreeNode<Raw>>(
  { id: 'root', children: [{ id: 'a', children: [{ id: 'a1' }] }, { id: 'b' }] },
  {
    createNode: (data, index, depth, parent) => new TreeNode(data, index, depth, parent)
  }
)

console.log(tree.getMaxDepth()) // => 2
console.log(tree.getNodesAtDepth(1).map((n) => n.data.id)) // => ['a', 'b']
console.log(tree.getLeaves().map((n) => n.data.id)) // => ['a1', 'b']
```

### 虚拟滚动的可见展平

```ts
import { TreeManager } from '@cat-kit/core'

type NodeLike = {
  id: string
  expanded?: boolean
  children?: NodeLike[]
}

const tree = new TreeManager<NodeLike>({
  id: 'root',
  expanded: true,
  children: [
    { id: 'a', expanded: false, children: [{ id: 'a1', expanded: true }] },
    { id: 'b', expanded: true }
  ]
})

const flat = tree.flattenVisible((n) => n.expanded === true)
console.log(flat.map((n) => n.id)) // => ['root', 'a', 'b']（a 未展开，a1 不可见）
```

### 森林与根节点移除

```ts
import { Forest, ForestNode } from '@cat-kit/core'

const forest = new Forest<{ id: number; children?: { id: number }[] }, ForestNode<any>>({
  data: [{ id: 1, children: [{ id: 2 }] }, { id: 3 }],
  createNode: (data, index, depth, forestRef, parent) =>
    new ForestNode(data, index, depth, forestRef, parent)
})

console.log(forest.size) // => 3
console.log(forest.flatten().map((n) => n.data.id)) // => [1, 2, 3]

forest.roots[0]!.remove() // ForestNode 对根节点的 remove 从 roots 中移除
console.log(forest.roots.map((n) => n.data.id)) // => [3]
console.log(forest.roots[0]!.index) // => 0（剩余根已重排 index）
```

## 注意事项

> [!WARNING]
> - 不传 `createNode` 时节点就是原始数据对象：树上没有 `depth` / `index` / `parent` 元数据，`getMaxDepth()` 返回 `0`、`getNodesAtDepth(1)` 返回 `[]`；需要元数据必须传 `createNode`。
> - `createNode` 存在时节点数据在 `node.data` 字段上，不在节点自身；谓词回调里用 `node.data.id` 而不是 `node.id`。
> - `TreeManager` 取根用 `root` getter（`tree.root`），本库没有 `getRoot()` 方法。
> - `Forest` 构造入参是单个配置对象 `{ data, childrenKey?, createNode? }`，不是 `(roots, options)` 两个参数。
> - 遍历回调返回 `true` 才终止；返回其他真值（如非空字符串）不终止，这是与 lodash `forEach` 不同的约定。
> - `flatten(filter)` 跳过节点但继续遍历其子节点；要连子树一起裁剪时在 `isExpanded` / 自定义遍历里处理。
