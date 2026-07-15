# @cat-kit/crypto

提供安全随机 ID 和随机字节。当前公开 API 不包含摘要、哈希、签名或加解密。

## 如何选择

- 通用随机 ID 使用 `nanoid`。
- 订单号、验证码等受限字符集使用 `customAlphabet`。
- 直接需要安全随机字节时使用 `random`。
- 若任务需要哈希、签名或加密，应使用运行环境的 Web Crypto 或其他明确提供该能力的包。

## 文档

[随机 ID 与随机字节](nanoid.md) 覆盖全部公开运行时 API。

## 边界

浏览器、Node.js 与 Bun 均可使用，但运行时必须提供 `globalThis.crypto.getRandomValues`。生成结果是概率唯一，不是数据库唯一约束的替代品。

精确导出总表见 [generated/crypto/index.d.ts](../../generated/crypto/index.d.ts)。
