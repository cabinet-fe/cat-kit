# 存储

## 介绍

本页介绍 `@cat-kit/fe` 的浏览器存储能力，覆盖 `WebStorage`、`cookie` 与 `IDB`。

## 快速使用

```typescript
import { WebStorage, storageKey, cookie, IDB } from '@cat-kit/fe'

const TOKEN = storageKey<string>('token')
const local = new WebStorage(localStorage)
local.set(TOKEN, 'abc')

cookie.set('theme', 'dark')

const users = IDB.defineStore('users', {
  id: { type: Number, primary: true },
  name: { type: String, required: true }
})
const db = new IDB('app-db', { version: 1, stores: [users] })
await db.ready
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## WebStorage

对 LocalStorage 和 SessionStorage 的类型安全封装，支持过期时间和变更监听。

### 示例

::: demo fe/storage/basic.vue
:::

### 类型安全的键

使用 `storageKey` 创建类型安全的存储键：

```typescript
interface User {
  id: number
  name: string
}

// 定义类型安全的键
const USER_KEY = storageKey<User>('user')
const TOKEN_KEY = storageKey<string>('token')

// 初始化
const session = new WebStorage(sessionStorage)

// 设置时会进行类型检查
session.set(USER_KEY, { id: 1, name: 'admin' })
session.set(TOKEN_KEY, 'abc123')

// 获取时也有类型提示
const user = session.get(USER_KEY)
const token = session.get(TOKEN_KEY)
```

### 过期时间

```typescript
import { WebStorage } from '@cat-kit/fe'

const local = new WebStorage(localStorage)

// 设置 10 分钟过期
local.set('otp', '123456', 10 * 60)

// 获取过期时间戳
const expireTime = local.getExpire('otp')
console.log(new Date(expireTime)) // 过期时间

// 过期后获取会返回 null
setTimeout(() => {
  const otp = local.get('otp') // null
}, 10 * 60 * 1000)
```

### 变更监听

```typescript
import { WebStorage } from '@cat-kit/fe'

const local = new WebStorage(localStorage)

// 监听某个键的变更
local.on('token', (key, value, temp) => {
  console.log('Token 已更新:', value)
  console.log('过期时间:', temp?.exp)
})

// 更新会触发监听
local.set('token', 'new-token', 3600)
```

### SessionStorage

使用方式与 LocalStorage 完全相同，只需传入 `sessionStorage`：

```typescript
import { WebStorage } from '@cat-kit/fe'

const session = new WebStorage(sessionStorage)

session.set('temp', 'data')
const temp = session.get('temp')
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
cookie.set('temp', 'value', {
  expires: new Date('2025-12-31')
})

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
cookie.remove('token', {
  domain: '.example.com',
  path: '/'
})

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

## IndexedDB

强大的 IndexedDB 封装，提供类似 ORM 的使用体验。

### 定义数据库

```typescript
import { IDB } from '@cat-kit/fe'

const userStore = IDB.defineStore('users', {
  id: { type: Number, primary: true, autoIncrement: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, default: 18 }
})

const db = new IDB('myapp', {
  version: 1,
  stores: [userStore]
})

await db.ready
```

### CRUD 操作

```typescript
// 添加数据
const id = await userStore.add({ name: 'Alice', email: 'alice@example.com' })

// 查询单条 / 多条
const one = await userStore.find({ id })
const many = await userStore.findMany({ age: 18 })

// 按 key 更新 / 替换
await userStore.update(id, { age: 26 })
await userStore.put(id, {
  id,
  name: 'Alice Updated',
  email: 'alice@example.com',
  age: 26
})

// 删除
await userStore.delete({ id })
await userStore.deleteMany({ age: 18 })

// 统计与清空
const total = await userStore.count()
await userStore.clear()

console.log(one, many, total)
```

### 生命周期

```typescript
// 关闭连接
db.close()

// 删除整个数据库
await IDB.deleteDatabase('myapp')
```

## API详解

### WebStorage

- `set<T>(key: StorageKey<T>, value: T, exp?: number): WebStorage` - 设置数据
- `get<T>(key: StorageKey<T>): T | null` - 获取数据
- `get<T>(key: StorageKey<T>, defaultValue: T): T` - 获取数据（带默认值）
- `get<T>(keys: StorageKey<any>[]): any[]` - 批量获取
- `getExpire(key: StorageKey<any>): number` - 获取过期时间戳
- `remove(key?: StorageKey<any> | StorageKey<any>[]): WebStorage` - 删除数据
- `on(key: string, callback: Callback): void` - 监听变更

### Cookie

- `set(key: string, value: string, options?: CookieOptions): void` - 设置
- `get(key: string): string | null` - 获取
- `remove(key: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void` - 删除
- `has(key: string): boolean` - 检查存在
- `getAll(): Record<string, string>` - 获取所有
- `clear(): void` - 清空所有

### Store (IndexedDB)

- `add(data): Promise<IDBValidKey>` - 添加一条数据
- `find(query): Promise<any>` - 查询单条数据
- `findMany(query): Promise<any[]>` - 查询多条数据
- `update(key, data): Promise<boolean>` - 按 key 更新字段
- `put(key, data): Promise<boolean>` - 按 key 替换整条
- `delete(query): Promise<boolean>` - 删除单条匹配数据
- `deleteMany(query): Promise<number>` - 删除多条匹配数据
- `clear(): Promise<boolean>` - 清空 Store
- `count(): Promise<number>` - 获取数量
