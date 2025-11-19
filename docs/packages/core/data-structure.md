# 数据结构

提供树形和森林数据结构的实现。

## Tree - 树结构

用于表示和操作层级数据的树形结构。

### 基本概念

树是由节点组成的层级结构，每个节点可以有子节点。Root 是树的根节点，没有父节点。

### 创建树节点

```typescript
import { TreeNode, createNode } from '@cat-kit/core'

// 创建节点
const root = createNode({
  id: 1,
  label: '根节点',
  children: []
})

// 或使用 TreeNode 类
const node = new TreeNode({
  id: 2,
  label: '子节点'
})
```

### 构建树

```typescript
import { Tree, createNode } from '@cat-kit/core'

// 创建树根
const root = createNode({
  id: 1,
  label: 'Root',
  children: [
    {
      id: 2,
      label: 'Child 1',
      children: [
        { id: 4, label: 'Grandchild 1' },
        { id: 5, label: 'Grandchild 2' }
      ]
    },
    {
      id: 3,
      label: 'Child 2',
      children: []
    }
  ]
})

// 创建树
const tree = new Tree(root)
```

### 遍历树

#### 深度优先遍历 (DFS)

```typescript
import { Tree } from '@cat-kit/core'

// DFS 遍历
tree.dfs(node => {
  console.log(node.label)
  // 可以返回 false 提前终止遍历
})

// 带层级信息的遍历
tree.dfs((node, level) => {
  console.log(`${' '.repeat(level * 2)}${node.label}`)
})
```

#### 广度优先遍历 (BFS)

```typescript
import { Tree } from '@cat-kit/core'

// BFS 遍历
tree.bfs(node => {
  console.log(node.label)
})

// 按层级遍历
tree.bfs((node, level) => {
  console.log(`Level ${level}: ${node.label}`)
})
```

### 查找节点

```typescript
import { Tree } from '@cat-kit/core'

// 根据 ID 查找
const node = tree.findById(4)
if (node) {
  console.log('找到节点:', node.label)
}

// 根据条件查找
const firstLeaf = tree.find(node => {
  return node.children.length === 0
})
```

### 添加节点

```typescript
import { Tree, createNode } from '@cat-kit/core'

// 添加子节点
const parent = tree.findById(2)
if (parent) {
  const newChild = createNode({
    id: 6,
    label: 'New Child'
  })
  parent.children.push(newChild)
}
```

### 删除节点

```typescript
import { Tree } from '@cat-kit/core'

// 删除节点
tree.remove(4) // 删除 ID 为 4 的节点

// 根据条件删除
tree.removeIf(node => {
  return node.label.includes('Grandchild')
})
```

## Forest - 森林结构

森林是多棵树的集合，用于处理多个根节点的情况。

### 创建森林

```typescript
import { Forest, createNode } from '@cat-kit/core'

const tree1 = createNode({
  id: 1,
  label: 'Tree 1',
  children: [{ id: 2, label: 'Child 1-1' }]
})

const tree2 = createNode({
  id: 3,
  label: 'Tree 2',
  children: [{ id: 4, label: 'Child 2-1' }]
})

const forest = new Forest([tree1, tree2])
```

### 遍历森林

```typescript
import { Forest } from '@cat-kit/core'

// DFS 遍历所有树
forest.dfs(node => {
  console.log(node.label)
})

// BFS 遍历所有树
forest.bfs(node => {
  console.log(node.label)
})
```

### 查找节点

```typescript
import { Forest } from '@cat-kit/core'

// 在森林中查找
const node = forest.findById(4)

// 条件查找
const result = forest.find(node => {
  return node.label === 'Child 2-1'
})
```

## 实际应用

### 文件系统树

```typescript
import { Tree, createNode, type TreeNode } from '@cat-kit/core'

interface FileNode {
  id: number
  name: string
  type: 'file' | 'folder'
  size?: number
  children?: FileNode[]
}

class FileSystem {
  private tree: Tree<FileNode>

  constructor(root: TreeNode<FileNode>) {
    this.tree = new Tree(root)
  }

  // 获取文件夹总大小
  getFolderSize(folderId: number): number {
    const folder = this.tree.findById(folderId)
    if (!folder) return 0

    let totalSize = 0
    this.tree.dfs(node => {
      if (node.data.type === 'file') {
        totalSize += node.data.size || 0
      }
    }, folder)

    return totalSize
  }

  // 搜索文件
  searchFiles(keyword: string): TreeNode<FileNode>[] {
    const results: TreeNode<FileNode>[] = []
    this.tree.dfs(node => {
      if (node.data.name.includes(keyword)) {
        results.push(node)
      }
    })
    return results
  }

  // 获取文件路径
  getPath(fileId: number): string {
    const file = this.tree.findById(fileId)
    if (!file) return ''

    const path: string[] = []
    let current: TreeNode<FileNode> | null = file

    while (current) {
      path.unshift(current.data.name)
      current = current.parent
    }

    return path.join('/')
  }
}
```

### 组织架构树

```typescript
import { Tree, createNode, type TreeNode } from '@cat-kit/core'

interface Employee {
  id: number
  name: string
  position: string
  department: string
  children?: Employee[]
}

class OrganizationChart {
  private tree: Tree<Employee>

  constructor(ceo: TreeNode<Employee>) {
    this.tree = new Tree(ceo)
  }

  // 获取某人的所有下属
  getSubordinates(employeeId: number): TreeNode<Employee>[] {
    const employee = this.tree.findById(employeeId)
    if (!employee) return []

    const subordinates: TreeNode<Employee>[] = []
    this.tree.dfs(node => {
      if (node.id !== employeeId) {
        subordinates.push(node)
      }
    }, employee)

    return subordinates
  }

  // 获取部门人数
  getDepartmentCount(department: string): number {
    let count = 0
    this.tree.dfs(node => {
      if (node.data.department === department) {
        count++
      }
    })
    return count
  }

  // 获取管理层级
  getManagementLevel(employeeId: number): number {
    const employee = this.tree.findById(employeeId)
    if (!employee) return 0

    let level = 0
    let current: TreeNode<Employee> | null = employee

    while (current.parent) {
      level++
      current = current.parent
    }

    return level
  }
}
```

### 菜单树

```typescript
import { Tree, createNode, type TreeNode } from '@cat-kit/core'

interface MenuItem {
  id: number
  label: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

class MenuManager {
  private tree: Tree<MenuItem>

  constructor(menuRoot: TreeNode<MenuItem>) {
    this.tree = new Tree(menuRoot)
  }

  // 根据权限过滤菜单
  filterByPermissions(permissions: string[]): TreeNode<MenuItem> {
    const filteredRoot = this.cloneNode(this.tree.root)

    this.tree.dfs(node => {
      // 检查权限逻辑
      // 如果无权限则从树中移除
    })

    return filteredRoot
  }

  // 展开路径
  expandPath(path: string): number[] {
    const ids: number[] = []
    this.tree.dfs(node => {
      if (node.data.path === path) {
        let current: TreeNode<MenuItem> | null = node
        while (current) {
          ids.unshift(current.id)
          current = current.parent
        }
        return false // 终止遍历
      }
    })
    return ids
  }

  // 生成面包屑
  getBreadcrumb(menuId: number): MenuItem[] {
    const menu = this.tree.findById(menuId)
    if (!menu) return []

    const breadcrumb: MenuItem[] = []
    let current: TreeNode<MenuItem> | null = menu

    while (current) {
      breadcrumb.unshift(current.data)
      current = current.parent
    }

    return breadcrumb
  }

  private cloneNode(node: TreeNode<MenuItem>): TreeNode<MenuItem> {
    // 克隆节点逻辑
    return node
  }
}
```

### 评论树

```typescript
import { Forest, createNode, type TreeNode } from '@cat-kit/core'

interface Comment {
  id: number
  author: string
  content: string
  createdAt: Date
  parentId?: number
  children?: Comment[]
}

class CommentSystem {
  private forest: Forest<Comment>

  constructor(comments: TreeNode<Comment>[]) {
    this.forest = new Forest(comments)
  }

  // 获取评论总数
  getTotalCount(): number {
    let count = 0
    this.forest.dfs(() => {
      count++
    })
    return count
  }

  // 获取某条评论的所有回复
  getReplies(commentId: number): TreeNode<Comment>[] {
    const comment = this.forest.findById(commentId)
    if (!comment) return []

    const replies: TreeNode<Comment>[] = []
    this.forest.dfs(node => {
      if (node.id !== commentId) {
        replies.push(node)
      }
    }, comment)

    return replies
  }

  // 按时间排序评论
  sortByTime(): TreeNode<Comment>[] {
    const allComments: TreeNode<Comment>[] = []
    this.forest.dfs(node => {
      allComments.push(node)
    })

    return allComments.sort((a, b) => {
      return b.data.createdAt.getTime() - a.data.createdAt.getTime()
    })
  }
}
```

## API 参考

### TreeNode

```typescript
class TreeNode<T> {
  id: number
  data: T
  parent: TreeNode<T> | null
  children: TreeNode<T>[]

  constructor(data: { id: number } & T)
}
```

### Tree

```typescript
class Tree<T> {
  root: TreeNode<T>

  constructor(root: TreeNode<T>)

  dfs(
    callback: (node: TreeNode<T>, level: number) => boolean | void,
    start?: TreeNode<T>
  ): void
  bfs(callback: (node: TreeNode<T>, level: number) => boolean | void): void
  findById(id: number): TreeNode<T> | null
  find(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null
  remove(id: number): boolean
  removeIf(predicate: (node: TreeNode<T>) => boolean): number
}
```

### Forest

```typescript
class Forest<T> {
  trees: TreeNode<T>[]

  constructor(trees: TreeNode<T>[])

  dfs(callback: (node: TreeNode<T>, level: number) => boolean | void): void
  bfs(callback: (node: TreeNode<T>, level: number) => boolean | void): void
  findById(id: number): TreeNode<T> | null
  find(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null
}
```

### 工具函数

```typescript
function createNode<T>(data: { id: number; children?: any[] } & T): TreeNode<T>
```

## 性能考虑

1. **大规模数据**：对于超大树（>10000 节点），考虑虚拟化或分页
2. **频繁查找**：建立索引 Map 加速查找
3. **深层嵌套**：警惕栈溢出，考虑使用迭代而非递归
4. **内存占用**：注意节点间的循环引用

## 最佳实践

1. **类型安全**：使用 TypeScript 定义节点数据类型
2. **不可变性**：操作树时考虑创建新节点而非修改原节点
3. **遍历终止**：在回调中返回 false 可以提前终止遍历
4. **边界检查**：操作前检查节点是否存在
5. **单元测试**：为树操作编写完善的测试用例
