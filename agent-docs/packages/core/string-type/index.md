---
title: "字符串与类型守卫模块（str）"
description: "@cat-kit/core 的 string-type 模块：str() 驼峰与 kebab 命名转换、$str.joinUrlPath 拼接 URL 路径，以及覆盖原始值、浏览器对象、Promise 与 TypedArray 的全套运行时类型守卫。"
aliases: [字符串工具模块, 类型守卫模块, string type 模块]
keywords: [str, camelCase, kebabCase, joinUrlPath, getDataType, isString, isNumber, isEmpty, 类型守卫, 驼峰转换, URL 拼接]
---

# 字符串与类型守卫模块（str）

`string-type` 模块从 `@cat-kit/core` 导出字符串工具 `str()` / `$str` 与全套运行时类型守卫：`str()` 提供驼峰与 kebab 命名转换，`$str.joinUrlPath` 拼接 URL 路径段，`getDataType` 与 22 个 `isXxx` 函数覆盖原始值、`Blob` / `File` / `FormData`、`Promise` 与各类 TypedArray 的类型判断。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { $str, getDataType, isString, str } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `str` | 包装字符串：`camelCase`、`kebabCase` | `packages/core/string-type/apis.md` |
| `$str` | 字符串工具集：`joinUrlPath(firstPath, ...paths)` | `packages/core/string-type/apis.md` |
| `getDataType` | 返回值的小写类型字符串，如 `'array'`、`'date'` | `packages/core/string-type/apis.md` |
| `isObj` | 是否是普通对象（`[object Object]`，含 class 实例） | `packages/core/string-type/apis.md` |
| `isArray` | 是否是数组，委托 `Array.isArray` | `packages/core/string-type/apis.md` |
| `isString` | 是否是字符串 | `packages/core/string-type/apis.md` |
| `isNumber` | 是否是 number（`NaN` 返回 `true`） | `packages/core/string-type/apis.md` |
| `isBlob` | 是否是 `Blob`（`instanceof` 判断） | `packages/core/string-type/apis.md` |
| `isDate` | 是否是 `Date`（Invalid Date 返回 `true`） | `packages/core/string-type/apis.md` |
| `isFunction` | 是否是函数 | `packages/core/string-type/apis.md` |
| `isBool` | 是否是布尔值 | `packages/core/string-type/apis.md` |
| `isFile` | 是否是 `File` | `packages/core/string-type/apis.md` |
| `isFormData` | 是否是 `FormData` | `packages/core/string-type/apis.md` |
| `isSymbol` | 是否是 `symbol` | `packages/core/string-type/apis.md` |
| `isPromise` | 是否是 `Promise`（`async` 函数返回值也为 `true`） | `packages/core/string-type/apis.md` |
| `isArrayBuffer` | 是否是 `ArrayBuffer` | `packages/core/string-type/apis.md` |
| `isUint8Array` / `isUint16Array` / `isUint32Array` | 是否是对应无符号 TypedArray | `packages/core/string-type/apis.md` |
| `isInt8Array` / `isInt16Array` / `isInt32Array` | 是否是对应有符号 TypedArray | `packages/core/string-type/apis.md` |
| `isNull` | 是否是 `null` | `packages/core/string-type/apis.md` |
| `isUndef` | 是否是 `undefined` | `packages/core/string-type/apis.md` |
| `isEmpty` | 是否是空值，仅 `null` / `undefined` 为 `true` | `packages/core/string-type/apis.md` |

`DataType` 类型与 `CatString` 类均为源码内部声明，不作命名导出。
