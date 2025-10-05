---
outline: deep
---

<script setup>
import { ref } from 'vue'

const inputText = ref('Hello, CatKit!')
const hashResult = ref('')

async function calculateHash() {
  const { md5 } = await import('@cat-kit/crypto/digest/md5')
  hashResult.value = md5(inputText.value)
}
</script>

# MD5

MD5 (Message-Digest Algorithm 5) 是一种广泛使用的哈希函数，可以将任意长度的数据转换为固定长度（128 位）的哈希值。

::: warning 安全性提示
MD5 已不再被认为是安全的加密哈希函数。请不要使用 MD5 进行密码存储或安全敏感的场景。
对于安全需求，请使用 [SHA256](/crypto/digest/sha256)。
:::

## 在线演示

<Demo title="MD5 哈希计算">
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">输入文本:</label>
      <textarea
        v-model="inputText"
        rows="3"
        placeholder="请输入要计算哈希的文本"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: monospace; resize: vertical;"
      />
    </div>

    <button
      @click="calculateHash"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      计算 MD5
    </button>

    <div v-if="hashResult" style="margin-top: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">MD5 值:</label>
      <div style="padding: 12px; background: #f6f6f7; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px; color: #5f67ee; font-weight: 600;">
        {{ hashResult }}
      </div>
    </div>

  </div>
</template>

<template #code>

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

const text = 'Hello, CatKit!'
const hash = md5(text)
console.log(hash) // '5d41402abc4b2a76b9719d911017c592' (示例)
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
import { md5 } from '@cat-kit/crypto/digest/md5'

// 计算字符串的 MD5
const hash = md5('Hello, World!')
console.log(hash) // '65a8e27d8879283831b664bd8b7f0ad4'

// 计算空字符串的 MD5
const emptyHash = md5('')
console.log(emptyHash) // 'd41d8cd98f00b204e9800998ecf8427e'
```

## API 参考

### md5

计算字符串的 MD5 哈希值。

#### 类型签名

```typescript
function md5(message: string): string
```

#### 参数

| 参数    | 类型     | 说明               |
| ------- | -------- | ------------------ |
| message | `string` | 要计算哈希的字符串 |

#### 返回值

返回 32 字符的十六进制 MD5 哈希值。

#### 示例

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

// 基本用法
console.log(md5('hello'))
// '5d41402abc4b2a76b9719d911017c592'

// 中文支持
console.log(md5('你好，世界'))
// 输出对应的 MD5 值

// 特殊字符
console.log(md5('!@#$%^&*()'))
// 输出对应的 MD5 值
```

## 使用场景

### 1. 文件完整性校验

MD5 最常用于验证文件完整性：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

async function verifyFile(file: File, expectedHash: string) {
  const content = await file.text()
  const actualHash = md5(content)

  if (actualHash === expectedHash) {
    console.log('✅ 文件完整，未被篡改')
    return true
  } else {
    console.error('❌ 文件已损坏或被篡改')
    return false
  }
}

// 使用示例
const file = new File(['content'], 'data.txt')
await verifyFile(file, '5d41402abc4b2a76b9719d911017c592')
```

### 2. 生成唯一标识

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

// 生成内容指纹
function generateFingerprint(content: object): string {
  const json = JSON.stringify(content)
  return md5(json)
}

const user = { id: 1, name: '张三', email: 'zhang@example.com' }
const fingerprint = generateFingerprint(user)
console.log(fingerprint) // 用于缓存键、去重等
```

### 3. 缓存键生成

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

class Cache {
  private store = new Map<string, any>()

  getCacheKey(params: object): string {
    return md5(JSON.stringify(params))
  }

  get(params: object) {
    const key = this.getCacheKey(params)
    return this.store.get(key)
  }

  set(params: object, value: any) {
    const key = this.getCacheKey(params)
    this.store.set(key, value)
  }
}

// 使用示例
const cache = new Cache()
cache.set({ page: 1, size: 10 }, { data: [...] })
const cached = cache.get({ page: 1, size: 10 })
```

### 4. 图片 URL 去重

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

async function deduplicateImages(urls: string[]) {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const url of urls) {
    // 获取图片内容
    const response = await fetch(url)
    const blob = await response.blob()
    const content = await blob.text()

    // 计算 MD5
    const hash = md5(content)

    if (!seen.has(hash)) {
      seen.add(hash)
      unique.push(url)
    }
  }

  return unique
}
```

### 5. ETag 生成

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

// 为资源生成 ETag
function generateETag(content: string): string {
  return `"${md5(content)}"`
}

// 使用在 HTTP 响应中
const content = 'file content'
const etag = generateETag(content)

// 在响应头中设置
response.headers.set('ETag', etag)
```

## MD5 的特性

### 确定性

相同输入总是产生相同输出：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

console.log(md5('hello') === md5('hello')) // true
console.log(md5('hello') === md5('Hello')) // false（大小写敏感）
```

### 固定长度

无论输入多长，输出总是 32 字符：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

console.log(md5('a').length) // 32
console.log(md5('a'.repeat(1000)).length) // 32
```

### 雪崩效应

输入的微小变化会导致输出完全不同：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

console.log(md5('hello'))
// 5d41402abc4b2a76b9719d911017c592

console.log(md5('Hello'))
// 8b1a9953c4611296a827abf8c47804d7

// 完全不同！
```

## 安全考虑

### ❌ 不要用于密码存储

```typescript
// ❌ 错误：直接 MD5 存储密码
const passwordHash = md5(userPassword)
// 容易被彩虹表攻击

// ✅ 正确：使用 SHA256 + 盐值
import { sha256 } from '@cat-kit/crypto/digest/sha256'
const salt = 'random-salt-' + userId
const passwordHash = sha256(userPassword + salt)
```

### ❌ 不要用于签名验证

```typescript
// ❌ 错误：使用 MD5 验证数据完整性（安全敏感场景）
const signature = md5(data + secret)

// ✅ 正确：使用 HMAC-SHA256
import { sha256 } from '@cat-kit/crypto/digest/sha256'
const signature = sha256(data + secret)
```

### ✅ 可以用于非安全场景

```typescript
// ✅ 文件完整性校验（非安全关键）
const fileHash = md5(fileContent)

// ✅ 缓存键生成
const cacheKey = md5(JSON.stringify(params))

// ✅ 去重标识
const id = md5(content)
```

## 性能考虑

MD5 是一个快速的哈希算法：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

// 对于小字符串，性能非常好
const start = performance.now()
for (let i = 0; i < 10000; i++) {
  md5('hello world')
}
const end = performance.now()
console.log(`10000 次 MD5 计算用时: ${end - start}ms`)
```

### 大文件处理

对于大文件，建议分块处理：

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

async function md5File(file: File) {
  const chunkSize = 1024 * 1024 // 1MB
  let offset = 0
  let combined = ''

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    const text = await chunk.text()
    combined += text
    offset += chunkSize
  }

  return md5(combined)
}
```

## 常见哈希值

一些常见字符串的 MD5 值：

| 字符串     | MD5                                |
| ---------- | ---------------------------------- |
| (空字符串) | `d41d8cd98f00b204e9800998ecf8427e` |
| `a`        | `0cc175b9c0f1b6a831c399e269772661` |
| `abc`      | `900150983cd24fb0d6963f7d28e17f72` |
| `hello`    | `5d41402abc4b2a76b9719d911017c592` |
| `password` | `5f4dcc3b5aa765d61d8327deb882cf99` |

## 与其他哈希算法比较

| 特性     | MD5              | SHA256           |
| -------- | ---------------- | ---------------- |
| 输出长度 | 128 位 (32 字符) | 256 位 (64 字符) |
| 安全性   | ⚠️ 已不安全      | ✅ 安全          |
| 速度     | ⚡ 很快          | 🐢 较慢          |
| 适用场景 | 文件校验、去重   | 密码存储、签名   |
| 碰撞风险 | ⚠️ 高            | ✅ 低            |

## 相关 API

- [SHA256](/crypto/digest/sha256) - 更安全的哈希算法
- [AES 加密](/crypto/symmetric/aes) - 对称加密
- [NanoID](/crypto/key-gen/nanoid) - 唯一 ID 生成

## 参考资料

- [MD5 - 维基百科](https://zh.wikipedia.org/wiki/MD5)
- [RFC 1321 - The MD5 Message-Digest Algorithm](https://www.ietf.org/rfc/rfc1321.txt)
