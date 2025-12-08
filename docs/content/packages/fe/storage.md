# 存储

提供了 WebStorage（LocalStorage/SessionStorage）、Cookie 和 IndexedDB 的封装。

## WebStorage

对 LocalStorage 和 SessionStorage 的类型安全封装，支持过期时间和变更监听。

### 示例

::: demo fe/storage/basic.vue
:::

### 类型安全的键

使用 `storageKey` 创建类型安全的存储键：

```ts
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
import { Store, IDB } from '@cat-kit/fe'

// 定义用户表结构
const userStore = new Store('users', {
  id: {
    type: Number,
    primary: true,
    autoIncrement: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 18
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
})

// 定义文章表结构
const postStore = new Store('posts', {
  id: {
    type: Number,
    primary: true,
    autoIncrement: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: Number,
    required: true
  }
})

// 创建数据库实例
const db = new IDB('myapp', {
  version: 1,
  stores: [userStore, postStore]
})

// 连接数据库
await db.connect()
```

### 字段类型定义

```typescript
interface FieldDefinition {
  /** 字段类型 */
  type:
    | StringConstructor
    | NumberConstructor
    | ObjectConstructor
    | ArrayConstructor
    | BooleanConstructor
    | DateConstructor
  /** 是否必填 */
  required?: boolean
  /** 是否为主键 */
  primary?: boolean
  /** 是否自动递增（仅主键有效） */
  autoIncrement?: boolean
  /** 默认值（可以是值或函数） */
  default?: any
}
```

### CRUD 操作

#### 添加数据

```typescript
// 添加单条数据
const userId = await userStore.add({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
})

// 添加多条数据
const userIds = await userStore.addMany([
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
])
```

#### 更新数据

```typescript
// 通过主键更新
await userStore.put({
  id: 1,
  name: 'Alice Updated',
  email: 'alice@example.com',
  age: 26
})

// 更新多条数据
await userStore.putMany([
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 26 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 }
])
```

#### 查询数据

```typescript
// 通过主键获取
const user = await userStore.get(1)

// 通过主键获取多条
const users = await userStore.getMany([1, 2, 3])

// 获取所有数据
const allUsers = await userStore.getAll()

// 条件查询
const adults = await userStore.find({
  age: 25
})

// 获取第一条匹配的数据
const firstAdult = await userStore.findOne({
  age: 25
})
```

#### 删除数据

```typescript
// 通过主键删除
await userStore.delete(1)

// 删除多条数据
await userStore.deleteMany([1, 2, 3])

// 条件删除
await userStore.deleteBy({
  age: 18
})

// 清空表
await userStore.clear()
```

### 高级查询

```typescript
// 获取数据总数
const count = await userStore.count()

// 分页查询（手动实现）
const page = 1
const pageSize = 10
const allUsers = await userStore.getAll()
const pagedUsers = allUsers.slice((page - 1) * pageSize, page * pageSize)
```

### 完整示例

```typescript
import { Store, IDB } from '@cat-kit/fe'

// 定义数据结构
interface User {
  id?: number
  name: string
  email: string
  age?: number
  createdAt?: Date
}

// 创建 Store
const userStore = new Store('users', {
  id: { type: Number, primary: true, autoIncrement: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, default: 18 },
  createdAt: { type: Date, default: () => new Date() }
})

// 创建数据库
const db = new IDB('myapp', {
  version: 1,
  stores: [userStore]
})

// 使用
async function example() {
  // 连接数据库
  await db.connect()

  // 添加用户
  const userId = await userStore.add({
    name: 'Alice',
    email: 'alice@example.com',
    age: 25
  })

  // 查询用户
  const user = await userStore.get(userId)
  console.log(user)

  // 更新用户
  await userStore.put({
    id: userId,
    name: 'Alice Updated',
    email: 'alice@example.com',
    age: 26
  })

  // 删除用户
  await userStore.delete(userId)

  // 关闭数据库
  db.close()
}
```

## API 参考

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

- `add(data: any): Promise<IDBValidKey>` - 添加数据
- `addMany(dataList: any[]): Promise<IDBValidKey[]>` - 批量添加
- `get(key: IDBValidKey): Promise<any>` - 获取数据
- `getMany(keys: IDBValidKey[]): Promise<any[]>` - 批量获取
- `getAll(): Promise<any[]>` - 获取所有
- `find(query: Query): Promise<any[]>` - 条件查询
- `findOne(query: Query): Promise<any | null>` - 查询单条
- `put(data: any): Promise<IDBValidKey>` - 更新数据
- `putMany(dataList: any[]): Promise<IDBValidKey[]>` - 批量更新
- `delete(key: IDBValidKey): Promise<void>` - 删除数据
- `deleteMany(keys: IDBValidKey[]): Promise<void>` - 批量删除
- `deleteBy(query: Query): Promise<void>` - 条件删除
- `clear(): Promise<void>` - 清空表
- `count(): Promise<number>` - 获取总数
