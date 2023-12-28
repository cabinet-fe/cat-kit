# 路径

::: warning 警告
这个API将被废弃，因为path有时候会和node中的path混淆。此API将会被迁移至string数据处理模块下。
:::

路径通常用于路由, url之类的拼接, 解析

## 快速使用

```ts
import { path } from 'cat-kit'

const url = path.join('a', 'b', 'c')
// return '/a/b/c'
```

## api

### path.join

join方法用于拼接各个路径片段, 拼接成一个以 '/' 开头的路径字符串.

```ts
import { path } from 'cat-kit'

const url = path.join('a', 'b', 'c')
// return '/a/b/c'

const url = path.join('/a', '/b', '/c')
// return '/a/b/c'

const url = path.join('/a', 'b', '/c')
// return '/a/b/c'
```
