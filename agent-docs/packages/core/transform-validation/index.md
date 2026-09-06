---
title: "转换与校验"
description: "@cat-kit/core 的编解码、查询串、同步转换链与 schema 校验器"
keywords:
  - 字符串编解码
  - 字节转换
  - Base64
  - 查询串序列化
  - 同步转换链
  - schema 校验
  - str2u8a
  - obj2query
  - createValidator
aliases:
  - querystring
  - URLSearchParams 替代
  - validator
  - 数据校验器
  - 编解码工具
---

# 转换与校验

`@cat-kit/core` 的转换与校验工具覆盖三类能力：字节编解码（字符串/Uint8Array/hex/Base64 互转）、对象与查询串互转（JSON 值语义）、同步转换链 `transform`，以及基于 `object` schema 的字段校验器（`parse`/`safeParse`）。

## 适用场景

- 字符串 ↔ Uint8Array、十六进制、Base64
- 对象 ↔ 查询串（JSON 值语义，非普通表单）
- 同步转换链、对象 schema 校验

## 推荐 API

- 编解码：`str2u8a`、`u8a2str`、`u8a2hex`、`hex2u8a`、`base642u8a`、`u8a2base64`、`obj2query`、`query2obj`
- `transform(data, chain)`：同步依次执行函数数组，返回最后一环结果（**无** `.pipe()` / `.value()`）
- 校验：`createValidator`、`object`、`optional`、`vString`、`vNumber`、`vBoolean`、`vDate`、`vArray`、`ValidationError`

## 注意事项

- `hex2u8a` 允许空白与 `0x`；空输入得空字节；奇数长度/非法 hex 抛错
- `obj2query`/`query2obj` 成对；`null`/`undefined` 序列化为空查询值，解析回 `''`
- `object(schema)` 只保留 schema 键并聚合字段错误
- `optional` 仅把 `undefined` 当缺省；`vNumber` 要求有限数；`vDate` 拒绝 Invalid Date

## 更多

- API：[转换与校验 API](apis.md)
- 示例：[转换与校验示例](examples.md)
