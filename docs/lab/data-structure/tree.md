# 树 Tree

树结构被广泛使用.

如: 计算机文件系统, 组织架构, 多级分类等等

## 程序定义

```ts
class Tree<T> {
  data: T

  children?: Tree<T>[]

  isLeaf = true

  constructor(data: T) {
    this.data = data
  }

  insert(data: T) {
    this.isLeaf = false

    const child = new Tree(data)
    if (this.children) {
      this.children.push(child)
    } else {
      this.children = [child]
    }

    return child
  }
}

const tree = new Tree(1)

const child1 = tree.insert(2)
child1.insert(3)

tree.insert(4)
```

## 特征

- 除了根节点没有父节点外, 树的每个节点都有一个且只有一个父节点
- 树的子节点和其后代节点组成子树(因此树的递归操作很常见)
- 没有子节点的节点被称为叶子节点
- 树的深度为根节点到所有子节点中的最长路径

## 二叉树

顾名思义, 二叉树就是最多有两个分叉的树.

二叉树的最典型应用就是用于搜索(二叉搜索树), 其机制类似于二分查找, 如果我们规定二叉树的数据满足左节点的数据一定小于
右节点和父节点, 且右节点的数据大于父节点和左节点， 那么每次查询时我们总可以过滤掉一半的内容。例如从100个结果查询一个值，最多只需要7次即可（< 2^7）。

```ts
class TreeNode<T> {
  value: T
  left: TreeNode<T> | null
  right: TreeNode<T> | null

  constructor(value: T) {
    this.value = value
    this.left = null
    this.right = null
  }
}

class BinaryTree<T> {
  root: TreeNode<T> | null

  constructor() {
    this.root = null
  }

  insert(value: T) {
    const newNode = new TreeNode(value)
    if (this.root === null) {
      this.root = newNode
    } else {
      this.insertNode(this.root, newNode)
    }
  }

  insertNode(node: TreeNode<T>, newNode: TreeNode<T>) {
    if (newNode.value < node.value) {
      if (node.left === null) {
        node.left = newNode
      } else {
        this.insertNode(node.left, newNode)
      }
    } else {
      if (node.right === null) {
        node.right = newNode
      } else {
        this.insertNode(node.right, newNode)
      }
    }
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value)
  }

  searchNode(node: TreeNode<T> | null, value: T): boolean {
    if (node === null) {
      return false
    }

    if (value < node.value) {
      return this.searchNode(node.left, value)
    } else if (value > node.value) {
      return this.searchNode(node.right, value)
    } else {
      return true
    }
  }
}

// 示例用法
const binaryTree = new BinaryTree<number>()
binaryTree.insert(8)
binaryTree.insert(3)
binaryTree.insert(10)
binaryTree.insert(1)
binaryTree.insert(6)

console.log(binaryTree.search(6)) // 输出: true
console.log(binaryTree.search(5)) // 输出: false
```

此为还有平衡二叉树(AVL树)。是一个特殊的二叉树，不过它要求每个节点的左右子树的高度差不能超过1。

因为当你按从大到小插入树节点时，会出现左子树的深度会一直增加的情况，这个时候插入或者删除往往都是二叉搜索树的最坏查找结果，因此让左右树的高度平衡就是其中的关键。

平衡通常是通过一个旋转操作来完成的，通俗点来说就是节点再排序，就是将左子树种较大的部分放入右子树的左节点，或者将右子树种的较小部分放入左子树的右节点，使得最终结果满足左子树高度差最多为1，且左子树总是小于右子树。

```ts
class TreeNode<T> {
  value: T
  left: TreeNode<T> | null
  right: TreeNode<T> | null
  /** 子树高度 */
  height: number

  constructor(value: T) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
  }
}

class AVLTree<T> {
  root: TreeNode<T> | null

  constructor() {
    this.root = null
  }

  insert(value: T) {
    this.root = this.insertNode(this.root, value)
  }

  insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode(value)
    }

    // 这里来和普通二叉树一致
    if (value < node.value) {
      node.left = this.insertNode(node.left, value)
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value)
    } else {
      return node // 不允许插入重复的值
    }

    // 子树高度
    node.height =
      Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1

    // 比较左右子树的高度差
    const balanceFactor = this.getBalanceFactor(node)

    // 左旋转
    if (balanceFactor > 1 && value < node.left!.value) {
      return this.rotateRight(node)
    }

    // 右旋转
    if (balanceFactor < -1 && value > node.right!.value) {
      return this.rotateLeft(node)
    }

    // 左右旋转
    if (balanceFactor > 1 && value > node.left!.value) {
      node.left = this.rotateLeft(node.left!)
      return this.rotateRight(node)
    }

    // 右左旋转
    if (balanceFactor < -1 && value < node.right!.value) {
      node.right = this.rotateRight(node.right!)
      return this.rotateLeft(node)
    }

    return node
  }

  getHeight(node: TreeNode<T> | null): number {
    return node ? node.height : 0
  }

  getBalanceFactor(node: TreeNode<T> | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0
  }

  rotateLeft(z: TreeNode<T>): TreeNode<T> {
    const y = z.right!
    const T2 = y.left

    y.left = z
    z.right = T2

    z.height = Math.max(this.getHeight(z.left), this.getHeight(z.right)) + 1
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1

    return y
  }

  rotateRight(z: TreeNode<T>): TreeNode<T> {
    const y = z.left!
    const T3 = y.right

    y.right = z
    z.left = T3

    z.height = Math.max(this.getHeight(z.left), this.getHeight(z.right)) + 1
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1

    return y
  }
}
```

## trie 前缀树

前缀树最常用的情景在于服务端url的命中算法中。

```ts
// 比较以下以下几个url
const url1 = '/a/b/c'
const url2 = '/a/c'
const url3 = '/a/d'
const url4 = '/a/e'
const url5 = '/b/c'

// 假设要匹配URL4，最坏的情况下要匹配4次

// 改一下数据结构
const urlTrie = {
  a: {
    b: {
      c: null
    },
    c: null,
    d: null,
    e: null
  },
  b: {
    c: null
  }
}

// 当我们要命中/a/e时只需要把 /a/e用/切割成['a', 'e']两个部分再去urlTrie中去查找当碰到null时则代表命中
// 测试仅需要两次访问即可命中
// 当路由越多，这种优势越明显
```
