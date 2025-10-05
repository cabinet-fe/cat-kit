---
outline: deep
---

<script setup>
import { ref } from 'vue'

const plainText = ref('Hello, CatKit!')
const password = ref('my-secret-password')
const encrypted = ref('')
const decrypted = ref('')
const isEncrypting = ref(false)
const isDecrypting = ref(false)
const error = ref('')

async function doEncrypt() {
  try {
    error.value = ''
    isEncrypting.value = true
    const { encryptAES } = await import('@cat-kit/crypto/symmetric')
    encrypted.value = await encryptAES(plainText.value, password.value)
  } catch (e) {
    error.value = '加密失败: ' + e.message
  } finally {
    isEncrypting.value = false
  }
}

async function doDecrypt() {
  try {
    error.value = ''
    isDecrypting.value = true
    const { decryptAES } = await import('@cat-kit/crypto/symmetric')
    decrypted.value = await decryptAES(encrypted.value, password.value)
  } catch (e) {
    error.value = '解密失败: ' + e.message
  } finally {
    isDecrypting.value = false
  }
}
</script>

# AES 加密

AES (Advanced Encryption Standard) 是一种对称加密算法，支持 AES-256-GCM 和 AES-256-CBC 模式。

## 特性

- ✅ 支持 AES-256-GCM（推荐）
- ✅ 支持 AES-256-CBC
- ✅ 自动密钥派生（PBKDF2）
- ✅ Web Crypto API 加速
- ✅ 纯 JavaScript 回退
- ✅ TypeScript 类型支持

## 在线演示

<Demo title="AES 加密解密">
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">明文:</label>
      <input
        v-model="plainText"
        type="text"
        placeholder="请输入要加密的文本"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">密码:</label>
      <input
        v-model="password"
        type="password"
        placeholder="请输入密码"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <button
        @click="doEncrypt"
        :disabled="isEncrypting || !plainText || !password"
        style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;"
        :style="{ opacity: (isEncrypting || !plainText || !password) ? 0.6 : 1 }"
      >
        {{ isEncrypting ? '加密中...' : '加密' }}
      </button>

      <button
        @click="doDecrypt"
        :disabled="isDecrypting || !encrypted || !password"
        style="padding: 8px 16px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;"
        :style="{ opacity: (isDecrypting || !encrypted || !password) ? 0.6 : 1 }"
      >
        {{ isDecrypting ? '解密中...' : '解密' }}
      </button>
    </div>

    <div v-if="encrypted" style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">加密结果:</label>
      <div style="padding: 8px; background: #f6f6f7; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">
        {{ encrypted }}
      </div>
    </div>

    <div v-if="decrypted" style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">解密结果:</label>
      <div style="padding: 8px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 4px; color: #0c4a6e;">
        {{ decrypted }}
      </div>
    </div>

    <div v-if="error" style="padding: 8px; background: #fee2e2; border: 1px solid #ef4444; border-radius: 4px; color: #991b1b;">
      {{ error }}
    </div>

  </div>
</template>

<template #code>

```typescript
import { encryptAES, decryptAES } from '@cat-kit/crypto/symmetric'

// 加密
const plainText = 'Hello, CatKit!'
const password = 'my-secret-password'

const encrypted = await encryptAES(plainText, password)
console.log('加密结果:', encrypted)

// 解密
const decrypted = await decryptAES(encrypted, password)
console.log('解密结果:', decrypted) // 'Hello, CatKit!'
```

</template>
</Demo>

## 快速开始

### 安装

```bash
bun add @cat-kit/crypto
```

### 基本用法

```typescript
import { encryptAES, decryptAES } from '@cat-kit/crypto/symmetric/aes'

// 加密
const encrypted = await encryptAES('敏感数据', '密码123')

// 解密
const decrypted = await decryptAES(encrypted, '密码123')
console.log(decrypted) // '敏感数据'
```

## API 参考

### encryptAES

加密字符串或对象。

#### 类型签名

```typescript
function encryptAES(
  data: string | object,
  password: string,
  options?: AESOptions
): Promise<string>
```

#### 参数

| 参数     | 类型               | 必填 | 说明         |
| -------- | ------------------ | ---- | ------------ |
| data     | `string \| object` | 是   | 要加密的数据 |
| password | `string`           | 是   | 加密密码     |
| options  | `AESOptions`       | 否   | 加密选项     |

#### AESOptions

```typescript
interface AESOptions {
  mode?: 'GCM' | 'CBC' // 加密模式，默认 'GCM'
  pure?: boolean // 是否使用纯 JS 实现，默认 false
}
```

#### 返回值

返回 Base64 编码的加密字符串。

#### 示例

```typescript
// 加密字符串
const encrypted = await encryptAES('Hello', 'password')

// 加密对象
const user = { name: '张三', age: 25 }
const encryptedUser = await encryptAES(user, 'password')

// 指定加密模式
const encrypted2 = await encryptAES('Hello', 'password', {
  mode: 'CBC'
})

// 使用纯 JS 实现
const encrypted3 = await encryptAES('Hello', 'password', {
  pure: true
})
```

### decryptAES

解密字符串。

#### 类型签名

```typescript
function decryptAES<T = string>(
  encrypted: string,
  password: string,
  options?: AESOptions
): Promise<T>
```

#### 参数

| 参数      | 类型         | 必填 | 说明           |
| --------- | ------------ | ---- | -------------- |
| encrypted | `string`     | 是   | 加密后的字符串 |
| password  | `string`     | 是   | 解密密码       |
| options   | `AESOptions` | 否   | 解密选项       |

#### 返回值

返回解密后的数据，类型由泛型参数指定。

#### 示例

```typescript
// 解密为字符串
const text = await decryptAES(encrypted, 'password')

// 解密为对象
interface User {
  name: string
  age: number
}
const user = await decryptAES<User>(encryptedUser, 'password')
console.log(user.name) // '张三'

// 指定解密模式
const text2 = await decryptAES(encrypted, 'password', {
  mode: 'CBC'
})
```

## 加密模式

### GCM 模式（推荐）

GCM (Galois/Counter Mode) 是一种认证加密模式，提供机密性和完整性保护。

**优点**：

- ✅ 提供数据完整性验证
- ✅ 防止篡改攻击
- ✅ 性能更好
- ✅ 更安全

```typescript
// 默认使用 GCM 模式
const encrypted = await encryptAES(data, password)

// 显式指定
const encrypted2 = await encryptAES(data, password, { mode: 'GCM' })
```

### CBC 模式

CBC (Cipher Block Chaining) 是传统的分组密码模式。

**适用场景**：

- 需要兼容旧系统
- 对接使用 CBC 的第三方服务

```typescript
const encrypted = await encryptAES(data, password, { mode: 'CBC' })
const decrypted = await decryptAES(encrypted, password, { mode: 'CBC' })
```

## 实现方式

### Web Crypto API（默认）

在浏览器中，默认使用 Web Crypto API 进行硬件加速。

**优点**：

- ⚡ 性能优秀（硬件加速）
- 🔒 更安全（浏览器原生实现）
- 📦 体积小

```typescript
// 自动使用 Web Crypto API（如果可用）
const encrypted = await encryptAES(data, password)
```

### 纯 JavaScript 实现

在 Node.js 或不支持 Web Crypto API 的环境中自动回退。

```typescript
// 强制使用纯 JS 实现
const encrypted = await encryptAES(data, password, { pure: true })
```

## 安全最佳实践

### 1. 使用强密码

```typescript
// ❌ 不安全：弱密码
const weak = await encryptAES(data, '123456')

// ✅ 安全：强密码
const strong = await encryptAES(data, 'aB3$xY9@mK2#pL7!')

// ✅ 更好：从安全来源获取密钥
const key = process.env.ENCRYPTION_KEY
const encrypted = await encryptAES(data, key)
```

### 2. 不要硬编码密码

```typescript
// ❌ 不要这样做
const password = 'my-secret-key'
const encrypted = await encryptAES(data, password)

// ✅ 从环境变量读取
const password = import.meta.env.VITE_ENCRYPTION_KEY
const encrypted = await encryptAES(data, password)
```

### 3. 错误处理

```typescript
try {
  const decrypted = await decryptAES(encrypted, password)
  // 使用解密后的数据
} catch (error) {
  if (error.message.includes('MAC verification failed')) {
    // 密码错误或数据被篡改
    console.error('解密失败：密码错误或数据已损坏')
  } else {
    console.error('解密失败:', error)
  }
}
```

### 4. 密码存储

```typescript
import { sha256 } from '@cat-kit/crypto/digest/sha256'

// 密码加盐哈希存储
const passwordHash = sha256(password + 'random-salt')

// 加密数据时使用原始密码
const encrypted = await encryptAES(sensitiveData, password)
```

## 使用场景

### 1. 敏感数据存储

```typescript
// 加密后存储到 localStorage
const userData = { token: 'xxx', userId: 123 }
const encrypted = await encryptAES(userData, userPassword)
localStorage.setItem('userData', encrypted)

// 读取并解密
const stored = localStorage.getItem('userData')
const decrypted = await decryptAES<typeof userData>(stored, userPassword)
```

### 2. API 数据传输

```typescript
// 加密请求数据
const requestData = { creditCard: '1234-5678-9012-3456' }
const encrypted = await encryptAES(requestData, apiSecret)

await fetch('/api/payment', {
  method: 'POST',
  body: JSON.stringify({ data: encrypted })
})

// 解密响应数据
const response = await fetch('/api/sensitive').then(r => r.json())
const decrypted = await decryptAES(response.data, apiSecret)
```

### 3. 文件加密

```typescript
// 读取文件内容
const fileContent = await file.text()

// 加密
const encrypted = await encryptAES(fileContent, password)

// 保存加密后的文件
const blob = new Blob([encrypted], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
// 下载或保存...
```

## 性能考虑

### 大数据加密

对于大量数据，考虑分块处理：

```typescript
import { chunk } from '@cat-kit/core'
import { parallel } from '@cat-kit/core'

async function encryptLargeData(data: string[], password: string) {
  const chunks = chunk(data, 100)

  return await parallel(
    chunks,
    async chunk => {
      return await Promise.all(chunk.map(item => encryptAES(item, password)))
    },
    { concurrency: 3 }
  )
}
```

### 缓存密钥

对于频繁加密操作，考虑复用派生密钥：

```typescript
// 不推荐：每次都派生密钥
for (const item of items) {
  await encryptAES(item, password) // 每次都执行 PBKDF2
}

// 推荐：批量处理
const encrypted = await Promise.all(
  items.map(item => encryptAES(item, password))
)
```

## 常见问题

### 解密失败

**问题**：解密时抛出 `MAC verification failed` 错误。

**原因**：

1. 密码错误
2. 加密数据被篡改
3. 加密和解密使用了不同的模式

**解决**：

```typescript
try {
  const decrypted = await decryptAES(encrypted, password, {
    mode: 'GCM' // 确保与加密时使用相同的模式
  })
} catch (error) {
  console.error('解密失败，请检查密码和数据完整性')
}
```

### 跨环境兼容

**问题**：在不同环境中加密的数据无法互相解密。

**解决**：确保使用相同的选项：

```typescript
// 所有环境使用相同的选项
const options = {
  mode: 'GCM' as const,
  pure: false
}

const encrypted = await encryptAES(data, password, options)
const decrypted = await decryptAES(encrypted, password, options)
```

## 相关 API

- [MD5 哈希](/crypto/digest/md5) - 计算 MD5 摘要
- [SHA256 哈希](/crypto/digest/sha256) - 计算 SHA256 摘要
- [NanoID](/crypto/key-gen/nanoid) - 生成唯一 ID
