---
title: "nanoid 随机 ID"
description: "密码学安全的随机 ID、自定义字母表与随机字节生成"
keywords:
  - nanoid
  - customAlphabet
  - customRandom
  - random
  - urlAlphabet
  - 随机 ID
  - 自定义字母表
  - 随机字节
aliases:
  - uuid 替代
  - nanoid js
  - 短 ID
  - 随机字符串生成
---

# crypto — nanoid

需要密码学安全的随机 ID 或随机字节时使用（非哈希/加密）。

## 推荐 API

`nanoid`、`customAlphabet`、`customRandom`、`random`、`urlAlphabet`

详情见 [API](apis.md)。

```ts
import { customAlphabet, nanoid } from '@cat-kit/crypto'

const requestId = nanoid() // 默认长度 21
const createCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
const code = createCode()
```

## 注意事项

- 需要 `globalThis.crypto.getRandomValues`
- `random(bytes)`：整数尺寸 `0..1024`，否则 `RangeError`
- `nanoid(0)` 返回 `''`
- 请使用非空字母表与安全字节源；ID 为概率唯一，不能替代 DB 唯一约束
