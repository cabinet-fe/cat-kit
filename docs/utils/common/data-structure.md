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

::: demo
render(utils/common/data-structure/tree)
:::