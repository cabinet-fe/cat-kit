---
title: "树结构场景：部门树搜索与树形表格虚拟滚动"
description: "用 @cat-kit/core 的 dfs 搜索部门树、TreeManager flatten 输出树形表格数据源、flattenVisible 与 getVisibleDescendantCount 做展开折叠的增量更新。"
aliases: [树遍历场景, 虚拟滚动示例, 部门树示例]
keywords: [dfs, TreeManager, flatten, flattenVisible, getVisibleDescendants, getVisibleDescendantCount, find, childrenKey, 树搜索, 树形表格, 虚拟滚动, 展开折叠]
---

# 树结构场景：部门树搜索与树形表格虚拟滚动

用 `@cat-kit/core` 的 `dfs`、`TreeManager` 实现两个高频树场景：跨层级关键词搜索命中并保留路径，以及树形表格「展开/折叠时增量维护扁平列表」，避免每次全量重建。

## 场景

- 何时用本方案：数据是嵌套 `children` 结构（部门、菜单、分类），需要搜索高亮、树形表格渲染或只渲染展开节点。
- 何时不用：数据天然扁平、只按字段过滤时用数组 `filter`；需要响应式订阅树节点变化时本模块不提供，配合状态库自行处理。

## 完整示例

```ts
import { TreeManager, dfs } from '@cat-kit/core'

type Dept = {
  id: string
  name: string
  expanded?: boolean
  children?: Dept[]
}

const data: Dept = {
  id: 'd0',
  name: '总部',
  expanded: true,
  children: [
    { id: 'd1', name: '研发部', expanded: true, children: [{ id: 'd11', name: '前端组' }, { id: 'd12', name: '后端组' }] },
    { id: 'd2', name: '市场部', expanded: false, children: [{ id: 'd21', name: '品牌组' }] }
  ]
}

// 1. dfs 搜索：命中『组』的节点；返回 true 可提前终止
const hits: string[] = []
let count = 0
dfs(
  data,
  (node) => {
    count++
    if (node.name.includes('组')) hits.push(node.id)
  },
  'children'
)
console.log(hits) // => ['d11', 'd12', 'd21']
console.log(count) // => 6（全树 6 个节点都访问过）

// 2. 树形表格数据源：flatten 按深度优先输出全部节点
const tree = new TreeManager<Dept>(data)
const allRows = tree.flatten()
console.log(allRows.map((n) => n.id)) // => ['d0', 'd1', 'd11', 'd12', 'd2', 'd21']

// 3. 展开折叠的增量维护：只渲染展开节点
let flatRows = tree.flattenVisible((n) => n.expanded === true)
console.log(flatRows.map((n) => n.id)) // => ['d0', 'd1', 'd11', 'd12', 'd2']

// 折叠 d1：从扁平列表里移除 d1 的可见后代，而不是重建整表
const d1 = tree.find((n) => n.id === 'd1')!
const removeCount = tree.getVisibleDescendantCount(d1, (n) => n.expanded === true)
const at = flatRows.findIndex((n) => n.id === 'd1')
flatRows.splice(at + 1, removeCount)
d1.expanded = false
console.log(flatRows.map((n) => n.id)) // => ['d0', 'd1', 'd2']

// 再次展开 d1：取回可见后代并插回
d1.expanded = true
const insertRows = tree.getVisibleDescendants(d1, (n) => n.expanded === true)
flatRows.splice(at + 1, 0, ...insertRows)
console.log(flatRows.map((n) => n.id)) // => ['d0', 'd1', 'd11', 'd12', 'd2']

// 4. 只渲染叶子节点（无子部门的行不做展开交互）
const leafIds = tree.getLeaves().map((n) => n.id)
console.log(leafIds) // => ['d11', 'd12', 'd21']

// 5. 取第一个命中即停：搜索「市场部」
let marketId = ''
dfs(data, (node) => {
  if (node.name === '市场部') {
    marketId = node.id
    return true // 终止遍历，后续节点不再访问
  }
})
console.log(marketId) // => 'd2'
```

## 要点说明

- `dfs(data, cb, 'children')`：第三个参数显式传子节点字段名；回调返回 `true` 立即终止并使 `dfs` 返回 `true`，适合「找到第一个就停」。
- `tree.flatten()`：不传 `createNode`，节点就是 `Dept` 对象本身，直接读 `id` / `name`；顺序为深度优先，与树形表格逐行渲染顺序一致。
- `flattenVisible((n) => n.expanded === true)`：根恒在结果中；未展开节点保留自身、跳过子树。
- `getVisibleDescendantCount` + `splice`：折叠时按计数删除、展开时 `getVisibleDescendants` 按序插回，两次操作都只处理可见子树，开销低于 `flattenVisible` 全量重建。
- `tree.find((n) => n.id === 'd1')`：深度优先首个命中；未找到返回 `null`。
- `tree.getLeaves()`：叶子判定为 `children` 不是数组或为空数组；可用于标记无展开箭头的行。
- 搜索中断：把搜索回调改为命中即 `return true`，可将 `dfs` 用作「取第一个匹配部门」；本例收集全部命中，回调不返回 `true`。

## 注意事项

> [!WARNING]
> - 不传 `createNode` 时节点无 `depth` / `index` / `parent` 元数据，`getMaxDepth()` 返回 `0`；本场景全部基于 `children` 字段遍历，不依赖元数据。
> - `getVisibleDescendants` / `getVisibleDescendantCount` 依赖调用时的 `expanded` 快照：先改 `expanded` 再取值会把新状态算进去，本例先取值再改。
> - 遍历回调返回 `true` 会终止后续访问；用于「收集全部命中」的回调不要返回 `true`。
> - `childrenKey` 缺省 `'children'`；接口字段为 `subList` 之类时必须在每个入口统一传入。
> - `flatRows.splice` 修改的是本地数组；框架渲染列表时把 `flatRows` 替换引用或使用响应式数组，确保视图更新。
