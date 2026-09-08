---
title: "转换与校验场景：接口数据解码落库"
description: "用 @cat-kit/core 的 base642u8a、u8a2hex、object schema 校验、transform 转换链与 obj2query 完成接口二进制附件与表单数据的解码、校验与回传。"
aliases: [编解码场景, 接口校验场景, 表单校验示例]
keywords: [base642u8a, u8a2hex, hex2u8a, object, vString, vNumber, vArray, optional, safeParse, ValidationError, transform, obj2query, query2obj, 附件解码, 表单校验]
---

# 转换与校验场景：接口数据解码落库

用 `@cat-kit/core` 完成「Base64 附件解码 → 校验码核对 → 表单 schema 校验 → 转换链归一化 → 回传查询串构造」的端到端流程，覆盖 `transform-validation` 模块的全部高频导出。

## 场景

- 何时用本方案：接口以 Base64 下发二进制（附件、密钥、图片），本地需要解码、核对内容、校验随附的表单数据，再把规范化后的参数拼回查询串。
- 何时不用：只做原生 `atob` / `btoa` 可完成的纯字符串 Base64 转换时可直接用原生 API；需要 `Uint8Array` 语义（逐字节、hex 展示、跨环境一致）时用本模块。

## 完整示例

```ts
import {
  ValidationError,
  base642u8a,
  hex2u8a,
  obj2query,
  object,
  optional,
  transform,
  u8a2hex,
  u8a2str,
  vArray,
  vNumber,
  vString
} from '@cat-kit/core'

// 1. 解码 Base64 附件并转 hex 展示
const payload = base642u8a('aGVsbG8=') // 'hello' 的 Base64
const fingerprint = u8a2hex(payload)
console.log(fingerprint) // => '68656c6c6f'
console.log(payload.length) // => 5

// 1.1 需要文本形式时再转回 UTF-8 字符串
console.log(u8a2str(payload)) // => 'hello'

// 2. 表单 schema：name 必填、score 为有限数字、tags 每项为字符串、memo 可选带缺省
const formSchema = object({
  name: vString(),
  score: vNumber(),
  tags: vArray(vString()),
  memo: optional(vString(), { default: '-' })
})

// 3. 转换链：去空格 → 截断为 10 字符
const normalize = (input: string) => transform(input, [(s: any) => String(s).trim(), (s: any) => String(s).slice(0, 10)])

function handleForm(input: Record<string, unknown>): string {
  const normalized = { ...input, name: normalize(String(input.name)) }

  const result = formSchema.safeParse(normalized)
  if (!result.success) {
    // 汇总全部字段错误；paths 形如 'tags.1'
    return result.issues.map((i) => `${i.path}: ${i.message}`).join('; ')
  }

  // 4. 校验通过后构造回传查询串（JSON 值语义，必须用 query2obj 或同语义端解析）
  return obj2query({ name: result.data.name, tags: result.data.tags, memo: result.data.memo })
}

console.log(handleForm({ name: '  cat ', score: 99, tags: ['a', 'b'] }))
// => 'name=%22cat%22&tags=%5B%22a%22%2C%22b%22%5D&memo=%22-%22'
console.log(handleForm({ name: 'x', score: 'bad', tags: ['a', 2] }))
// => 'score: 期望是有限数字; tags.1: 期望是字符串'

// 4.1 hex 与字节互为逆运算，用于附件校验码核对
console.log(u8a2hex(hex2u8a(fingerprint)) === fingerprint) // => true

// 5. 需要异常式风格时用 parse，捕获 ValidationError 逐条展示
try {
  formSchema.parse({ name: 'x' })
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(err.issues[0]!.message) // => '期望是有限数字'
  }
}
```

## 要点说明

- `base642u8a('aGVsbG8=')`：Node 与浏览器共用同一入口，内部优先 `Buffer` / `atob`；空串输入返回长度 0 的 `Uint8Array`。
- `u8a2hex(payload)`：输出小写十六进制，每字节 2 字符，用于日志与比对；反向解码用 `hex2u8a`。
- `formSchema.safeParse`：一次收集全部字段错误；`memo` 缺省经工厂函数 `() => '-'` 在解析时求值，输出对象中该键为 `'-'`。
- `transform(input, [trim, slice])`：链式调用同步执行，等价 `slice(trim(input))`；链中任一函数抛错会向上传播。
- `obj2query(result.data)`：输出不含开头 `?`；`memo: '-'` 序列化为 `memo=%22-%22`，与 `query2obj` 成对还原。
- 错误分流：`safeParse` 的 `issues` 路径可直接映射到表单控件（`tags.1` 对应 tags 数组第 1 个输入框），无需自己拼路径。

## 注意事项

> [!WARNING]
> - 本库查询串是 JSON 值语义：字符串值带引号、`null` / `undefined` 变成空值；禁止把 `obj2query` 的输出直接交给按表单语义解析的 `URLSearchParams` 端。
> - `hex2u8a` 对奇数长度与非法字符抛 `Error`（消息见 `packages/core/transform-validation/apis.md`），处理外部输入时必须 `try/catch`。
> - `optional` 仅对 `undefined` 生效；`score: null` 会校验失败，不会取 `default`。
> - `vNumber` 拒绝 `NaN` 与 `Infinity`；这与 `isNumber`（`NaN` 为 `true`）的判定不同。
> - `transform` 是同步转换链；包含 `Promise` 的异步任务用 `parallel`（见 `packages/core/optimize/apis.md`）。
> - `object` 输出只含 schema 声明的键：回传前若依赖输入中的其他字段，需从原输入另行读取。
