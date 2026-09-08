---
title: "str 与类型守卫 API"
description: "@cat-kit/core 字符串与类型守卫 API：str().camelCase/kebabCase、$str.joinUrlPath 与 getDataType、isObj、isEmpty 等 24 个守卫函数的签名、约束与边界行为。"
aliases: [字符串 API, 类型守卫 API, camelCase 转换, type guards]
keywords: [str, camelCase, kebabCase, joinUrlPath, getDataType, isObj, isArray, isNumber, isPromise, isEmpty, isUint8Array, 类型守卫, 驼峰, kebab, URL 路径拼接]
---

# str 与类型守卫 API

`@cat-kit/core` 导出字符串工具 `str()` 与 `$str`、类型探测函数 `getDataType`，以及 23 个类型守卫函数（`isObj` 至 `isEmpty`）。守卫函数均同步返回 `boolean` 并收窄 TypeScript 类型，不抛错。

## 快速上手

```ts
import { $str, isNumber, str } from '@cat-kit/core'

console.log(str('hello-world').camelCase()) // => 'helloWorld'
console.log(str('hello_world').camelCase('upper')) // => 'HelloWorld'
console.log(str('helloWorld').kebabCase()) // => 'hello-world'
console.log($str.joinUrlPath('https://api.example.com', '/v1', 'users')) // => 'https://api.example.com/v1/users'
console.log(isNumber(1)) // => true
```

## API 签名

```ts
/** 创建字符串操作对象 */
export function str(str: string): CatString

interface CatString {
  /**
   * 转驼峰命名
   * @param type 'lower' 小驼峰（默认），'upper' 大驼峰
   */
  camelCase(type?: 'lower' | 'upper'): string
  /** 转 kebab-case；每个大写字母前插入 '-'（首字符大写时含前导 '-'） */
  kebabCase(): string
}

export const $str: {
  /**
   * 拼接 URL 路径段；自动过滤空段、折叠重复 '/'、识别协议前缀
   */
  joinUrlPath(firstPath: string, ...paths: string[]): string
}

/** 返回内部类型字符串：'object' | 'array' | 'string' | 'number' | 'blob' | 'date' | 'undefined' | 'function' | 'boolean' | 'file' | 'formdata' | 'symbol' | 'promise' | 'null' | 'arraybuffer'；未覆盖的值返回实际内部类名（如 'regexp'、'uint8array'、'map'） */
export function getDataType(value: any): string

export function isObj(value: any): value is Record<string, any>
export function isArray(value: any): value is Array<any>
export function isString(value: any): value is string
export function isNumber(value: any): value is number
export function isBlob(value: any): value is Blob
export function isDate(value: any): value is Date
export function isFunction(value: any): value is Function
export function isBool(value: any): value is boolean
export function isFile(value: any): value is File
export function isFormData(value: any): value is FormData
export function isSymbol(value: any): value is symbol
export function isPromise(value: any): value is Promise<any>
export function isArrayBuffer(value: any): value is ArrayBuffer
export function isUint8Array(value: any): value is Uint8Array
export function isUint16Array(value: any): value is Uint16Array
export function isUint32Array(value: any): value is Uint32Array
export function isInt8Array(value: any): value is Int8Array
export function isInt16Array(value: any): value is Int16Array
export function isInt32Array(value: any): value is Int32Array
export function isNull(value: any): value is null
export function isUndef(value: any): value is undefined
export function isEmpty(value: any): boolean
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `str`（`str()` 入参） | `string` | — | 是 | 只接受字符串 |
| `type`（`camelCase`） | `'lower' \| 'upper'` | `'lower'` | 否 | 其他值按 `'upper'` 处理（首字符保持大写） |
| `firstPath`（`joinUrlPath`） | `string` | — | 是 | 含 `http(s)://`、`ftp://`、`file://` 协议时按协议前缀拼接 |
| `paths`（`joinUrlPath`） | `string[]` | `[]` | 否 | 空字符串段被过滤；最后一个入参以 `/` 结尾时结果以 `/` 结尾 |
| `value`（全部守卫） | `any` | — | 是 | 不抛错；`isBlob` / TypedArray 系列用 `instanceof`，跨 realm 的对象实例会返回 `false` |

判断方式约束：

- `getDataType` / `isObj` / `isString` / `isNumber` / `isDate` / `isFunction` / `isBool` / `isFile` / `isFormData` / `isSymbol` / `isPromise` 基于 `Object.prototype.toString`，跨 realm 结论一致。
- `isArray` 委托 `Array.isArray`。
- `isBlob` / `isArrayBuffer` / `isUint8Array` / `isUint16Array` / `isUint32Array` / `isInt8Array` / `isInt16Array` / `isInt32Array` 基于 `instanceof`。
- `isNull` 为 `value === null`；`isUndef` 为 `value === undefined`；`isEmpty` 为 `value === null || value === undefined`。

## 典型示例

### 命名风格互转

```ts
import { str } from '@cat-kit/core'

console.log(str('hello-world').camelCase()) // => 'helloWorld'
console.log(str('hello_world').camelCase('upper')) // => 'HelloWorld'
console.log(str('helloWorld').kebabCase()) // => 'hello-world'
console.log(str('HelloWorld').kebabCase()) // => '-hello-world'（首字符大写会带前导 '-'）
```

### 拼接接口路径

```ts
import { $str } from '@cat-kit/core'

console.log($str.joinUrlPath('https://api.example.com/', '/v1/', 'users')) // => 'https://api.example.com/v1/users'
console.log($str.joinUrlPath('/api', 'users', 'list/')) // => '/api/users/list/'（末段带斜杠则保留尾斜杠）
console.log($str.joinUrlPath('', '')) // => ''
```

### 接口数据的运行时分流

```ts
import { isArray, isDate, isEmpty, isObj, isString } from '@cat-kit/core'

function describe(value: unknown): string {
  if (isEmpty(value)) return '缺失'
  if (isArray(value)) return `数组，长度 ${value.length}`
  if (isObj(value)) return '对象'
  if (isDate(value)) return `日期 ${value.getTime()}`
  if (isString(value)) return `字符串 ${value}`
  return '其他'
}

console.log(describe(null)) // => '缺失'
console.log(describe(['a'])) // => '数组，长度 1'
console.log(describe('hi')) // => '字符串 hi'
```

## 注意事项

> [!WARNING]
> - `kebabCase` 在首字符大写时产生前导 `'-'`（`'HelloWorld'` → `'-hello-world'`）；转换前自行保证输入首字符小写，或对结果做 `replace(/^-/, '')`。
> - `isNumber(NaN)` 返回 `true`；需要排除 `NaN` 与 `Infinity` 时用校验模块的 `vNumber()`（见 `packages/core/transform-validation/apis.md`）。
> - `isDate(new Date(NaN))` 返回 `true`；有效性校验用 `vDate()` 或 `Number.isNaN(d.getTime())`。
> - `isEmpty` 仅把 `null` / `undefined` 视为空；空字符串、`0`、空数组都是非空。这与 lodash `isEmpty`（空数组、空字符串也算空）不同。
> - `camelCase` 只处理 `^`、`-`、`_` 三类边界后的小写补齐；`'foo1Bar'` 这类已含大写的输入原样保留大写。
> - `isBlob` 等 `instanceof` 系守卫在 iframe 等跨 realm 场景对另一侧实例返回 `false`；跨环境代码优先用 `getDataType` 系守卫。
