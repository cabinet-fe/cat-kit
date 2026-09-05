---
title: "nanoid API"
description: "nanoid、customAlphabet、customRandom、random、urlAlphabet 的签名"
---

# nanoid — API

随机 ID 与随机字节的公共 API 签名，完整定义见 [nanoid.d.ts](../../../../packages/crypto/dist/nanoid.d.ts)。

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
