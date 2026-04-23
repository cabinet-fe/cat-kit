---
title: 类型判断
sidebarOrder: 10
---

# 类型判断

## 介绍

提供了一系列类型判断函数，比 `typeof` 更准确，并带类型守卫。

## 快速使用

```typescript
import {
  isObj,
  isArray,
  isString,
  isNumber,
  isBool,
  isDate,
  isFunction,
  isNull,
  isUndef,
  isEmpty,
  getDataType
} from '@cat-kit/core'

// 获取精确的类型字符串
getDataType([]) // 'array'
getDataType({}) // 'object'
getDataType(null) // 'null'

// 类型判断（带类型守卫）
isObj({}) // true
isArray([]) // true
isString('hello') // true
isNumber(123) // true
isBool(true) // true
isDate(new Date()) // true
isFunction(() => {}) // true
isNull(null) // true
isUndef(undefined) // true

// 空值判断
isEmpty(null) // true
isEmpty(undefined) // true
isEmpty('') // false
isEmpty(0) // false
```

## API参考

### 基础类型判断

```typescript
import {
  isObj,
  isArray,
  isString,
  isNumber,
  isBool,
  isDate,
  isFunction,
  isNull,
  isUndef,
  isEmpty,
  getDataType
} from '@cat-kit/core'

// 获取精确的类型字符串
getDataType([]) // 'array'
getDataType({}) // 'object'
getDataType(null) // 'null'

// 类型判断（带类型守卫）
isObj({}) // true
isArray([]) // true
isString('hello') // true
isNumber(123) // true
isBool(true) // true
isDate(new Date()) // true
isFunction(() => {}) // true
isNull(null) // true
isUndef(undefined) // true

// 空值判断
isEmpty(null) // true
isEmpty(undefined) // true
isEmpty('') // false
isEmpty(0) // false
```

### 特殊类型判断

```typescript
import {
  isBlob,
  isFile,
  isFormData,
  isSymbol,
  isPromise,
  isArrayBuffer,
  isUint8Array,
  isUint16Array,
  isUint32Array,
  isInt8Array,
  isInt16Array,
  isInt32Array
} from '@cat-kit/core'

// 浏览器类型
isBlob(new Blob()) // true
isFile(new File([], 'test.txt')) // true
isFormData(new FormData()) // true

// ES6+ 类型
isSymbol(Symbol('test')) // true
isPromise(Promise.resolve()) // true

// TypedArray 类型
isArrayBuffer(new ArrayBuffer(8)) // true
isUint8Array(new Uint8Array()) // true
isInt32Array(new Int32Array()) // true
```
