---
title: "转换与校验 API"
description: "@cat-kit/core 编解码/转换链/schema 校验的完整函数与类型签名"
keywords:
  - str2u8a
  - hex2u8a
  - base642u8a
  - obj2query
  - query2obj
  - transform
  - safeParse
  - ValidationError
  - object schema
aliases:
  - 函数签名
  - 类型签名
  - API 参考
  - validator
  - schema parser
---

# 转换与校验 API

本篇列出编解码函数、`transform` 同步转换链与 schema 校验器（`object`/`optional`/`v*` 系列解析器）的完整签名及类型导出。

```ts
declare function str2u8a(str: string): Uint8Array
declare function u8a2str(u8a: Uint8Array): string
declare function u8a2hex(u8a: Uint8Array): string
declare function hex2u8a(hex: string): Uint8Array
declare function base642u8a(base64: string): Uint8Array
declare function u8a2base64(u8a: Uint8Array): string
declare function obj2query(obj: Record<string, any>): string
declare function query2obj(query: string): Record<string, any>

declare function transform<T extends (val: any) => any>(
  data: any,
  transformChain: [...Array<(val: any) => any>, T]
): ReturnType<T>

declare function object<S extends Record<string, Parser<any>>>(
  schema: S
): Validator<InferObjectSchema<S>>
declare function optional<T>(
  parser: Parser<T>,
  options?: { default?: T }
): Parser<T | undefined>
declare function vString(): Parser<string>
declare function vNumber(): Parser<number>
declare function vBoolean(): Parser<boolean>
declare function vDate(): Parser<Date>
declare function vArray<T>(item: Parser<T>): Parser<T[]>
declare class ValidationError extends Error {}
```

类型导出（type-only）：`Parser`、`Validator`、`SafeParseResult`、`ValidationIssue`、`InferObjectSchema`、`OptionalOptions`。

`Validator` 提供 `parse` / `safeParse`。
