---
title: "@cat-kit/crypto 安全随机工具"
description: "cat-kit 的安全随机工具库（当前 1.0.0）：从包根导出 nanoid、customAlphabet、customRandom、random、urlAlphabet，基于 crypto.getRandomValues 生成密码学安全的随机 ID 与随机字节；不含哈希、加密、签名、摘要 API。"
aliases: [crypto 包, cat-kit crypto, 安全随机数, random bytes, 随机 ID 库]
keywords: [nanoid, customAlphabet, customRandom, random, urlAlphabet, getRandomValues, 随机 ID, 短 ID 生成, 自定义字母表, 随机字节, 唯一 ID, 请求 ID, URL 安全]
---

# @cat-kit/crypto 安全随机工具

`@cat-kit/crypto`（当前版本 1.0.0）从包根导出五个符号：`nanoid`、`customAlphabet`、`customRandom`、`random`、`urlAlphabet`，用于生成密码学安全的随机 ID 与随机字节。`nanoid` 部分移植自 nanoid v5.1.11。包内没有哈希、加密、签名、摘要 API；需要这些能力时本包不适用。

## 安装

```bash
# npm
npm install @cat-kit/crypto
# pnpm
pnpm add @cat-kit/crypto
# bun
bun add @cat-kit/crypto
```

导入约束与运行时要求：

```ts
import { nanoid } from '@cat-kit/crypto'

console.log(nanoid().length) // => 21
```

- 只能从包根导入（`'@cat-kit/crypto'`）；包的 `exports` 字段没有子路径，`import from '@cat-kit/crypto/nanoid'` 会导入失败。
- 仅支持 ESM：包为 `"type": "module"`，`exports` 只提供 `import` 条件，没有 `require` 条件；CommonJS 的 `require('@cat-kit/crypto')` 会失败。
- 无副作用：`"sideEffects": false`，未用到的导出可被打包器 tree-shaking 掉。
- 运行环境必须提供 `globalThis.crypto.getRandomValues`（Browser、Node.js、Bun 均满足）。缺失时抛出 `Error: crypto.getRandomValues is not available in this runtime`。

## 模块速查

包内只有一个功能模块，全部导出经包根提供：

| 模块 | 导出 | 用途 | 文档路径 |
| --- | --- | --- | --- |
| nanoid 随机 ID | `nanoid`、`customAlphabet`、`customRandom`、`random`、`urlAlphabet` | 密码学安全的随机 ID 与随机字节 | `packages/crypto/nanoid/index.md` |

五个导出的路由：

| 导出 | 用途 | 文档路径 |
| --- | --- | --- |
| `nanoid` | 生成默认 21 位的 URL 安全随机 ID | `packages/crypto/nanoid/apis.md` |
| `customAlphabet` | 用自定义字母表生成 ID（纯数字验证码、订单号等） | `packages/crypto/nanoid/apis.md` |
| `customRandom` | 用自带随机字节源组装 ID 生成器 | `packages/crypto/nanoid/apis.md` |
| `random` | 取密码学安全随机字节（`Uint8Array`） | `packages/crypto/nanoid/apis.md` |
| `urlAlphabet` | `nanoid` 默认使用的 64 字符字母表常量 | `packages/crypto/nanoid/apis.md` |

按需求选择导出：

- 需要 URL 安全的随机 ID（请求 ID、追踪号、对象键）：用 `nanoid`。
- 需要限定字符集（纯数字验证码、去掉易混字符的兑换码）：用 `customAlphabet`。
- 需要自带随机字节源（可种子化的测试随机数、专用 CSPRNG）：用 `customRandom`。
- 需要原始随机字节（盐、密钥材料、IV）：用 `random`。

### 能力边界

- 本包是随机 ID 与随机字节工具：没有哈希（SHA、MD5）、对称/非对称加密（AES、RSA）、签名、HMAC、摘要 API。
- `nanoid` 生成的是字母表字符串，不是 UUID 的 36 位 `8-4-4-4-12` 格式；本包没有 UUID 生成函数。
- 生成的 ID 为概率唯一，不能替代数据库唯一约束或分布式锁。

### 版本与来源

- 包版本：`1.0.0`（`packages/crypto/package.json`）。
- `nanoid` 模块移植自 nanoid v5.1.11（`index.js`、`index.browser.js`、`url-alphabet/index.js`），来源说明保留在 `packages/crypto/src/nanoid.ts` 文件头。

完整签名、参数默认值、抛错条件见 `packages/crypto/nanoid/apis.md`。
