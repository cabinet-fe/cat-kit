# 数据结构

本章节工具提供一些扩展的数据结构的构造和操作方法来方便我们构建更多的应用

## 栈

栈的使用场景有很多, 满足先进后出, 后进先出的原则. 比如函数递归的调用过程, 比如对树的深度优先遍历, 再比如使用逆波兰表示法(后缀表达式)进行数学四则运算.

::: demo
render(utils/common/data-structure/stack)
:::

## 树

树是最广泛使用的数据结构之一, 文件系统, 目录, 多级分类, 数据库引擎...

基于本工具库提供的Tree和TreeNode API, 你可以很轻易地构建一个树形组件

### Tree API

Tree API是一个具有一组操作树节点的方法的集合

```ts
const data = {
  id: 0,
  children: [{ id: 1 }, { id: 2 }]
}
// 创建树
const tree = Tree.create(
  data,
  (v, index, parent) => new TreeNode(v, index, parent)
)

// 深度优先遍历
Tree.dft(tree, node => {})

// 广度优先遍历
Tree.bft(tree, node => {})

// 获取树的符合条件的第一个子节点
Tree.getChild(tree, node => {
  return node.value.id === 1
})

// 获取树的所有符合条件的子节点
Tree.getChildren(tree, node => {
  return node.value.id > 0
})

// 通过索引访问节点(访问树形数据索引为1的子节点)
Tree.visit(treeData, [1], 'children')
```

### TreeNode API

TreeNode是一个树节点的类, 你可以通过继承这个类来扩展更多的属性和方法

TreeNode接受2-3个参数, 第一个参数为节点数据, 第二个参数为节点的索引, 第三个参数为父节点(可选, 在使用append等方法时会自动设置父节点)

```ts
const node = new TreeNode({ id: 1 }, 0)

node.append(index => new TreeNode({ id: 2 }, index))
```

### 构建树形组件

对于前端来说，通常使用派生出的Forest(森林)API来构建树相关的组件，森林和树唯一的区别在于森林拥有多个根节点。

::: demo
render(utils/common/data-structure/tree)
:::
