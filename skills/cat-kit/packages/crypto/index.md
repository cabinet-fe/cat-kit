# @cat-kit/crypto

安全相关工具包，提供浏览器、Node.js 与 Bun 通用的随机 ID 生成能力。当前实现基于 Web Crypto `crypto.getRandomValues`。

## 运行环境

通用（浏览器与 Node.js 均可，运行时需要支持 `crypto.getRandomValues`）。

## API 分类

| 分类    | 文档                       | 说明                                                      |
| ------- | -------------------------- | --------------------------------------------------------- |
| 随机 ID | [nanoid.md](nanoid.md)     | nanoid、customAlphabet、customRandom、random、urlAlphabet |
| 示例    | [examples.md](examples.md) | 常见随机 ID 用法                                          |

## 类型签名

> 详见 `../../generated/crypto/index.d.ts`
