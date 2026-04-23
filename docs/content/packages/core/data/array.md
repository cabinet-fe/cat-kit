---
title: 数组操作
sidebarOrder: 30
---

# 数组操作

## 介绍

提供了丰富的数组操作函数和 `Arr` 类，支持去重合并、反向遍历、索引忽略、查找、移动与分组等操作。

## 快速使用

```typescript
import { last, union, unionBy, arr } from '@cat-kit/core'

// 获取最后一个元素
last([1, 2, 3]) // 3

// 合并数组并去重
union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]

// 链式操作
arr([1, 2, 3]).omit([0, 2]) // [2]
```

## API参考

### 数组工具函数

```typescript
import { last, union, unionBy, eachRight, omitArr } from '@cat-kit/core'

// 获取最后一个元素
last([1, 2, 3]) // 3
last([]) // undefined

// 合并数组并去重
union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]

// 按指定字段去重合并
const arr1 = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' }
]
const arr2 = [
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]
unionBy('id', arr1, arr2)
// [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]

// 从右向左遍历
eachRight([1, 2, 3], (item, index) => {
  console.log(item, index)
})
// 输出：3, 2  |  2, 1  |  1, 0

// 移除指定索引的元素
omitArr([1, 2, 3, 4], [1, 3]) // [1, 3]
```

### Arr 类操作

```typescript
import { arr } from '@cat-kit/core'

const list = arr([1, 2, 3, 4, 5])

// 从右向左遍历
list.eachRight((item, index) => {
  console.log(item, index)
})

// 忽略索引
list.omit([0, 2]) // [2, 4, 5]

// 查找元素
const users = arr([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
])

users.find({ age: 25 }) // { id: 1, name: 'Alice', age: 25 }

// 移动元素
list.move(0, 2) // 将索引 0 的元素移动到索引 2

// 分组
users.groupBy((item) => (item.age > 25 ? 'old' : 'young'))
// { young: [...], old: [...] }
```

### 综合示例

```typescript
import { arr, o } from '@cat-kit/core'

interface User {
  id: number
  name: string
  email: string
  role: string
}

function processUsers(users: User[]) {
  const userList = arr(users)

  // 按角色分组
  const grouped = userList.groupBy((u) => u.role)

  // 只保留需要的字段
  const simplified = users.map((u) => o(u).pick(['id', 'name']))

  return { grouped, simplified }
}
```
