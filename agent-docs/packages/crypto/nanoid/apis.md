---
title: nanoid API 参考
description: "nanoid、customAlphabet、customRandom、random、urlAlphabet 五个导出的完整签名与行为：参数默认值、RangeError: Wrong ID size 抛错条件、共享字节池与空字母表死循环等边界。"
aliases: [nanoid api, 随机 ID 生成, custom alphabet, uuid 替代]
keywords: [customAlphabet, customRandom, random, urlAlphabet, getRandomValues, Wrong ID size, RangeError, crypto.getRandomValues is not available in this runtime, 随机 ID, 短 ID 生成, 自定义字母表, 随机字节, 验证码生成, 订单号生成, 请求 ID, URL 安全]
---

# nanoid API 参考

`@cat-kit/crypto` 包根导出的五个符号：`nanoid` 生成默认 21 位 URL 安全随机 ID，`customAlphabet` 与 `customRandom` 返回按自定义字母表（与自定义字节源）工作的生成器，`random` 输出密码学安全随机字节，`urlAlphabet` 是 64 字符默认字母表常量。全部为同步函数，运行前提是环境提供 `globalThis.crypto.getRandomValues`。

## 快速上手

```ts
import { nanoid } from '@cat-kit/crypto'

// 运行前提：环境提供 globalThis.crypto.getRandomValues（Browser、Node.js、Bun 均满足）
const requestId = nanoid() // 默认 21 位，字符全部来自 urlAlphabet
console.log(requestId) // => 21 个字符的随机串，例如 'V1StGXR8_Z5jdHi6B-myT'，每次调用不同
console.log(nanoid(8).length) // => 8
console.log(nanoid(0)) // => ''（空字符串）
```

## API 签名

```ts
/**
 * nanoid 默认字母表：64 个互不重复的 URL 安全字符（数字、大小写字母、-、_）
 */
export const urlAlphabet: string
// 实际值：'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

/**
 * 生成密码学安全随机字节
 * @param bytes 字节数；先做 `|= 0` 截断为 32 位整数
 * @returns 内部共享字节池的 subarray 视图，不是副本
 * @throws RangeError('Wrong ID size') 截断后 bytes < 0 或 > 1024
 * @throws Error('crypto.getRandomValues is not available in this runtime') 运行环境无 Web Crypto
 */
export function random(bytes: number): Uint8Array

/**
 * 组装自定义 ID 生成器
 * 字母表长度整除 256 时按 alphabet[byte & (alphabet.length - 1)] 取样；
 * 否则做拒绝采样：丢弃 >= 256 - (256 % alphabet.length) 的字节，避免模偏差
 * @param alphabet 字母表，必须非空
 * @param defaultSize 默认长度；先做 `|= 0` 截断
 * @param getRandom 随机字节源，入参为需要的字节数
 * @returns 生成器 (size?: number) => string
 */
export function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string

/**
 * customRandom(alphabet, size | 0, random) 的快捷方式
 * @param alphabet 字母表，必须非空
 * @param size 默认长度，默认 21；先做 `|= 0` 截断
 */
export function customAlphabet(alphabet: string, size = 21): (size?: number) => string

/**
 * 生成 URL 安全随机 ID，字符全部来自 urlAlphabet
 * @param size 长度，默认 21；先做 `|= 0` 截断；0（含 NaN 截断结果）返回 ''
 * @throws RangeError('Wrong ID size') 截断后 size < 0 或 > 1024
 * @throws Error('crypto.getRandomValues is not available in this runtime') 运行环境无 Web Crypto
 */
export function nanoid(size = 21): string
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `bytes`（`random`） | `number` | 无 | 是 | 截断为 32 位整数（`\|=`）；有效范围 0~1024；越界抛 `RangeError: Wrong ID size` |
| `alphabet`（`customAlphabet` / `customRandom`） | `string` | 无 | 是 | 必须非空，空串使生成器无限循环；长度整除 256 用掩码取样，否则用拒绝采样 |
| `size`（`customAlphabet` 第二参） | `number` | `21` | 否 | 截断为 32 位整数（`\|=`），结果作为生成器的 `defaultSize` |
| `defaultSize`（`customRandom` 第二参） | `number` | 无 | 是 | 截断为 32 位整数（`\|=`）；生成器无参调用时的长度 |
| `getRandom`（`customRandom` 第三参） | `(bytes: number) => Uint8Array` | 无 | 是 | 返回 `bytes` 个随机字节；传内置 `random` 即为密码学安全源 |
| `size`（`nanoid`） | `number` | `21` | 否 | 截断为 32 位整数（`\|=`）；有效范围 0~1024，越界抛 `RangeError: Wrong ID size`；截断结果为 0 时返回 `''` |
| `size`（生成器入参） | `number` | `defaultSize` | 否 | 不截断；`0`、`NaN` 返回 `''`；小数生成到 `length >= size` 为止（`3.7` 得 4 个字符） |

## 方法与事件

全部导出都是同步函数；没有异步 API、事件或回调订阅。

| 调用 | 返回 | 行为与抛错 |
| --- | --- | --- |
| `nanoid(size?)` | `string`（同步） | 字符取自 `urlAlphabet`；`size` 越界抛 `RangeError: Wrong ID size`；无 Web Crypto 抛 `Error: crypto.getRandomValues is not available in this runtime` |
| `random(bytes)` | `Uint8Array`（同步） | 返回内部共享池的 subarray 视图；抛错条件同上；池耗尽重新填充后，先前返回的视图内容被覆盖 |
| `customAlphabet(alphabet, size?)` 返回的生成器 | `string`（同步） | 字节源是内置 `random`；字母表长度不整除 256 时单次取样 `Math.ceil((1.6 * 256 * defaultSize) / (256 - (256 % alphabet.length)))` 字节，该值超过 1024 时透传 `RangeError: Wrong ID size`（如 `customAlphabet('abc', 2000)()`） |
| `customRandom(alphabet, defaultSize, getRandom)` 返回的生成器 | `string`（同步） | 字节源是传入的 `getRandom`；抛错行为由字节源决定 |

生成器共同行为：省略 `size` 时用 `defaultSize`；`size` 为 `0` 或 `NaN` 时返回 `''`；小数 `size` 生成到 `length >= size` 即停止。

## 典型示例

### 生成请求 ID 与短追踪号

```ts
import { nanoid } from '@cat-kit/crypto'

// 请求 ID：默认 21 位，可直接放进 URL 与日志
const requestId = nanoid()
console.log(requestId.length) // => 21

// 短追踪号：8 位
const traceId = nanoid(8)
console.log(traceId.length) // => 8

// 长度截断后超出 0~1024 会抛错
try {
  nanoid(2000)
} catch (err) {
  console.log((err as RangeError).message) // => 'Wrong ID size'
}
```

### 纯数字验证码与兑换码

```ts
import { customAlphabet } from '@cat-kit/crypto'

// 6 位纯数字验证码
const createOtp = customAlphabet('0123456789', 6)
const otp = createOtp()
console.log(otp.length) // => 6

// 36 位大写字母数字兑换码；生成器可复用，单次调用可覆盖长度
const createRedeemCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
const code = createRedeemCode()
const shortCode = createRedeemCode(4)
console.log(code.length, shortCode.length) // => 10 4
```

### 自带随机字节源组装生成器

```ts
import { customAlphabet, customRandom } from '@cat-kit/crypto'

// 可种子化的伪随机源：只用于测试断言，禁止用于安全场景
let seed = 42
function seededRandom(bytes: number): Uint8Array {
  const out = new Uint8Array(bytes)
  for (let i = 0; i < bytes; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    out[i] = seed % 256
  }
  return out
}

// 生成 2 个字符，字符只来自 'abc'
const createId = customRandom('abc', 2, seededRandom)
const id = createId()
console.log(id.length) // => 2
console.log([...id].every((char) => 'abc'.includes(char))) // => true

// 字节源是内置 random 时，defaultSize 过大（单次取样超过 1024 字节）会透传 RangeError
try {
  customAlphabet('abc', 2000)()
} catch (err) {
  console.log((err as RangeError).message) // => 'Wrong ID size'
}
```

## 注意事项

> [!WARNING]
> - 本库只从包根导入：`import { nanoid } from '@cat-kit/crypto'`；包没有 `@cat-kit/crypto/nanoid` 子路径导出，这种导入会失败。
> - 本库是随机 ID 与随机字节工具，不是加密库：没有 AES、SHA、MD5、HMAC、签名 API。
> - `nanoid` 输出是字母表字符串，不是 UUID 的 36 位 `8-4-4-4-12` 格式；本库没有 UUID 生成函数。
> - `random` 返回的是内部共享字节池的视图，不是副本：池耗尽重新填充后，先前返回的 `Uint8Array` 内容会被覆盖；需要长期持有必须先拷贝（`new Uint8Array(bytes)`）。
> - 禁止给字母表传空串：`customAlphabet('', 21)` 调用生成器后无限循环、进程挂起，且不抛错。
> - 尺寸参数（`random` 的 `bytes`、`nanoid` 的 `size`、`customAlphabet` 的 `size`）先做 `|=` 截断：小数截断为整数，`NaN` 变为 `0`；截断后小于 0 或大于 1024 抛 `RangeError: Wrong ID size`。
> - 运行环境必须有 `globalThis.crypto.getRandomValues`（Browser、Node.js、Bun 通用；实现不依赖 `node:crypto` 与 `Buffer`）；缺失时抛 `Error: crypto.getRandomValues is not available in this runtime`。
> - ID 为概率唯一，不能替代数据库唯一约束或分布式锁。

## 常见问题

### 报错 `RangeError: Wrong ID size`

原因：`random(bytes)` 或 `nanoid(size)` 的参数截断为 32 位整数后小于 0 或大于 1024。修复：把长度限制在 0~1024 再传入。

```ts
import { nanoid } from '@cat-kit/crypto'

const requestedSize = 2048
// 限制到 0~1024，超出部分按 1024 处理
const size = Math.min(Math.max(Math.floor(requestedSize), 0), 1024)
const id = nanoid(size)
console.log(id.length) // => 1024
```

### 报错 `Error: crypto.getRandomValues is not available in this runtime`

原因：运行环境没有全局 Web Crypto。修复：换到提供 `globalThis.crypto.getRandomValues` 的运行时（Browser、Node.js、Bun）。Node.js 下先确认：

```bash
node -p "typeof globalThis.crypto?.getRandomValues" # => 'function' 表示可用
```

### `customAlphabet('', 21)` 不报错但进程卡住

原因：字母表长度为 0 时生成器凑不出任何字符，进入无限循环。修复：字母表至少包含 1 个字符。

```ts
import { customAlphabet } from '@cat-kit/crypto'

const createId = customAlphabet('0123456789', 6)
console.log(createId().length) // => 6
```
