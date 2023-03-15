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

tree.insert(3)
```

## 特征

- 除了根节点没有父节点外, 树的每个节点都有一个且只有一个父节点
- 树的子节点和其后代节点组成子树(因此树的递归操作很常见)
- 没有子节点的节点被称为叶子节点
- 树的深度为根节点到所有子节点中的最长路径

### 二叉树
顾名思义, 二叉树就是最多有两个分叉的树

## trie 前缀树