---
title: "字符串与类型检测"
description: "@cat-kit/core 的 str()/$str 与类型守卫：命名转换、URL 拼接、运行时类型判断"
---

# 字符串与类型检测

`@cat-kit/core` 的字符串与类型检测工具包含：`str(value)` 的驼峰/kebab 命名转换、`$str.joinUrlPath` 的 URL 路径段拼接，以及覆盖原始值、浏览器对象（`Blob`/`File`/`FormData`）、Promise 与各类 TypedArray 的运行时类型守卫。

## 适用场景

- 驼峰 / kebab 命名转换、拼接 URL 路径段
- 运行时类型守卫（含浏览器类型如 `Blob`/`File`）

## 推荐公开 API

- `str(value)`：`.camelCase(type?)`、`.kebabCase()`
- `$str.joinUrlPath(firstPath, ...paths)`
- `getDataType`、`isObj`、`isArray`、`isString`、`isNumber`、`isBlob`、`isDate`、`isFunction`、`isBool`、`isFile`、`isFormData`、`isSymbol`、`isPromise`、各类 TypedArray 守卫、`isNull`、`isUndef`、`isEmpty`

```ts
import { $str, isNumber, str } from '@cat-kit/core'

str('hello_world').camelCase() // 'helloWorld'
str('HelloWorld').kebabCase() // '-hello-world'（每个大写前插连字符）
$str.joinUrlPath('/api/', '/users', '1')
isNumber(NaN) // true；有限数校验请用 vNumber()
```

## 约束

- `isEmpty` 仅 `null | undefined`
- 浏览器 / TypedArray 守卫依赖对应全局
- `DataType` 类型名不作为命名导出

## 类型声明

- [packages/core/dist/data/string.d.ts](../../../../packages/core/dist/data/string.d.ts)
- [packages/core/dist/data/type.d.ts](../../../../packages/core/dist/data/type.d.ts)

## 更多

- API：[字符串与类型检测 API](apis.md)
