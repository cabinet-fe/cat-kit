---
title: 数据转换
sidebarOrder: 60
---

# 数据转换

## 介绍

提供各种数据格式之间的转换，包括字符串与 Uint8Array、十六进制、Base64 的互转，对象与查询字符串的互转，以及链式转换工具。

## 快速使用

```typescript
import { str2u8a, u8a2base64, obj2query, transform } from '@cat-kit/core'

// 字符串转 Base64
const base64 = transform('Hello').pipe(str2u8a).pipe(u8a2base64).value()
// 'SGVsbG8='

// 对象转查询字符串
obj2query({ name: 'Alice', age: 25 })
// 'name=Alice&age=25'
```

## API参考

### 二进制转换

```typescript
import { str2u8a, u8a2str, u8a2hex, hex2u8a, u8a2base64, base642u8a } from '@cat-kit/core'

// 字符串 ↔ Uint8Array
const uint8 = str2u8a('Hello') // Uint8Array
const text = u8a2str(uint8) // 'Hello'

// Uint8Array ↔ 十六进制
const hex = u8a2hex(uint8) // '48656c6c6f'
const uint8FromHex = hex2u8a(hex) // Uint8Array

// Uint8Array ↔ Base64
const base64 = u8a2base64(uint8) // 'SGVsbG8='
const uint8FromBase64 = base642u8a(base64) // Uint8Array
```

### URL 查询字符串

```typescript
import { obj2query, query2obj } from '@cat-kit/core'

// 对象转查询字符串
obj2query({ name: 'Alice', age: 25 })
// 'name=Alice&age=25'

// 查询字符串转对象
query2obj('name=Alice&age=25')
// { name: 'Alice', age: 25 }
```

### 链式转换

```typescript
import { transform } from '@cat-kit/core'

// 创建转换链
const result = transform('Hello').pipe(str2u8a).pipe(u8a2base64).value()
// 'SGVsbG8='
```
