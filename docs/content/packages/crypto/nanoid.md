---
title: 随机 ID
description: '@cat-kit/crypto 的 nanoid 随机 ID 生成工具'
outline: deep
sidebarOrder: 2
---

# 随机 ID

## 介绍

本页介绍 `@cat-kit/crypto` 的随机 ID 生成能力。实现基于 Web Crypto `crypto.getRandomValues`，可在 Browser / Node.js / Bun 中使用。

默认的 `nanoid` 生成 URL 安全字符串，适合作为前端临时 ID、请求追踪 ID、非敏感业务对象 ID 等场景。

## 快速使用

```typescript
import { nanoid } from '@cat-kit/crypto'

const id = nanoid()
const shortId = nanoid(8)
```

::: demo crypto/nanoid.vue
:::

## API参考

### `nanoid`

```ts
function nanoid(size?: number): string
```

生成 URL 安全的随机 ID。默认长度为 `21`，字符来自 `urlAlphabet`。

```ts
import { nanoid } from '@cat-kit/crypto'

nanoid() // 例如 'V1StGXR8_Z5jdHi6B-myT'
nanoid(8)
```

### `customAlphabet`

```ts
function customAlphabet(alphabet: string, size?: number): (size?: number) => string
```

基于自定义字符集创建 ID 生成器。

```ts
import { customAlphabet } from '@cat-kit/crypto'

const createCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

createCode()
createCode(6)
```

### `customRandom`

```ts
function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string
```

使用自定义随机字节来源创建 ID 生成器。`customRandom` 会拒绝导致 modulo bias 的随机字节，避免字符分布倾斜。

### `random`

```ts
function random(bytes: number): Uint8Array
```

返回指定长度的安全随机字节。长度必须在 `0` 到 `1024` 之间。

### `urlAlphabet`

```ts
const urlAlphabet: string
```

`nanoid` 默认使用的 URL 安全字符集。
