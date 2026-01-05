## ADDED Requirements

### Requirement: 高性能树遍历函数

系统 SHALL 提供独立的 `dfs` 和 `bfs` 函数，用于深度优先遍历和广度优先遍历任意树形数据结构。

- 遍历函数 SHALL 使用显式栈/队列实现，避免递归导致的栈溢出
- 遍历回调 SHALL 接收 `(node, index, parent)` 三个参数
- 遍历 SHALL 支持提前终止：`dfs` 回调返回 `true` 时终止，`bfs` 回调返回 `false` 时终止
- 遍历函数 SHALL 支持自定义 `childrenKey` 参数

#### Scenario: DFS 深度优先遍历

- **WHEN** 对一棵树调用 `dfs(root, callback)`
- **THEN** 节点按深度优先顺序被访问（先根节点，再递归访问子节点）

#### Scenario: BFS 广度优先遍历

- **WHEN** 对一棵树调用 `bfs(root, callback)`
- **THEN** 节点按层级顺序被访问（同层节点先于下层节点）

#### Scenario: 遍历提前终止

- **WHEN** `dfs` 回调返回 `true` 或 `bfs` 回调返回 `false`
- **THEN** 遍历立即停止，不再访问后续节点

---

### Requirement: TreeNode 节点类

系统 SHALL 提供 `TreeNode` 类作为树节点的基础实现，支持前端树形控件扩展。

- `TreeNode` SHALL 包含 `data` 属性存储原始数据
- `TreeNode` SHALL 包含 `parent`、`children`、`depth`、`index`、`isLeaf` 基础属性
- `TreeNode` SHALL 提供 `dfs` 和 `bfs` 实例方法进行遍历
- `TreeNode` SHALL 提供 `remove` 方法将自身从父节点移除
- `TreeNode` SHALL 提供 `insert(node, index?)` 方法插入子节点
- `TreeNode` 的所有属性 SHALL 设计为可被子类扩展（如选中状态、展开状态等）

#### Scenario: 创建节点

- **WHEN** 使用 `new TreeNode(data)` 创建节点
- **THEN** 节点的 `data` 属性为传入的数据，`depth` 默认为 0，`index` 默认为 0

#### Scenario: 节点遍历

- **WHEN** 在 `TreeNode` 实例上调用 `dfs(callback)` 或 `bfs(callback)`
- **THEN** 从当前节点开始遍历其子树

#### Scenario: 移除节点

- **WHEN** 调用 `node.remove()`
- **THEN** 节点从其父节点的 `children` 中移除，兄弟节点的 `index` 重新计算

#### Scenario: 插入节点

- **WHEN** 调用 `parent.insert(child, index)`
- **THEN** `child` 插入到 `parent.children` 的指定位置，相关节点的 `index` 和 `parent` 属性更新

---

### Requirement: TreeManager 管理类

系统 SHALL 提供 `TreeManager` 类用于从数据构建和管理一棵树。

- `TreeManager` 构造函数 SHALL 接收 `(data, options?)` 参数
  - `data`: 必填，树形结构数据
  - `options.createNode`: 可选，`(data, index) => Node` 回调函数，用于自定义节点创建
  - `options.childrenKey`: 可选，子节点键名，默认 `'children'`
- 当不提供 `createNode` 时，`TreeManager` SHALL 直接使用原始数据作为树
- 当提供 `createNode` 时，`TreeManager` SHALL 使用该回调递归构建整棵树
- `TreeManager` SHALL 提供 `root` 属性访问根节点
- `TreeManager` SHALL 提供 `find(predicate)` 方法查找单个节点
- `TreeManager` SHALL 提供 `findAll(predicate)` 方法查找所有符合条件的节点
- `TreeManager` SHALL 提供 `flatten(filter?)` 方法将树碾平为一维数组

#### Scenario: 直接使用原始数据

- **WHEN** 使用 `new TreeManager(data)` 构建树（不传 createNode）
- **THEN** `tree.root` 直接指向原始数据

#### Scenario: 使用 createNode 构建自定义节点树

- **WHEN** 使用 `new TreeManager(data, { createNode: (d, i) => new MyNode(d) })` 构建树
- **THEN** 树中所有节点都通过 `createNode` 回调创建

#### Scenario: 查找单个节点

- **WHEN** 调用 `tree.find(node => node.data.id === targetId)`
- **THEN** 返回第一个符合条件的节点，若无则返回 `null`

#### Scenario: 查找所有节点

- **WHEN** 调用 `tree.findAll(node => node.data.type === 'file')`
- **THEN** 返回所有符合条件的节点数组

#### Scenario: 碾平节点

- **WHEN** 调用 `tree.flatten()` 或 `tree.flatten(filter)`
- **THEN** 返回树中所有（或符合过滤条件的）节点的一维数组

---

### Requirement: ForestNode 森林节点类

系统 SHALL 提供 `ForestNode` 类作为森林中节点的基础实现。

- `ForestNode` SHALL 继承 `TreeNode` 的所有属性和方法
- `ForestNode` SHALL 包含 `forest` 属性引用所属的 `Forest` 实例
- `ForestNode.remove()` SHALL 正确处理根节点移除场景（从 `forest.roots` 中移除）

#### Scenario: 移除森林根节点

- **WHEN** 对一个无父节点的 `ForestNode` 调用 `remove()`
- **THEN** 节点从 `forest.roots` 中移除，其他根节点的 `index` 重新计算

---

### Requirement: Forest 森林管理类

系统 SHALL 提供 `Forest` 类用于管理多棵树（森林）。

- `Forest` 构造函数 SHALL 接收 `{ data: Data[], createNode, childrenKey? }` 配置
  - `data`: 必填，数据数组，每个元素代表一棵树的根
  - `createNode`: 必填，`(data) => Node` 回调函数，用于创建节点
  - `childrenKey`: 可选，子节点键名，默认 `'children'`
- `Forest` SHALL 使用 `createNode` 回调递归构建每棵树的节点
- `Forest` SHALL 自动设置每个节点的 `parent`、`depth`、`index`、`isLeaf` 属性
- `Forest` SHALL 提供 `roots` 属性访问所有根节点
- `Forest` SHALL 提供 `dfs(callback)` 方法遍历所有树

#### Scenario: 从数组构建森林

- **WHEN** 使用 `new Forest({ data: [...], createNode: d => new ForestNode(d, forest) })` 构建森林
- **THEN** `forest.roots` 包含与 `data` 数组等长的根节点列表，每个节点及其子节点都正确设置了属性

#### Scenario: 遍历森林

- **WHEN** 调用 `forest.dfs(callback)`
- **THEN** 依次深度优先遍历每棵树的所有节点
