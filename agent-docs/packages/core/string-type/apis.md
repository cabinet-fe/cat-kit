---
title: "字符串与类型检测 API"
description: "@cat-kit/core str()/$str 签名与全部运行时类型守卫函数列表"
keywords:
  - str
  - camelCase
  - kebabCase
  - joinUrlPath
  - getDataType
  - isString
  - isNumber
  - isFormData
  - isPromise
  - isUint8Array
aliases:
  - 函数签名
  - API 参考
  - 类型守卫函数列表
  - type guard
---

# 字符串与类型检测 API

本篇列出字符串工具 `str()`/`$str` 的签名与全部运行时类型守卫函数，均从 `@cat-kit/core` 包根导入。

```ts
declare function str(value: string): {
  camelCase(type?: 'lower' | 'upper'): string
  kebabCase(): string
}

declare const $str: {
  joinUrlPath(firstPath: string, ...paths: string[]): string
}

declare function getDataType(value: unknown): string
declare function isObj(value: unknown): value is Record<string, any>
declare function isArray(value: unknown): value is any[]
declare function isString(value: unknown): value is string
declare function isNumber(value: unknown): value is number
declare function isBlob(value: unknown): value is Blob
declare function isDate(value: unknown): value is Date
declare function isFunction(value: unknown): value is Function
declare function isBool(value: unknown): value is boolean
declare function isFile(value: unknown): value is File
declare function isFormData(value: unknown): value is FormData
declare function isSymbol(value: unknown): value is symbol
declare function isPromise(value: unknown): value is Promise<any>
declare function isArrayBuffer(value: unknown): value is ArrayBuffer
declare function isUint8Array(value: unknown): value is Uint8Array
declare function isUint16Array(value: unknown): value is Uint16Array
declare function isUint32Array(value: unknown): value is Uint32Array
declare function isInt8Array(value: unknown): value is Int8Array
declare function isInt16Array(value: unknown): value is Int16Array
declare function isInt32Array(value: unknown): value is Int32Array
declare function isNull(value: unknown): value is null
declare function isUndef(value: unknown): value is undefined
declare function isEmpty(value: unknown): value is null | undefined
```
