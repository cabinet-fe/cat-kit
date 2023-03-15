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
右节点和父节点, 且右节点的数据大于父节点和左节点.

```
```



## trie 前缀树

前缀树最常用的情景在于服务端url的命中,