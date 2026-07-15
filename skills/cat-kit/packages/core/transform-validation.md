# core — 转换与校验

## 何时使用

- 在字符串、`Uint8Array`、十六进制和 Base64 之间转换。
- 成对编码和还原包含对象或数组值的查询串。
- 用小型 schema 校验外部输入，并获得类型化结果或结构化问题列表。

## 推荐公开 API

- 字节转换：`str2u8a`、`u8a2str`、`u8a2hex`、`hex2u8a`、`u8a2base64`、`base642u8a`。
- 查询串：`obj2query`、`query2obj`。
- 转换链：`transform(data, methods)`。
- 校验：`object`、`optional`、`vString`、`vNumber`、`vBoolean`、`vDate`、`vArray`。
- 自定义校验：`createValidator`、`Parser`、`Validator`、`ValidationError`。

## 最小示例

```ts
import { object, optional, vArray, vNumber, vString } from '@cat-kit/core'

const schema = object({
  name: vString(),
  age: optional(vNumber()),
  tags: vArray(vString())
})

const result = schema.safeParse({
  name: '咪咪',
  tags: ['admin']
})

if (!result.success) {
  console.error(result.issues)
}
```

## 约束与边界

- `safeParse` 失败时返回 `{ success: false, issues }`；`parse` 失败时抛出 `ValidationError`。
- `object` 输出 schema 中声明的字段，并尽量收集各字段问题；它不是自动类型强制转换器。
- `optional` 只把 `undefined` 视为缺省，`null` 仍交给原 parser 校验。
- `vNumber` 只接受有限数字，不把数字字符串转换为数字。
- `hex2u8a` 接受可选 `0x` 前缀；奇数长度或非法字符会抛错。
- `obj2query` 与 `query2obj` 是一对 JSON 值编码规则，不等同于普通表单的 `URLSearchParams` 语义。空值会还原为空字符串；不要混用两套约定。
- `transform` 按数组顺序同步调用函数；其中函数返回 Promise 时不会自动逐步等待。

## 精确类型入口

- [转换声明](../../generated/core/data/transform.d.ts)
- [校验声明](../../generated/core/data/validator.d.ts)
