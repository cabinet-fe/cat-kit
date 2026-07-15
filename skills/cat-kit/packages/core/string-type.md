# core — 字符串与类型检测

## 何时使用

- 在驼峰命名与连字符命名之间转换，或稳定拼接 URL 路径。
- 需要可复用的 TypeScript 类型守卫，或要把值归类为公开的类型字符串。

## 推荐公开 API

- `str(value).camelCase()`、`str(value).kebabCase()`：命名转换。
- `$str.joinUrlPath(firstPath, ...paths)`：拼接 URL 或普通路径片段。
- `getDataType`：返回公开类型名称。
- 常用守卫：`isObj`、`isArray`、`isString`、`isNumber`、`isDate`、`isPromise`、`isNull`、`isUndef`、`isEmpty`。
- 二进制和浏览器值守卫：`isArrayBuffer`、`isUint8Array`、`isUint16Array`、`isUint32Array`、`isInt8Array`、`isInt16Array`、`isInt32Array`、`isBlob`、`isFile`、`isFormData`。

## 最小示例

```ts
import { $str, isObj, str } from '@cat-kit/core'

const key = str('user-profile').camelCase()
const endpoint = $str.joinUrlPath('https://api.example.com/', '/v1/', key)
const payload: unknown = { id: 1 }

if (isObj(payload)) {
  console.log(endpoint, payload.id)
}
```

## 约束与边界

- `camelCase` 和 `kebabCase` 面向常见英文标识符，不负责自然语言转写。
- `joinUrlPath` 处理路径斜杠，但不解析查询参数、哈希或相对 URL 解析规则；需要完整 URL 语义时使用原生 `URL`。
- `isArray` 与原生 `Array.isArray` 结论一致。
- `isNumber` 接受所有 `number` 类型值，包括 `NaN` 和无穷值；需要有限数字校验时使用 `vNumber()`。
- `isEmpty` 只对 `null` 和 `undefined` 返回 `true`，空字符串、空数组和空对象都不是这里的“空”。
- `isBlob`、`isFile`、`isFormData` 等应在具备相应全局类型的运行环境使用。

## 精确类型入口

- [字符串声明](../../generated/core/data/string.d.ts)
- [类型检测声明](../../generated/core/data/type.d.ts)
