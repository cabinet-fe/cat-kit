---
title: 对象操作
sidebarOrder: 20
---

# 对象操作

## 介绍

使用 `CatObject` 类或 `o()` 工厂函数进行对象操作，支持键值遍历、属性挑选/忽略、继承与合并等常用操作。

## 快速使用

```typescript
import { o } from '@cat-kit/core'

const user = { id: 1, name: 'Alice', age: 25, email: 'alice@example.com' }

const obj = o(user)

// 获取所有键
obj.keys() // ['id', 'name', 'age', 'email']

// 挑选属性
const picked = obj.pick(['id', 'name'])
// { id: 1, name: 'Alice' }

// 忽略属性
const omitted = obj.omit(['age', 'email'])
// { id: 1, name: 'Alice' }
```

## API参考

### 基本用法

```typescript
import { o } from '@cat-kit/core'

const user = { id: 1, name: 'Alice', age: 25, email: 'alice@example.com' }

const obj = o(user)

// 获取所有键
obj.keys() // ['id', 'name', 'age', 'email']

// 遍历对象
obj.each((key, value) => {
  console.log(`${key}: ${value}`)
})

// 挑选属性
const picked = obj.pick(['id', 'name'])
// { id: 1, name: 'Alice' }

// 忽略属性
const omitted = obj.omit(['age', 'email'])
// { id: 1, name: 'Alice' }
```

### 对象继承

```typescript
import { o } from '@cat-kit/core'

const defaults = { theme: 'light', fontSize: 14, language: 'zh-CN' }

const userSettings = { theme: 'dark', fontSize: 16 }

// 从 userSettings 继承属性（只继承已存在的属性）
o(defaults).extend(userSettings)
// { theme: 'dark', fontSize: 16, language: 'zh-CN' }
```

### 深度继承

```typescript
import { o } from '@cat-kit/core'

const defaults = { ui: { theme: 'light', fontSize: 14 }, data: { cache: true } }

const userConfig = { ui: { theme: 'dark' } }

// 深度继承
o(defaults).deepExtend(userConfig)
// { ui: { theme: 'dark', fontSize: 14 }, data: { cache: true } }
```

### 对象操作

```typescript
import { o } from '@cat-kit/core'

const obj = o({ a: 1, b: 2, c: 3 })

// 结构化拷贝
const copied = obj.copy()

// 合并对象
const merged = obj.merge({ d: 4, e: 5 })
// { a: 1, b: 2, c: 3, d: 4, e: 5 }
```

### 综合示例

```typescript
import { o, isString, isNumber, isEmpty } from '@cat-kit/core'

interface FormData {
  name: string
  age: number
  email: string
  phone?: string
}

function validateForm(data: Partial<FormData>): boolean {
  const required = o(data).pick(['name', 'age', 'email'])

  // 检查必填项
  for (const [key, value] of Object.entries(required)) {
    if (isEmpty(value)) {
      console.error(`${key} 不能为空`)
      return false
    }
  }

  // 类型验证
  if (!isString(data.name)) {
    console.error('name 必须是字符串')
    return false
  }

  if (!isNumber(data.age) || data.age < 0 || data.age > 150) {
    console.error('age 必须是有效的数字')
    return false
  }

  return true
}
```
