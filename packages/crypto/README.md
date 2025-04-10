# @cat-kit/crypto

一个简单易用的加密库，提供 AES 加密和 MD5 哈希功能。

## 特性

- 支持 AES 加密（GCM 和 CBC 模式）
- 支持 MD5 哈希
- 支持浏览器和 Node.js 环境
- 简单易用的 API
- 完全类型化

## 安装

```bash
bun add @cat-kit/crypto
```

## 使用方法

### AES 加密

```typescript
import { AES, AESMode } from '@cat-kit/crypto'

// 创建AES实例，默认使用GCM模式
const aes = new AES()

// 或者指定使用CBC模式
const aesCBC = new AES({ mode: AESMode.CBC() })

// 加密数据
const encrypted = await aes.encode('Hello, World!', {
  key: 'your-secret-key',
  iv: 'your-iv-vector',
  output: 'hex' // 或 'buffer'
})

// 解密数据
const decrypted = await aes.decode(encrypted, {
  key: 'your-secret-key',
  iv: 'your-iv-vector'
})

console.log(decrypted) // 'Hello, World!'
```

#### AES 模式

支持两种加密模式：

- **GCM 模式**：提供认证加密，推荐用于大多数场景

  ```typescript
  const aes = new AES({ mode: AESMode.GCM() })
  ```

- **CBC 模式**：经典的分组密码模式，需要填充
  ```typescript
  const aes = new AES({ mode: AESMode.CBC() })
  ```

### MD5 哈希

```typescript
import { MD5 } from '@cat-kit/crypto'

// 创建MD5实例
const md5 = new MD5()

// 计算字符串的哈希值
const hash = md5.hash('Hello, World!')
console.log(hash) // 字符串哈希值

// 计算文件的哈希值
const fileHash = await md5.hashFile('path/to/file')
console.log(fileHash) // 文件哈希值
```

## 环境要求

- 在浏览器环境中，Web Crypto API 仅在 HTTPS 环境下可用
- 在 Node.js 环境中，需要 Node.js 16.0.0 或更高版本

## 许可证

MIT
