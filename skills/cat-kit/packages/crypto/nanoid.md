# crypto — nanoid

随机 ID 生成工具。默认 ID 为 URL 安全字符串，适用于 Browser / Node.js / Bun。

## `nanoid`

```ts
function nanoid(size?: number): string
```

生成随机 ID。默认长度 `21`。

```ts
import { nanoid } from '@cat-kit/crypto'

const id = nanoid()
const shortId = nanoid(8)
```

## `customAlphabet`

```ts
function customAlphabet(alphabet: string, size?: number): (size?: number) => string
```

使用自定义字符集创建生成器。

```ts
import { customAlphabet } from '@cat-kit/crypto'

const createCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

createCode()
createCode(6)
```

## `customRandom`

```ts
function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string
```

使用自定义随机字节来源创建生成器。实现会拒绝导致 modulo bias 的随机字节，保持字符分布均匀。

## `random`

```ts
function random(bytes: number): Uint8Array
```

返回安全随机字节。`bytes` 范围为 `0` 到 `1024`。

## `urlAlphabet`

```ts
const urlAlphabet: string
```

`nanoid` 默认字符集。

> 类型签名：`../../generated/crypto/index.d.ts`
