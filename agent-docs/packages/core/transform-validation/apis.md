---
title: "transform 与校验器 API"
description: "@cat-kit/core 转换与校验 API：字节编解码、查询串互转、transform 转换链与 object schema 校验器的完整签名、默认值、抛错条件与错误消息原文。"
aliases: [编解码 API, 校验器 API, safeParse API, schema API]
keywords: [str2u8a, u8a2str, u8a2hex, hex2u8a, base642u8a, u8a2base64, obj2query, query2obj, transform, object, optional, vString, vNumber, vArray, createValidator, ValidationError, safeParse, issues, schema 校验, 查询串]
---

# transform 与校验器 API

`@cat-kit/core` 导出 8 个编解码函数、同步转换链 `transform`，以及 schema 校验器体系（`object`、`optional`、`vString`、`vNumber`、`vBoolean`、`vDate`、`vArray`、`createValidator`、`ValidationError`）。`safeParse` 失败不抛错并返回 `issues` 列表；`parse` 失败抛出 `ValidationError`。

## 快速上手

```ts
import { object, optional, vArray, vNumber, vString } from '@cat-kit/core'

const schema = object({
  name: vString(),
  age: optional(vNumber(), { default: 18 }),
  tags: vArray(vString())
})

const result = schema.safeParse({ name: 'cat', tags: ['admin'] })
if (result.success) {
  console.log(result.data.age) // => 18（缺省字段填充 default）
} else {
  console.log(result.issues) // => [{ path: '', message: '...' }]
}
```

## API 签名

```ts
// ---- 编解码（TextEncoder/Decoder 优先，Node 回退 Buffer） ----

/** 字符串 → Uint8Array（UTF-8）；环境不支持时抛 Error('不支持的转换') */
export function str2u8a(data: string): Uint8Array

/** Uint8Array → 字符串（UTF-8）；环境不支持时抛 Error('不支持的转换') */
export function u8a2str(data: Uint8Array): string

/** Uint8Array → 小写十六进制字符串，每字节 2 个字符 */
export function u8a2hex(u8a: Uint8Array): string

/** 十六进制 → Uint8Array；忽略首尾空白与 0x/0X 前缀；空串返回长度 0
 *  @throws 奇数长度 Error('hex2u8a: 十六进制字符串长度须为偶数')
 *  @throws 非法字符 Error('hex2u8a: 包含非十六进制字符') */
export function hex2u8a(hex: string): Uint8Array

/** Base64 → Uint8Array；空串返回长度 0；环境不支持时抛 Error('不支持的转换') */
export function base642u8a(base64: string): Uint8Array

/** Uint8Array → Base64；空数组返回 ''；环境不支持时抛 Error('不支持的转换') */
export function u8a2base64(u8a: Uint8Array): string

// ---- 查询串（JSON 值语义，与 URLSearchParams 不同） ----

/** 对象 → 查询串（无开头 ?）；值为 null/undefined 输出空串，其余经 encodeURIComponent(JSON.stringify(value)) */
export function obj2query(obj: Record<string, any>): string

/** 查询串 → 对象；去掉开头 ?；无 '=' 的段丢弃；值解码后 JSON.parse 成功则还原类型，失败保留字符串，'' 保留为 '' */
export function query2obj(query: string): Record<string, any>

// ---- 转换链 ----

/** 同步按序执行 transformChain，返回最后一环结果 */
export function transform<T extends (val: any) => any>(
  data: any,
  transformChain: [...Array<(val: any) => any>, T]
): ReturnType<T>

// ---- 校验 ----

export interface ValidationIssue {
  /** 字段路径，对象键与数组索引用 '.' 连接：'name'、'profile.birthday'、'items.0.id' */
  path: string
  /** 人类可读错误信息 */
  message: string
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssue[] }

export type Parser<T> = (input: unknown) => SafeParseResult<T>

export class ValidationError extends Error {
  readonly issues: ReadonlyArray<ValidationIssue>
  /** message 取第一条 issue 的 message，issues 为空时为 'Validation error' */
  constructor(issues: ValidationIssue[])
}

export interface Validator<T> {
  safeParse(input: unknown): SafeParseResult<T>
  /** 失败抛出 ValidationError */
  parse(input: unknown): T
}

export function createValidator<T>(parser: Parser<T>): Validator<T>

export type InferObjectSchema<S extends Record<string, Parser<any>>> = {
  [K in keyof S]: InferParser<S[K]>
}

/** 对象校验器：输入必须是普通对象（数组、null 拒绝）；只输出 schema 中声明的键；收集全部字段错误 */
export function object<S extends Record<string, Parser<any>>>(schema: S): Validator<InferObjectSchema<S>>

export interface OptionalOptions<T> {
  /** 输入为 undefined 时生效；值或返回值的工厂函数 */
  default?: T | (() => T)
}

/** undefined 输入通过并取 default（或 undefined）；其余交给 parser */
export function optional<T>(parser: Parser<T>, options?: OptionalOptions<T>): Parser<T | undefined>

export function vString(): Parser<string>
export function vNumber(): Parser<number>
export function vBoolean(): Parser<boolean>
export function vDate(): Parser<Date>
export function vArray<T>(item: Parser<T>): Parser<T[]>
```

## 参数说明

### 编解码与转换

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `data`（`str2u8a`） | `string` | — | 是 | 按 UTF-8 编码 |
| `data`（`u8a2str`） | `Uint8Array` | — | 是 | 按 UTF-8 解码 |
| `u8a`（`u8a2hex` / `u8a2base64`） | `Uint8Array` | — | 是 | 空输入分别返回 `''` / `''` |
| `hex`（`hex2u8a`） | `string` | — | 是 | 首尾空白与 `0x` / `0X` 前缀被忽略；长度必须为偶数 |
| `base64`（`base642u8a`） | `string` | — | 是 | 标准 Base64（含 `=` 填充） |
| `obj`（`obj2query`） | `Record<string, any>` | — | 是 | `null` / `undefined` 值输出 `key=`；字符串值带 JSON 双引号 |
| `query`（`query2obj`） | `string` | — | 是 | 可带开头 `?`；不含 `=` 的段被丢弃 |
| `data`（`transform`） | `any` | — | 是 | 作为链首函数入参 |
| `transformChain` | 函数数组（至少 1 个） | — | 是 | 按数组顺序同步执行；任何一环抛错则 `transform` 向上抛出 |

### 校验器

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `schema`（`object`） | `Record<string, Parser>` | — | 是 | 键即输出键；输出对象只含 schema 键 |
| `parser`（`optional` / `vArray` / `createValidator`） | `Parser<T>` | — | 是 | `vArray` 逐元素应用并给 issue 路径加 `索引.` 前缀 |
| `options.default`（`optional`） | `T \| (() => T)` | `undefined` | 否 | 仅输入为 `undefined` 时生效；`null` 不算缺省，交给 parser 判定 |

解析器失败消息（`message` 原文）：`vString` → `期望是字符串`；`vNumber` → `期望是有限数字`；`vBoolean` → `期望是布尔值`；`vDate` → `期望是有效 Date`；`vArray` → `期望是数组`；`object` 非对象输入 → `期望是对象`。

## 方法与事件

- `Validator.parse(input)`：同步；成功返回 `data`，失败抛出 `ValidationError`，`err.issues` 为全部校验问题，`err.message` 为第一条 `issue.message`。
- `Validator.safeParse(input)`：同步；成功返回 `{ success: true, data }`，失败返回 `{ success: false, issues }`，不抛错。
- `object` 的错误收集：逐字段执行 parser，全部字段都会被校验；字段内路径自动拼接（`tags.1` 表示 `tags` 数组第 1 项）。
- `optional` 的 `default` 为函数时在解析时调用取返回值。

## 典型示例

### hex 编解码与错误处理

```ts
import { hex2u8a, u8a2hex } from '@cat-kit/core'

const hex = u8a2hex(new TextEncoder().encode('hi'))
console.log(hex) // => '6869'

const bytes = hex2u8a('0xAB')
console.log(bytes[0]) // => 171

try {
  hex2u8a('abc') // 奇数长度
} catch (err) {
  console.log((err as Error).message) // => 'hex2u8a: 十六进制字符串长度须为偶数'
}
```

### 查询串互转

```ts
import { obj2query, query2obj } from '@cat-kit/core'

const query = obj2query({ page: 1, kw: '搜索', active: true, tags: ['a', 'b'], empty: null })
console.log(query) // => 'page=1&kw=%22%E6%90%9C%E7%B4%A2%22&active=true&tags=%5B%22a%22%2C%22b%22%5D&empty='

const back = query2obj('?page=2&active=false&tags=%5B%22x%22%5D&note=&raw=abc')
console.log(back) // => { page: 2, active: false, tags: ['x'], note: '', raw: 'abc' }
```

### schema 校验与 ValidationError

```ts
import { ValidationError, object, optional, vArray, vNumber, vString } from '@cat-kit/core'

const userSchema = object({
  id: vNumber(),
  name: vString(),
  roles: vArray(vString()),
  remark: optional(vString(), { default: () => '无' })
})

const bad = userSchema.safeParse({ id: 'x', roles: ['admin', 2] })
if (!bad.success) {
  console.log(bad.issues.map((i) => `${i.path}: ${i.message}`))
  // => ['id: 期望是有限数字', 'name: 期望是字符串', 'roles.1: 期望是字符串']
}

try {
  userSchema.parse({ roles: [] })
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(err.name) // => 'ValidationError'
    console.log(err.issues[0]!.path) // => 'id'
  }
}
```

## 注意事项

> [!WARNING]
> - 本库查询串是 JSON 值语义，不是 `URLSearchParams` 表单语义：字符串值会被 `JSON.stringify` 加双引号（`kw=a` 存为 `kw=%22a%22`）；与原生 `URLSearchParams` 互操作前先对照行为。
> - `obj2query` 与 `query2obj` 必须成对使用；拿 `obj2query` 的输出喂给原生解析器会多出一层引号。
> - `hex2u8a` 是本组函数中唯一主动抛错的解码入口；`str2u8a` / `u8a2str` / `base642u8a` / `u8a2base64` 仅在环境既无 TextEncoder/Decoder（或 atob/btoa）又非 Node 时抛 `Error('不支持的转换')`。
> - `optional` 只把 `undefined` 当缺省；字段值为 `null` 时走 parser 并校验失败。
> - `object` 的输出只含 schema 声明的键，输入中的多余键被丢弃；这不是深度校验，嵌套对象请用 `object` 嵌套或 `vArray(object(...))` 组合。
> - `transform` 是同步转换链，没有 `.pipe()` / `.value()` 方法；异步任务编排用 `parallel`（见 `packages/core/optimize/apis.md`）。
