---
title: 核心工具库
description: '@cat-kit/core 核心工具库文档'
outline: deep
---

# Core 核心包

`@cat-kit/core` 是 Cat Kit 的核心包，提供了基础的数据处理、日期操作、环境检测、性能优化等功能。

## 概述

核心包包含以下模块：

- **数据处理** - 数组、对象、字符串、数字等的操作
- **数据结构** - 树、森林等数据结构
- **日期处理** - 日期格式化、计算等
- **环境检测** - 浏览器、Node.js 环境判断
- **性能优化** - 并行处理、安全执行、定时器等
- **设计模式** - 观察者模式等

## 安装

```bash
npm install @cat-kit/core
```

## 快速开始

```typescript
import {
  $arr,
  $str,
  $obj,
  $num,
  $date,
  isInBrowser,
  parallel
} from '@cat-kit/core'

// 数组操作
const chunks = $arr.chunk([1, 2, 3, 4, 5], 2)
// [[1, 2], [3, 4], [5]]

// 字符串操作
const url = $str.joinUrlPath('/api', 'users', '123')
// '/api/users/123'

// 对象操作
const picked = $obj.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
// { a: 1, c: 3 }

// 日期处理
const formatted = $date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
// '2025-11-17 14:30:00'

// 环境检测
if (isInBrowser()) {
  console.log('运行在浏览器环境')
}

// 并行处理
const results = await parallel([
  () => fetch('/api/user'),
  () => fetch('/api/posts'),
  () => fetch('/api/comments')
])
```

## 数据处理

### 数组操作 ($arr)

```typescript
import { $arr } from '@cat-kit/core'

// 分块
$arr.chunk([1, 2, 3, 4, 5], 2)
// [[1, 2], [3, 4], [5]]

// 去重
$arr.unique([1, 2, 2, 3, 3, 4])
// [1, 2, 3, 4]

// 扁平化
$arr.flatten([
  [1, 2],
  [3, [4, 5]]
])
// [1, 2, 3, [4, 5]]

// 深度扁平化
$arr.flattenDeep([
  [1, 2],
  [3, [4, 5]]
])
// [1, 2, 3, 4, 5]
```

[查看完整 API →](/packages/core/data#数组操作)

### 字符串操作 ($str)

```typescript
import { $str } from '@cat-kit/core'

// URL 路径拼接
$str.joinUrlPath('/api', 'users', '123')
// '/api/users/123'

// 驼峰转换
$str.camelCase('hello-world')
// 'helloWorld'

// 短横线转换
$str.kebabCase('helloWorld')
// 'hello-world'

// 首字母大写
$str.capitalize('hello')
// 'Hello'
```

[查看完整 API →](/packages/core/data#字符串操作)

### 对象操作 ($obj)

```typescript
import { $obj } from '@cat-kit/core'

// 选择属性
$obj.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
// { a: 1, c: 3 }

// 排除属性
$obj.omit({ a: 1, b: 2, c: 3 }, ['b'])
// { a: 1, c: 3 }

// 深度克隆
$obj.cloneDeep({ a: 1, b: { c: 2 } })

// 深度合并
$obj.merge({ a: 1 }, { b: 2 }, { c: 3 })
// { a: 1, b: 2, c: 3 }
```

[查看完整 API →](/packages/core/data#对象操作)

### 数字操作 ($num)

```typescript
import { $num } from '@cat-kit/core'

// 范围限制
$num.clamp(150, 0, 100)
// 100

// 生成范围数组
$num.range(1, 5)
// [1, 2, 3, 4]

// 随机数
$num.random(1, 100)
// 随机返回 1-100 之间的数
```

[查看完整 API →](/packages/core/data#数字操作)

## 数据结构

### 树结构

```typescript
import { Tree } from '@cat-kit/core'

interface TreeNode {
  id: number
  name: string
  children?: TreeNode[]
}

const tree = new Tree<TreeNode>({
  id: 1,
  name: '根节点',
  children: [
    { id: 2, name: '子节点1' },
    { id: 3, name: '子节点2' }
  ]
})

// 遍历
tree.traverse(node => {
  console.log(node.name)
})

// 查找
const found = tree.find(node => node.id === 2)

// 过滤
const filtered = tree.filter(node => node.id > 1)
```

[查看完整 API →](/packages/core/data-structure)

### 森林结构

```typescript
import { Forest } from '@cat-kit/core'

const forest = new Forest<TreeNode>([
  { id: 1, name: '树1' },
  { id: 2, name: '树2' }
])

// 批量操作
forest.map(tree => {
  // 处理每棵树
})
```

[查看完整 API →](/packages/core/data-structure)

## 日期处理

```typescript
import { $date } from '@cat-kit/core'

// 格式化
$date.format(new Date(), 'YYYY-MM-DD')
// '2025-11-17'

$date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
// '2025-11-17 14:30:00'

// 解析
const date = $date.parse('2025-11-17', 'YYYY-MM-DD')

// 计算
$date.addDays(new Date(), 7) // 加 7 天
$date.addMonths(new Date(), 1) // 加 1 月
$date.diff(date1, date2, 'days') // 计算天数差
```

[查看完整 API →](/packages/core/date)

## 环境检测

```typescript
import {
  isInBrowser,
  isInNode,
  isInWorker,
  getBrowserInfo
} from '@cat-kit/core'

// 环境检测
if (isInBrowser()) {
  console.log('浏览器环境')
}

if (isInNode()) {
  console.log('Node.js 环境')
}

if (isInWorker()) {
  console.log('Web Worker 环境')
}

// 浏览器信息
const info = getBrowserInfo()
console.log(info.name, info.version)
```

[查看完整 API →](/packages/core/env)

## 性能优化

### 并行处理

```typescript
import { parallel } from '@cat-kit/core'

// 并行执行多个异步任务
const results = await parallel([
  () => fetch('/api/user'),
  () => fetch('/api/posts'),
  () => fetch('/api/comments')
])

// 带并发限制
const results = await parallel(tasks, { concurrency: 2 })
```

### 安全执行

```typescript
import { safe } from '@cat-kit/core'

// 捕获错误
const [error, result] = await safe(async () => {
  return await fetch('/api/data')
})

if (error) {
  console.error('请求失败:', error)
} else {
  console.log('请求成功:', result)
}
```

### 定时器

```typescript
import { Timer } from '@cat-kit/core'

// 创建定时器
const timer = new Timer(() => {
  console.log('执行任务')
}, 1000)

// 开始
timer.start()

// 暂停
timer.pause()

// 恢复
timer.resume()

// 停止
timer.stop()
```

[查看完整 API →](/packages/core/optimize)

## 设计模式

### 观察者模式

```typescript
import { Observer } from '@cat-kit/core'

// 创建观察者
const observer = new Observer<{ count: number }>()

// 订阅
const unsubscribe = observer.subscribe(data => {
  console.log('数据变化:', data.count)
})

// 发布
observer.notify({ count: 1 })
observer.notify({ count: 2 })

// 取消订阅
unsubscribe()
```

[查看完整 API →](/packages/core/pattern)

## 类型工具

```typescript
import type {
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  Nullable
} from '@cat-kit/core'

// 深度可选
type PartialUser = DeepPartial<User>

// 深度必需
type RequiredUser = DeepRequired<User>

// 深度只读
type ReadonlyUser = DeepReadonly<User>

// 可空类型
type NullableUser = Nullable<User>
```

## 最佳实践

### 按需导入

```typescript
// ✅ 推荐：按需导入
import { $arr, $str } from '@cat-kit/core'

// ❌ 不推荐：导入所有
import * as core from '@cat-kit/core'
```

### 类型安全

```typescript
// 使用泛型保证类型安全
interface User {
  id: number
  name: string
}

const users: User[] = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]

// $arr 方法保留类型
const filtered = $arr.filter(users, user => user.id > 1)
// filtered 的类型仍然是 User[]
```

### 链式调用

```typescript
import { $arr, $obj } from '@cat-kit/core'

// 组合使用多个工具
const result = $arr
  .filter(users, user => user.age > 18)
  .map(user => $obj.pick(user, ['id', 'name']))
  .slice(0, 10)
```

## 下一步

- [数据处理](/packages/core/data) - 详细的数据处理 API
- [数据结构](/packages/core/data-structure) - 树和森林数据结构
- [日期处理](/packages/core/date) - 日期操作 API
- [环境检测](/packages/core/env) - 环境检测 API
- [性能优化](/packages/core/optimize) - 性能优化工具
- [设计模式](/packages/core/pattern) - 设计模式实现
