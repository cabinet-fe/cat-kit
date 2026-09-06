---
title: "转换与校验示例"
description: "@cat-kit/core 转换与校验示例：hex 编解码、同步转换链、schema safeParse"
keywords:
  - hex 编解码
  - u8a2hex
  - hex2u8a
  - transform 转换链
  - safeParse
  - optional 默认值
  - schema 校验示例
aliases:
  - hex to bytes
  - schema validation example
  - safeParse 示例
  - 转换链示例
---

# 转换与校验示例

以下示例演示 hex 编解码、`transform` 同步转换链与 `object` schema `safeParse`（含 `optional` 默认值）的组合用法。

```ts
import {
  hex2u8a,
  object,
  optional,
  transform,
  u8a2hex,
  vArray,
  vNumber,
  vString
} from '@cat-kit/core'

const hex = u8a2hex(new TextEncoder().encode('hi'))
const bytes = hex2u8a(hex)

const upper = transform('hello', [(s) => String(s).toUpperCase(), (s) => `${s}!`])

const schema = object({
  name: vString(),
  age: optional(vNumber(), { default: 18 }),
  tags: vArray(vString())
})

const result = schema.safeParse({ name: 'cat', tags: ['admin'] })
if (result.success) {
  console.log(result.data.age) // 18
}
```
