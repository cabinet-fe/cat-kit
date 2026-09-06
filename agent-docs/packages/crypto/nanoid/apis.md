---
title: "nanoid API"
description: "nanoid、customAlphabet、customRandom、random、urlAlphabet 的签名"
keywords:
  - nanoid
  - customAlphabet
  - customRandom
  - random
  - urlAlphabet
  - 随机 ID 签名
  - 字母表
  - getRandom
aliases:
  - nanoid api
  - 随机 id 生成
  - custom alphabet
  - uuid 替代
---

# nanoid — API

随机 ID 与随机字节的公共 API 签名。

```ts
declare function nanoid(size?: number): string
declare function customAlphabet(
  alphabet: string,
  size?: number
): (size?: number) => string
declare function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string
declare function random(bytes: number): Uint8Array
declare const urlAlphabet: string
```
