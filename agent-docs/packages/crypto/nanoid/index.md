---
title: nanoid 随机 ID 生成
description: "@cat-kit/crypto 包根导出的 nanoid 模块：nanoid 生成默认 21 位 URL 安全随机 ID，customAlphabet/customRandom 按自定义字母表与随机源生成，random 输出密码学安全随机字节，urlAlphabet 为 64 字符默认字母表。"
aliases: [uuid 替代, nanoid js, 短 ID, 随机字符串生成, 请求 ID 生成]
keywords: [customAlphabet, customRandom, random, urlAlphabet, getRandomValues, 短 ID 生成, 自定义字母表, 随机字节, 唯一 ID, 请求 ID, 订单号, 验证码, URL 安全]
---

# nanoid 随机 ID 生成

`@cat-kit/crypto` 包根导出的 nanoid 模块，提供密码学安全的随机 ID 与随机字节：`nanoid` 一次调用得到 21 位 URL 安全 ID，`customAlphabet` 与 `customRandom` 组装自定义字母表、自定义随机源的生成器，`random` 取原始随机字节，`urlAlphabet` 是默认 64 字符字母表常量。移植自 nanoid v5.1.11。

## 安装

```bash
# npm
npm install @cat-kit/crypto
# pnpm
pnpm add @cat-kit/crypto
# bun
bun add @cat-kit/crypto
```

使用约束：

```ts
import { nanoid } from '@cat-kit/crypto'

const id = nanoid()
console.log(id.length) // => 21
```

- 只能从包根导入（`'@cat-kit/crypto'`）；包的 `exports` 字段没有子路径，`import from '@cat-kit/crypto/nanoid'` 会导入失败。
- 仅支持 ESM：`exports` 只提供 `import` 条件；CommonJS 的 `require('@cat-kit/crypto')` 会失败。
- 运行环境必须提供 `globalThis.crypto.getRandomValues`（Browser、Node.js、Bun 均满足）。缺失时抛出 `Error: crypto.getRandomValues is not available in this runtime`。

## 模块速查

五个导出全部经包根提供，完整 API 文档在 `packages/crypto/nanoid/apis.md`：

| 导出 | 类型 | 用途 | 文档路径 |
| --- | --- | --- | --- |
| `nanoid` | 函数 | 生成默认 21 位 URL 安全随机 ID | `packages/crypto/nanoid/apis.md` |
| `customAlphabet` | 函数 | 返回按指定字母表生成 ID 的生成器 | `packages/crypto/nanoid/apis.md` |
| `customRandom` | 函数 | 返回按指定字母表与随机字节源生成 ID 的生成器 | `packages/crypto/nanoid/apis.md` |
| `random` | 函数 | 取密码学安全随机字节，返回 `Uint8Array` | `packages/crypto/nanoid/apis.md` |
| `urlAlphabet` | 常量 | `nanoid` 默认的 64 字符 URL 安全字母表 | `packages/crypto/nanoid/apis.md` |

按需求选择导出：

- 需要 URL 安全的随机 ID（请求 ID、追踪号、日志追踪、对象键）：用 `nanoid`。
- 需要限定字符集（纯数字验证码、订单号、去掉易混字符的兑换码）：用 `customAlphabet`。
- 需要自带随机字节源（可种子化的测试随机数、专用 CSPRNG）：用 `customRandom`。
- 需要原始随机字节（盐、密钥材料、IV）：用 `random`。
- 需要确认 `nanoid` 输出的字符范围：读 `urlAlphabet` 常量，值为 64 个互不重复的 URL 安全字符：

```ts
// 与源码逐字符一致
import { urlAlphabet } from '@cat-kit/crypto'

console.log(urlAlphabet)
// => 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
```

关键行为边界（细节见 `packages/crypto/nanoid/apis.md` 的 `## 注意事项`）：

- `nanoid(size)` 与 `random(bytes)` 的尺寸截断为 32 位整数后必须在 0~1024 内，越界抛 `RangeError: Wrong ID size`。
- `nanoid(0)` 返回空字符串 `''`。
- 字母表必须非空：`customAlphabet('', 21)` 会无限循环。
- ID 为概率唯一，不能替代数据库唯一约束。
