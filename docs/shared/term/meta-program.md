---
title: 元编程
---

# 元编程

指「编写能改变语言语法特性或者运行时特性的程序」
换言之，一种语言本来做不到的事情，通过你编程来修改它，使得它可以做到了，这就是元编程.

## JS中的元编程

其中最经典的要数 Proxy 类.

Vue框架的3.x版本的核心就是这个类. 他能够让你获得在对象操作读写属性时改变或者触发一些额外操作.

具体[查看](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Meta_programming)