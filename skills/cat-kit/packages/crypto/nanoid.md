# crypto — 随机 ID

## 何时使用

- 生成默认 URL 安全随机 ID。
- 生成只含指定字符的订单号、邀请码或短码。
- 获取由运行时加密随机源提供的字节。

## 推荐公开 API

- `nanoid(size?)`：默认长度 `21` 的 URL 安全 ID。
- `customAlphabet(alphabet, size?)`：创建自定义字符集生成器。
- `random(bytes)`：返回安全随机 `Uint8Array`。
- `customRandom(alphabet, defaultSize, getRandom)`：接入自定义随机字节来源。
- `urlAlphabet`：`nanoid` 使用的默认字符集。

## 最小示例

```ts
import { customAlphabet, nanoid } from '@cat-kit/crypto'

const id = nanoid()
const createOrderCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)
const orderCode = createOrderCode()
console.log(id, orderCode)
```

## 约束与边界

- 运行时必须提供 `globalThis.crypto.getRandomValues`，否则默认随机函数会抛错。
- `nanoid` 的 `size` 和 `random` 的 `bytes` 应传非负整数；负数或大于 `1024` 会抛出 `RangeError`。Web Crypto 还限制单次随机填充，大尺寸请求可能更早失败，常规 ID 不应接近该上限。
- `customAlphabet` 和 `customRandom` 的字符集长度应为 `1` 到 `256`；空字符集或过长字符集无法生成有效结果，字符重复会改变各字符出现概率。
- `customRandom` 的安全性完全取决于传入的 `getRandom`；安全标识不要使用 `Math.random`。
- `random` 的返回值可能与后续结果共享底层存储；需要长期保留且不受后续调用影响时，用 `new Uint8Array(random(bytes))` 复制。
- 生成值只提供随机碰撞概率，不保证业务唯一性。需要强唯一约束时仍应由持久化层校验。
- 本包当前不提供摘要、哈希、签名或加解密 API。

## 精确类型入口

[随机 ID 声明](../../generated/crypto/nanoid.d.ts)
