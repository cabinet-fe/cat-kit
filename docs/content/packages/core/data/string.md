---
title: 字符串操作
sidebarOrder: 40
---

# 字符串操作

## 介绍

提供字符串命名转换和路径拼接等功能，通过 `str()` 工厂函数创建链式处理实例。

## 快速使用

```typescript
import { str, $str } from '@cat-kit/core'

// 命名转换
str('hello-world').camelCase() // 'helloWorld'
str('helloWorld').kebabCase() // 'hello-world'

// URL 路径拼接
$str.joinUrlPath('/api', 'users', '123') // '/api/users/123'
```

## API参考

### 命名转换

```typescript
import { str } from '@cat-kit/core'

// 转换为小驼峰
str('hello-world').camelCase() // 'helloWorld'
str('hello_world').camelCase() // 'helloWorld'

// 转换为大驼峰
str('hello-world').camelCase('upper') // 'HelloWorld'

// 转换为连字符命名
str('helloWorld').kebabCase() // 'hello-world'
str('HelloWorld').kebabCase() // 'hello-world'
```

### URL 路径拼接

```typescript
import { $str } from '@cat-kit/core'

// 简单路径
$str.joinUrlPath('/api', 'users', '123')
// '/api/users/123'

// 带协议的 URL
$str.joinUrlPath('https://api.example.com', 'v1', 'users')
// 'https://api.example.com/v1/users'

// 处理多余斜杠
$str.joinUrlPath('https://api.example.com/', '/v1/', '/users/')
// 'https://api.example.com/v1/users/'

// 保留尾部斜杠
$str.joinUrlPath('/api', 'users', 'list/')
// '/api/users/list/'
```

### 综合示例

```typescript
import { $str, obj2query } from '@cat-kit/core'

function buildApiUrl(baseUrl: string, path: string, params: Record<string, any>): string {
  const url = $str.joinUrlPath(baseUrl, path)
  const query = obj2query(params)
  return query ? `${url}?${query}` : url
}

buildApiUrl('https://api.example.com', 'users/search', { name: 'Alice', age: 25 })
// 'https://api.example.com/users/search?name=Alice&age=25'
```
