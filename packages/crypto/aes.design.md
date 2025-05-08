# AES 加密

## 使用示例

```ts
import { AES, AES_MODE, AES_PADDING } from '@cat-kit/crypto'

// 密钥，一个长度为16的字节数组或长度为16的16进制字符串
const key = crypto.getRandomValues(new Uint8Array(16))
//  iv，一个长度为16的字节数组或长度为16的16进制字符串
const iv = crypto.getRandomValues(new Uint8Array(16))

const commonOptions = {
  key,
  iv,
  // 加密模式，支持CBC和GCM
  mode: AES_MODE.CBC,
  // 填充，支持PKCS7, Zero, No
  padding: AES_PADDING.PKCS7
}

const message = 'hello world'
const ciphertext = AES.encrypt('hello world', {
  ...commonOptions,
  output: 'hex'
})

AES.decrypt(ciphertext, commonOptions)
```
