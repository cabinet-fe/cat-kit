# NanoID

NanoID 是一个小巧、安全、URL 友好的唯一 ID 生成器。

## 特性

- ✅ 小巧（约 100 字节）
- ✅ 安全（使用加密安全的随机 API）
- ✅ URL 安全（不包含特殊字符）
- ✅ 可自定义长度和字母表
- ✅ 碰撞概率极低
- ✅ 比 UUID 更短更快

## 快速开始

### 安装

```bash
bun add @cat-kit/crypto
```

### 基本用法

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

// 生成 ID（默认 21 字符）
const id = nanoid()
console.log(id) // 'V1StGXR8_Z5jdHi6B-myT'

// 自定义长度
const shortId = nanoid(10)
console.log(shortId) // 'IRFa-VaY2b'

// 自定义字母表
import { customAlphabet } from '@cat-kit/crypto/key-gen'
const nanoid = customAlphabet('0123456789', 6)
console.log(nanoid()) // '391048'
```

## API 参考

### nanoid

生成默认长度的 ID。

#### 类型签名

```typescript
function nanoid(size?: number): string
```

#### 参数

| 参数 | 类型     | 默认值 | 说明    |
| ---- | -------- | ------ | ------- |
| size | `number` | `21`   | ID 长度 |

#### 返回值

返回指定长度的随机 ID 字符串。

#### 示例

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

// 默认长度（21）
const id1 = nanoid()
console.log(id1) // 'V1StGXR8_Z5jdHi6B-myT'

// 自定义长度
const id2 = nanoid(10)
console.log(id2) // 'IRFa-VaY2b'

const id3 = nanoid(32)
console.log(id3) // '4cBvWvNM3X3-7Gq7wR2jF1aP5Dk9v8Zy'
```

### customAlphabet

创建自定义字母表的 NanoID 生成器。

#### 类型签名

```typescript
function customAlphabet(
  alphabet: string,
  defaultSize?: number
): (size?: number) => string
```

#### 参数

| 参数        | 类型     | 默认值 | 说明         |
| ----------- | -------- | ------ | ------------ |
| alphabet    | `string` | -      | 自定义字符集 |
| defaultSize | `number` | `21`   | 默认 ID 长度 |

#### 返回值

返回一个生成器函数。

#### 示例

```typescript
import { customAlphabet } from '@cat-kit/crypto/key-gen'

// 只使用数字
const nanoid = customAlphabet('0123456789', 6)
console.log(nanoid()) // '391048'

// 使用小写字母
const lowerId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)
console.log(lowerId()) // 'kzrmxjqhge'

// 使用自定义字符
const customId = customAlphabet('ABCDEF0123456789', 8)
console.log(customId()) // 'A3F0D125'
```

## 使用场景

### 1. 数据库主键

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

interface User {
  id: string
  name: string
  email: string
}

function createUser(name: string, email: string): User {
  return {
    id: nanoid(), // 自动生成唯一 ID
    name,
    email
  }
}

// 使用
const user = createUser('张三', 'zhang@example.com')
console.log(user.id) // 'V1StGXR8_Z5jdHi6B-myT'
```

### 2. 短链接生成

```typescript
import { customAlphabet } from '@cat-kit/crypto/key-gen'

// 创建短链接生成器
const shortCode = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  8
)

function createShortUrl(longUrl: string): string {
  const code = shortCode()
  // 保存映射关系到数据库
  return `https://short.url/${code}`
}

// 使用
const shortUrl = createShortUrl('https://example.com/very/long/url')
console.log(shortUrl) // 'https://short.url/xK9j2pQm'
```

### 3. 文件名生成

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()
  const id = nanoid(10)
  return `${id}.${ext}`
}

// 使用
const filename = generateFileName('photo.jpg')
console.log(filename) // 'IRFa-VaY2b.jpg'
```

### 4. 会话 ID

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

interface Session {
  id: string
  userId: number
  createdAt: Date
  expiresAt: Date
}

function createSession(userId: number): Session {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return {
    id: nanoid(32), // 更长的 ID 增加安全性
    userId,
    createdAt: now,
    expiresAt
  }
}
```

### 5. 订单号生成

```typescript
import { customAlphabet } from '@cat-kit/crypto/key-gen'

// 订单号：日期 + 随机数字
function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('')

  const nanoid = customAlphabet('0123456789', 8)
  return dateStr + nanoid()
}

// 使用
const orderNo = generateOrderNumber()
console.log(orderNo) // '20250105' + '12345678'
```

### 6. 邀请码

```typescript
import { customAlphabet } from '@cat-kit/crypto/key-gen'

// 邀请码：大写字母和数字，排除易混淆字符
const inviteCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8)

function generateInviteCode(): string {
  return inviteCode()
}

// 使用
const code = generateInviteCode()
console.log(code) // 'X3K9P2MN'
```

## 长度建议

选择合适的 ID 长度来平衡唯一性和简洁性：

| 长度 | 每小时生成 1000 个 ID | 用途               |
| ---- | --------------------- | ------------------ |
| 8    | 约 1% 碰撞概率        | 短 URL、临时 ID    |
| 10   | 约 0.1% 碰撞概率      | 文件名、缓存键     |
| 14   | 约 0.001% 碰撞概率    | 会话 ID            |
| 21   | 千年内无碰撞          | 数据库主键（默认） |
| 32   | 极低碰撞概率          | 安全令牌           |

## 性能对比

NanoID vs UUID：

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

// NanoID
console.time('NanoID')
for (let i = 0; i < 100000; i++) {
  nanoid()
}
console.timeEnd('NanoID')

// UUID v4
console.time('UUID')
for (let i = 0; i < 100000; i++) {
  crypto.randomUUID()
}
console.timeEnd('UUID')

// 大小比较
console.log('NanoID:', nanoid().length) // 21 字符
console.log('UUID:', crypto.randomUUID().length) // 36 字符
```

**优势**：

- ✅ NanoID 更短（21 vs 36 字符）
- ✅ NanoID 更快（约 2 倍）
- ✅ NanoID URL 友好（无需编码）

## 安全性

NanoID 使用密码学安全的随机数生成器：

```typescript
// 浏览器环境使用 crypto.getRandomValues()
// Node.js 环境使用 crypto.randomBytes()

// 这使得 NanoID 适合生成：
// ✅ 安全令牌
// ✅ 会话 ID
// ✅ API 密钥
```

### 不要用于密码

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

// ❌ 不要这样做
const password = nanoid(10)

// ✅ 应该使用专门的密码生成器
function generatePassword(length: number = 16): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  // ... 实现密码生成逻辑
}
```

## 自定义字母表示例

### 数字密码

```typescript
import { customAlphabet } from '@cat-kit/crypto/key-gen'

const pinCode = customAlphabet('0123456789', 6)
console.log(pinCode()) // '391048'
```

### 十六进制

```typescript
const hexId = customAlphabet('0123456789ABCDEF', 16)
console.log(hexId()) // 'A3F0D1258E9C4B7F'
```

### 易读字符

```typescript
// 排除易混淆字符：0/O, 1/I/l
const easyRead = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
  12
)
console.log(easyRead()) // 'x3K9p2MnWqRs'
```

### 表情符号

```typescript
const emojiId = customAlphabet('😀😃😄😁😆😅🤣😂', 5)
console.log(emojiId()) // '😀😄😁😃😆'
```

## 碰撞概率计算

NanoID 提供了碰撞概率计算器：

```typescript
// 使用 21 字符，每秒生成 1000 个 ID
// 需要约 45 万年才有 1% 的碰撞概率

// 使用 10 字符，每秒生成 1000 个 ID
// 需要约 4 年才有 1% 的碰撞概率
```

在线计算器：https://zelark.github.io/nano-id-cc/

## 常见问题

### 如何存储 NanoID？

```typescript
// ✅ 推荐：使用 VARCHAR
CREATE TABLE users (
  id VARCHAR(21) PRIMARY KEY,
  name VARCHAR(255)
);

// 也可以使用 CHAR 固定长度
CREATE TABLE sessions (
  id CHAR(32) PRIMARY KEY,
  user_id VARCHAR(21)
);
```

### 如何确保唯一性？

```typescript
import { nanoid } from '@cat-kit/crypto/key-gen'

async function generateUniqueId(checkExists: (id: string) => Promise<boolean>) {
  let id: string
  let attempts = 0
  const maxAttempts = 10

  do {
    id = nanoid()
    attempts++

    if (attempts >= maxAttempts) {
      throw new Error('无法生成唯一 ID')
    }
  } while (await checkExists(id))

  return id
}
```

## 相关 API

- [MD5](/crypto/digest/md5) - 内容哈希
- [SHA256](/crypto/digest/sha256) - 安全哈希
- [AES](/crypto/symmetric/aes) - 数据加密
