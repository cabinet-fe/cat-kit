# 存储

## 介绍

本页介绍 `@cat-kit/fe` 的浏览器存储能力，覆盖 `storage` 与 `cookie`。

## 快速使用

```typescript
import { storage, storageKey, cookie } from '@cat-kit/fe'

const TOKEN = storageKey<string>('token')
storage.local.set(TOKEN, 'abc')

cookie.set('theme', 'dark')
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## storage

预创建的 `localStorage` 和 `sessionStorage` 封装对象，支持类型安全的键、过期时间和变更监听。

### 示例

::: demo fe/storage/basic.vue
:::

### 类型安全的键

使用 `storageKey` 创建类型安全的存储键：

```typescript
import { storage, storageKey } from '@cat-kit/fe'

interface User {
  id: number
  name: string
}

// 定义类型安全的键
const USER_KEY = storageKey<User>('user')
const TOKEN_KEY = storageKey<string>('token')

// 设置时会进行类型检查
storage.session.set(USER_KEY, { id: 1, name: 'admin' })
storage.session.set(TOKEN_KEY, 'abc123')

// 获取时也有类型提示
const user = storage.session.get(USER_KEY)
const token = storage.session.get(TOKEN_KEY)
```

### 过期时间

```typescript
import { storage, storageKey } from '@cat-kit/fe'

const OTP = storageKey<string>('otp')

// 设置 10 分钟过期
storage.local.set(OTP, '123456', 10 * 60)

// 获取过期时间戳
const expireTime = storage.local.getExpire(OTP)
console.log(new Date(expireTime)) // 过期时间

// 过期后获取会返回 null
setTimeout(
  () => {
    const otp = storage.local.get(OTP) // null
  },
  10 * 60 * 1000
)
```

### 变更监听

```typescript
import { storage } from '@cat-kit/fe'

// 监听某个键的变更
storage.local.on('token', (key, value, temp) => {
  console.log('Token 已更新:', value)
  console.log('过期时间:', temp?.exp)
})

// 更新会触发监听
storage.local.set('token', 'new-token', 3600)
```

### SessionStorage

使用 `storage.session` 操作 SessionStorage：

```typescript
import { storage } from '@cat-kit/fe'

storage.session.set('temp', 'data')
const temp = storage.session.get('temp')
```

## Cookie

简单易用的 Cookie 操作工具。

### 基本用法

```typescript
import { cookie } from '@cat-kit/fe'

// 设置 Cookie（默认会话级别）
cookie.set('session_id', 'abc123')

// 设置带选项的 Cookie
cookie.set('token', 'xyz789', {
  expires: 7 * 24 * 3600, // 7天后过期（秒）
  path: '/',
  domain: '.example.com',
  secure: true,
  sameSite: 'Strict'
})

// 使用 Date 对象设置过期时间
cookie.set('temp', 'value', { expires: new Date('2025-12-31') })

// 获取 Cookie
const sessionId = cookie.get('session_id')
const token = cookie.get('token')

// 检查是否存在
if (cookie.has('token')) {
  console.log('已登录')
}

// 删除 Cookie
cookie.remove('token')

// 删除指定域名和路径的 Cookie
cookie.remove('token', { domain: '.example.com', path: '/' })

// 获取所有 Cookie
const allCookies = cookie.getAll()
console.log(allCookies) // { session_id: 'abc123', ... }

// 清空所有 Cookie
cookie.clear()
```

### Cookie 选项

```typescript
interface CookieOptions {
  /** 过期时间（秒数或 Date 对象） */
  expires?: number | Date
  /** Cookie 路径 */
  path?: string
  /** Cookie 域名 */
  domain?: string
  /** 是否仅 HTTPS 传输 */
  secure?: boolean
  /** 同站策略 */
  sameSite?: 'Strict' | 'Lax' | 'None'
}
```

## API详解

### storage

`storage` 对象包含两个属性：

- `storage.local` — 基于 `localStorage` 的存储实例
- `storage.session` — 基于 `sessionStorage` 的存储实例

两者共享相同的 API：

- `set<T>(key: StorageKey<T>, value: T, exp?: number)` - 设置数据（exp 为过期秒数，0 表示永不过期）
- `get<T>(key: StorageKey<T>): T | null` - 获取数据
- `get<T>(key: StorageKey<T>, defaultValue: T): T` - 获取数据（带默认值）
- `get<T>(keys: StorageKey<any>[]): any[]` - 批量获取
- `getExpire(key: StorageKey<any>): number` - 获取过期时间戳
- `remove(key?: StorageKey<any> | StorageKey<any>[])` - 删除数据
- `on(key: string, callback: Callback): void` - 监听变更
- `off(key?: string | string[]): void` - 移除监听

### Cookie

- `set(key: string, value: string, options?: CookieOptions): void` - 设置
- `get(key: string): string | null` - 获取
- `remove(key: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void` - 删除
- `has(key: string): boolean` - 检查存在
- `getAll(): Record<string, string>` - 获取所有
- `clear(): void` - 清空所有
