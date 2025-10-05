# @cat-kit/crypto

一个功能强大的 TypeScript 加密库，支持浏览器和 Node.js 环境。

## 特性

- 🔐 **生成器模块** - 生成加密安全的随机数和唯一 ID
- 🔒 **对称加密** - AES 加密（支持 CBC/GCM 模式）
- 🔑 **信息摘要** - MD5 哈希算法（支持超大文件）
- 🌐 **同构设计** - 同时支持浏览器和 Node.js
- ⚡ **性能优化** - 自动选择最优实现
- 🎯 **Tree-shakeable** - 支持按需加载

## 安装

```bash
bun add @cat-kit/crypto @cat-kit/core
```

## 使用示例

### 生成器模块

生成加密安全的随机数和唯一 ID：

```typescript
import { nanoid, random } from '@cat-kit/crypto/key-gen'

// 生成唯一 ID
const uid = nanoid(16) // 生成 16 位 ID

// 生成随机字节
const randomBytes = random(32) // 生成 32 字节随机数据
```

### MD5 摘要

计算字符串或文件的 MD5 哈希值：

```typescript
import { md5 } from '@cat-kit/crypto/digest'

// 普通字符串摘要
const hash1 = md5('hello world').hex()
console.log(hash1) // 输出十六进制字符串

// 增量计算（适合大文件）
const hasher = md5.hasher()
hasher.update('hello')
hasher.update(' ')
hasher.update('world')
const hash2 = hasher.finish().hex()

// 也可以输出为 Base64
const hash3 = md5('hello world').base64()
```

#### 大文件 MD5 计算示例

```typescript
import { md5 } from '@cat-kit/crypto/digest'

async function getFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const hasher = md5.hasher()
    const reader = new FileReader()
    const chunkSize = 2 * 1024 * 1024 // 2MB
    let offset = 0

    function readChunk() {
      if (offset >= file.size) {
        resolve(hasher.finish().hex())
        return
      }
      const nextOffset = Math.min(offset + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(offset, nextOffset))
      offset = nextOffset
    }

    reader.onload = e => {
      hasher.update(e.target!.result as ArrayBuffer)
      readChunk()
    }

    reader.onerror = reject
    readChunk()
  })
}
```

### AES 加密

支持 AES-128/192/256 位加密，CBC 和 GCM 模式：

```typescript
import { AES, AES_MODE, AES_PADDING } from '@cat-kit/crypto/symmetric'
import { random } from '@cat-kit/crypto/key-gen'
import { hex2u8a, base642u8a, u8a2str } from '@cat-kit/core'

// 配置加密选项
const key = 'abcdabcdabcdabcd' // 16 字节 = 128 位
// 也可以使用 24 字节（192 位）或 32 字节（256 位）
const iv = random(16) // CBC 模式需要 16 字节 IV

const options = {
  key,
  iv,
  mode: AES_MODE.CBC,
  padding: AES_PADDING.PKCS7
}

// 加密
const cipherText = await AES.encrypt('hello world', options)

// 多种输出格式
const hex = cipherText.toHex()
const base64 = cipherText.toBase64()
const bytes = cipherText.toBytes()

// 解密
const decrypted = await AES.decrypt(cipherText, options)
const text = u8a2str(decrypted)

// 或者直接解密为字符串
const text2 = await AES.decryptToString(cipherText, options)

// 从其他格式解密
const decrypted2 = await AES.decrypt(hex2u8a(hex), options)
const decrypted3 = await AES.decrypt(base642u8a(base64), options)
```

#### GCM 模式（推荐用于需要认证的场景）

```typescript
import { AES, AES_MODE, AES_PADDING } from '@cat-kit/crypto/symmetric'
import { random } from '@cat-kit/crypto/key-gen'

const options = {
  key: 'abcdabcdabcdabcdabcdabcdabcdabcd', // 32 字节 = 256 位
  iv: random(12), // GCM 推荐 12 字节 IV
  mode: AES_MODE.GCM,
  padding: AES_PADDING.None, // GCM 不需要填充
  aad: new Uint8Array([1, 2, 3]) // 可选的附加认证数据
}

const cipherText = await AES.encrypt('sensitive data', options)
const decrypted = await AES.decryptToString(cipherText, options)
```

## 环境支持

### 浏览器

- ✅ **HTTPS 环境**：自动使用 Web Crypto API（性能最优）
- ✅ **HTTP 环境**：自动降级到纯 JavaScript 实现（仅支持 CBC 模式）

### Node.js

- ✅ **Node.js 15+**：使用全局 `crypto.subtle` API

## API 文档

### 生成器 (`@cat-kit/crypto/key-gen`)

- `nanoid(size?: number): string` - 生成 URL 安全的唯一 ID
- `random(bytes: number): Uint8Array` - 生成加密安全的随机字节
- `customAlphabet(alphabet: string, size?: number)` - 使用自定义字符集生成 ID

### 摘要 (`@cat-kit/crypto/digest`)

- `md5(data: DataInput): HashResult` - 计算 MD5 哈希
- `md5.hasher(): MD5Hasher` - 创建增量哈希器
  - `hasher.update(data: DataInput): void` - 更新哈希状态
  - `hasher.finish(): HashResult` - 完成计算并返回结果

### 对称加密 (`@cat-kit/crypto/symmetric`)

- `AES.encrypt(data, options): Promise<CipherResult>` - 加密数据
- `AES.decrypt(data, options): Promise<Uint8Array>` - 解密数据
- `AES.decryptToString(data, options): Promise<string>` - 解密并转为字符串

**加密模式：**

- `AES_MODE.CBC` - 密码块链接模式（广泛支持）
- `AES_MODE.GCM` - 伽罗瓦/计数器模式（带认证，需要 HTTPS）

**填充方式：**

- `AES_PADDING.PKCS7` - PKCS#7 填充（推荐）
- `AES_PADDING.Zero` - 零填充
- `AES_PADDING.None` - 不填充（GCM 模式）

## 安全建议

1. **密钥管理**：不要在代码中硬编码密钥，使用环境变量或密钥管理系统
2. **IV 生成**：每次加密都应使用新的随机 IV
3. **HTTPS**：生产环境建议使用 HTTPS 以获得最佳性能和安全性
4. **GCM 模式**：对于需要认证的场景，优先使用 GCM 模式

## 性能

- 自动选择最优实现（Web Crypto API > 纯 JavaScript）
- 支持增量处理，避免大文件内存溢出
- Tree-shakeable 设计，只打包使用的功能

## 许可证

MIT
