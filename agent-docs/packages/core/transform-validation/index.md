---
title: "转换与校验模块（transform / object）"
description: "@cat-kit/core 的 transform-validation 模块：字符串、Uint8Array、hex、Base64 互转，JSON 语义的查询串互转，同步转换链 transform，以及 object schema 校验器（safeParse / parse / optional / v* 解析器）。"
aliases: [编解码模块, 校验模块, transform 模块, validator 模块]
keywords: [str2u8a, u8a2str, u8a2hex, hex2u8a, base642u8a, u8a2base64, obj2query, query2obj, transform, object, optional, vString, vNumber, vArray, ValidationError, safeParse, 编解码, schema 校验, 查询串]
---

# 转换与校验模块（transform / object）

`transform-validation` 模块从 `@cat-kit/core` 导出三组能力：字节与编码转换（`str2u8a` / `u8a2str` / `u8a2hex` / `hex2u8a` / `base642u8a` / `u8a2base64`）、URL 查询串互转（`obj2query` / `query2obj`，JSON 值语义）与同步转换链 `transform`；校验部分提供 `object` schema 校验器、字段解析器 `vString` / `vNumber` / `vBoolean` / `vDate` / `vArray`、可选字段 `optional`、自定义解析器入口 `createValidator` 与失败异常 `ValidationError`。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { hex2u8a, object, transform, u8a2hex, vString } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `str2u8a` | 字符串转 `Uint8Array`（UTF-8） | `packages/core/transform-validation/apis.md` |
| `u8a2str` | `Uint8Array` 转字符串（UTF-8） | `packages/core/transform-validation/apis.md` |
| `u8a2hex` | `Uint8Array` 转十六进制字符串 | `packages/core/transform-validation/apis.md` |
| `hex2u8a` | 十六进制字符串转 `Uint8Array`，非法输入抛错 | `packages/core/transform-validation/apis.md` |
| `base642u8a` | Base64 字符串转 `Uint8Array` | `packages/core/transform-validation/apis.md` |
| `u8a2base64` | `Uint8Array` 转 Base64 字符串 | `packages/core/transform-validation/apis.md` |
| `obj2query` | 对象转查询串，值经 `JSON.stringify` 再编码 | `packages/core/transform-validation/apis.md` |
| `query2obj` | 查询串转对象，`JSON.parse` 成功则还原类型 | `packages/core/transform-validation/apis.md` |
| `transform` | 按函数链同步依次转换，返回最后一环结果 | `packages/core/transform-validation/apis.md` |
| `object` | 创建对象 schema 校验器，收集全部字段错误 | `packages/core/transform-validation/apis.md` |
| `optional` | 字段可选：`undefined` 通过并取 `default` | `packages/core/transform-validation/apis.md` |
| `vString` | 字符串解析器 | `packages/core/transform-validation/apis.md` |
| `vNumber` | 有限数字解析器（拒绝 `NaN`、`Infinity`） | `packages/core/transform-validation/apis.md` |
| `vBoolean` | 布尔解析器 | `packages/core/transform-validation/apis.md` |
| `vDate` | 有效 `Date` 解析器（拒绝 Invalid Date） | `packages/core/transform-validation/apis.md` |
| `vArray` | 数组解析器，逐元素校验并带索引路径 | `packages/core/transform-validation/apis.md` |
| `createValidator` | 从自定义 `Parser` 创建 `Validator` | `packages/core/transform-validation/apis.md` |
| `ValidationError` | `parse` 失败抛出的异常，携带 `issues` | `packages/core/transform-validation/apis.md` |

类型导出：`Parser`、`Validator`、`SafeParseResult`、`ValidationIssue`、`InferObjectSchema`、`OptionalOptions`。
