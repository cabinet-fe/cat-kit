# 路径
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