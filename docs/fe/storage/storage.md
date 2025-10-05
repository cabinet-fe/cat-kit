---
outline: deep
---

<script setup>
import { ref, onMounted } from 'vue'

const storageKey = ref('demo-key')
const storageValue = ref('Hello, CatKit!')
const storedData = ref(null)
const allKeys = ref([])

let storage = null

onMounted(async () => {
  const { Storage } = await import('@cat-kit/fe')
  storage = new Storage({ prefix: 'catkit-demo' })
  loadAllKeys()
})

function saveData() {
  try {
    let value = storageValue.value
    // 尝试解析为 JSON
    try {
      value = JSON.parse(value)
    } catch {
      // 保持字符串
    }
    storage.set(storageKey.value, value)
    storedData.value = null
    loadAllKeys()
  } catch (e) {
    console.error(e)
  }
}

function loadData() {
  try {
    const data = storage.get(storageKey.value)
    storedData.value = data
  } catch (e) {
    storedData.value = '未找到数据'
  }
}

function removeData() {
  storage.remove(storageKey.value)
  storedData.value = null
  loadAllKeys()
}

function clearAll() {
  storage.clear()
  storedData.value = null
  loadAllKeys()
}

function loadAllKeys() {
  allKeys.value = storage.keys()
}
</script>

# Storage

Storage 是对浏览器 `localStorage` 和 `sessionStorage` 的增强封装，提供更友好的 API 和类型安全支持。

## 特性

- ✅ 自动 JSON 序列化/反序列化
- ✅ 类型安全
- ✅ 命名空间支持（前缀）
- ✅ TTL 过期时间
- ✅ 批量操作
- ✅ TypeScript 支持

## 在线演示

<Demo title="Storage 操作">
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">键名:</label>
      <input
        v-model="storageKey"
        type="text"
        placeholder="输入键名"
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">值 (支持 JSON):</label>
      <textarea
        v-model="storageValue"
        rows="3"
        placeholder='例如: "文本" 或 {"name": "张三", "age": 25}'
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; resize: vertical;"
      />
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;">
      <button
        @click="saveData"
        style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        保存
      </button>

      <button
        @click="loadData"
        style="padding: 8px 16px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        读取
      </button>

      <button
        @click="removeData"
        style="padding: 8px 16px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        删除
      </button>

      <button
        @click="clearAll"
        style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        清空全部
      </button>
    </div>

    <div v-if="storedData !== null" style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">读取结果:</label>
      <pre style="background: #f6f6f7; padding: 1rem; border-radius: 4px; margin: 0; overflow-x: auto;">{{ JSON.stringify(storedData, null, 2) }}</pre>
    </div>

    <div v-if="allKeys.length > 0">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">所有键 ({{ allKeys.length }}):</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <span
          v-for="key in allKeys"
          :key="key"
          style="padding: 4px 8px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 12px; font-family: monospace;"
        >
          {{ key }}
        </span>
      </div>
    </div>

  </div>
</template>

<template #code>

```typescript
import { Storage } from '@cat-kit/fe'

// 创建实例
const storage = new Storage({ prefix: 'myapp' })

// 保存数据
storage.set('user', { name: '张三', age: 25 })

// 读取数据
const user = storage.get('user')
console.log(user) // { name: '张三', age: 25 }

// 删除数据
storage.remove('user')

// 清空所有
storage.clear()
```

</template>
</Demo>

## 快速开始

### 安装

```bash
bun add @cat-kit/fe
```

### 基本用法

```typescript
import { Storage } from '@cat-kit/fe'

// 创建 Storage 实例
const storage = new Storage({
  prefix: 'myapp', // 键名前缀
  storage: localStorage // 使用 localStorage（默认）
})

// 保存数据（自动序列化）
storage.set('user', {
  id: 1,
  name: '张三',
  preferences: { theme: 'dark' }
})

// 读取数据（自动反序列化）
const user = storage.get('user')
console.log(user.name) // '张三'

// 删除数据
storage.remove('user')

// 清空所有带前缀的数据
storage.clear()
```

## API 参考

### 构造函数

创建 Storage 实例。

#### 类型签名

```typescript
class Storage {
  constructor(options?: StorageOptions)
}
```

#### StorageOptions

```typescript
interface StorageOptions {
  prefix?: string // 键名前缀，默认 ''
  storage?: Storage // 存储对象，默认 localStorage
}
```

#### 示例

```typescript
// 使用 localStorage（默认）
const local = new Storage({ prefix: 'app' })

// 使用 sessionStorage
const session = new Storage({
  prefix: 'temp',
  storage: sessionStorage
})

// 不使用前缀
const plain = new Storage()
```

### set

保存数据到存储。

#### 类型签名

```typescript
set<T>(key: string, value: T, options?: SetOptions): void
```

#### 参数

| 参数    | 类型         | 说明                     |
| ------- | ------------ | ------------------------ |
| key     | `string`     | 键名                     |
| value   | `T`          | 值（任意可序列化的类型） |
| options | `SetOptions` | 可选配置                 |

#### SetOptions

```typescript
interface SetOptions {
  ttl?: number // 过期时间（毫秒）
}
```

#### 示例

```typescript
// 保存字符串
storage.set('name', '张三')

// 保存对象
storage.set('user', {
  id: 1,
  name: '张三',
  roles: ['admin', 'user']
})

// 保存数组
storage.set('items', [1, 2, 3, 4, 5])

// 设置过期时间（1小时）
storage.set('token', 'abc123', { ttl: 3600 * 1000 })

// 设置过期时间（1天）
storage.set('cache', data, { ttl: 24 * 3600 * 1000 })
```

### get

读取存储的数据。

#### 类型签名

```typescript
get<T>(key: string, defaultValue?: T): T | undefined
```

#### 参数

| 参数         | 类型     | 说明                           |
| ------------ | -------- | ------------------------------ |
| key          | `string` | 键名                           |
| defaultValue | `T`      | 默认值（找不到或已过期时返回） |

#### 返回值

返回存储的值，如果不存在或已过期则返回 `defaultValue` 或 `undefined`。

#### 示例

```typescript
// 读取数据
const user = storage.get('user')

// 提供默认值
const theme = storage.get('theme', 'light')

// 类型推断
interface User {
  id: number
  name: string
}

const user = storage.get<User>('user')
if (user) {
  console.log(user.name) // 类型安全
}
```

### remove

删除指定的数据。

#### 类型签名

```typescript
remove(key: string): void
```

#### 参数

| 参数 | 类型     | 说明 |
| ---- | -------- | ---- |
| key  | `string` | 键名 |

#### 示例

```typescript
// 删除单个数据
storage
  .remove('user')

  [
    // 删除多个数据
    ('user', 'token', 'settings')
  ].forEach(key => {
    storage.remove(key)
  })
```

### clear

清空所有带前缀的数据。

#### 类型签名

```typescript
clear(): void
```

#### 示例

```typescript
const storage = new Storage({ prefix: 'myapp' })

storage.set('user', {...})
storage.set('token', '...')
storage.set('settings', {...})

// 清空所有 myapp 前缀的数据
storage.clear()
```

### has

检查键是否存在。

#### 类型签名

```typescript
has(key: string): boolean
```

#### 参数

| 参数 | 类型     | 说明 |
| ---- | -------- | ---- |
| key  | `string` | 键名 |

#### 返回值

如果键存在且未过期返回 `true`，否则返回 `false`。

#### 示例

```typescript
if (storage.has('user')) {
  const user = storage.get('user')
  // ...
}
```

### keys

获取所有键名。

#### 类型签名

```typescript
keys(): string[]
```

#### 返回值

返回所有带前缀的键名数组（不包含前缀）。

#### 示例

```typescript
const storage = new Storage({ prefix: 'app' })

storage.set('user', {...})
storage.set('token', '...')
storage.set('theme', 'dark')

const keys = storage.keys()
console.log(keys) // ['user', 'token', 'theme']
```

## 使用场景

### 1. 用户状态管理

```typescript
import { Storage } from '@cat-kit/fe'

interface UserState {
  id: number
  name: string
  email: string
  avatar?: string
}

class UserStore {
  private storage = new Storage({ prefix: 'user' })

  saveUser(user: UserState) {
    this.storage.set('profile', user)
  }

  getUser(): UserState | null {
    return this.storage.get('profile')
  }

  logout() {
    this.storage.clear()
  }

  isLoggedIn(): boolean {
    return this.storage.has('profile')
  }
}

// 使用
const userStore = new UserStore()
userStore.saveUser({
  id: 1,
  name: '张三',
  email: 'zhang@example.com'
})
```

### 2. 应用配置

```typescript
import { Storage } from '@cat-kit/fe'

interface AppConfig {
  theme: 'light' | 'dark'
  language: 'zh' | 'en'
  fontSize: number
}

const configStorage = new Storage({ prefix: 'config' })

// 默认配置
const defaultConfig: AppConfig = {
  theme: 'light',
  language: 'zh',
  fontSize: 14
}

// 获取配置
export function getConfig(): AppConfig {
  return configStorage.get('app', defaultConfig)
}

// 更新配置
export function updateConfig(config: Partial<AppConfig>) {
  const current = getConfig()
  configStorage.set('app', { ...current, ...config })
}

// 重置配置
export function resetConfig() {
  configStorage.set('app', defaultConfig)
}
```

### 3. 临时会话数据

```typescript
import { Storage } from '@cat-kit/fe'

// 使用 sessionStorage 存储临时数据
const sessionStore = new Storage({
  prefix: 'session',
  storage: sessionStorage
})

// 保存表单草稿（关闭标签页后自动清除）
function saveDraft(formData: any) {
  sessionStore.set('draft', formData)
}

// 恢复表单草稿
function restoreDraft() {
  return sessionStore.get('draft')
}
```

### 4. 缓存管理

```typescript
import { Storage } from '@cat-kit/fe'

class CacheManager {
  private storage = new Storage({ prefix: 'cache' })

  // 缓存 API 响应（5分钟）
  async cacheAPI<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 检查缓存
    const cached = this.storage.get<T>(key)
    if (cached) {
      return cached
    }

    // 获取新数据
    const data = await fetcher()

    // 缓存数据（5分钟）
    this.storage.set(key, data, { ttl: 5 * 60 * 1000 })

    return data
  }

  // 清除过期缓存
  clearExpired() {
    const keys = this.storage.keys()
    keys.forEach(key => {
      // 尝试读取，过期的会自动删除
      this.storage.get(key)
    })
  }
}

// 使用
const cache = new CacheManager()

const users = await cache.cacheAPI('users', async () => {
  const res = await fetch('/api/users')
  return res.json()
})
```

### 5. 购物车

```typescript
import { Storage } from '@cat-kit/fe'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

class ShoppingCart {
  private storage = new Storage({ prefix: 'cart' })

  addItem(item: CartItem) {
    const items = this.getItems()
    const existing = items.find(i => i.id === item.id)

    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.push(item)
    }

    this.storage.set('items', items)
  }

  removeItem(id: number) {
    const items = this.getItems().filter(i => i.id !== id)
    this.storage.set('items', items)
  }

  getItems(): CartItem[] {
    return this.storage.get('items', [])
  }

  getTotal(): number {
    return this.getItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }

  clear() {
    this.storage.remove('items')
  }
}
```

## TTL 过期机制

Storage 支持为数据设置过期时间：

```typescript
// 保存 token，1小时后过期
storage.set('token', 'abc123', { ttl: 3600 * 1000 })

// 读取时自动检查过期
const token = storage.get('token')
if (token) {
  // token 还未过期
} else {
  // token 已过期或不存在
}
```

### 过期检查时机

- 调用 `get()` 时自动检查
- 调用 `has()` 时自动检查
- 过期的数据会被自动删除

## 命名空间

使用前缀避免键名冲突：

```typescript
// 用户模块
const userStorage = new Storage({ prefix: 'user' })
userStorage.set('settings', {...})

// 应用模块
const appStorage = new Storage({ prefix: 'app' })
appStorage.set('settings', {...})

// 实际存储的键名：
// 'user:settings'
// 'app:settings'
```

## 类型安全

充分利用 TypeScript 的类型系统：

```typescript
interface Settings {
  theme: 'light' | 'dark'
  notifications: boolean
}

const storage = new Storage({ prefix: 'app' })

// 写入时类型检查
const settings: Settings = {
  theme: 'dark',
  notifications: true
}
storage.set('settings', settings)

// 读取时类型推断
const saved = storage.get<Settings>('settings')
if (saved) {
  console.log(saved.theme) // ✅ 类型安全
}
```

## 存储限制

浏览器存储有容量限制：

| 存储类型       | 容量限制       |
| -------------- | -------------- |
| localStorage   | 约 5-10 MB     |
| sessionStorage | 约 5-10 MB     |
| IndexedDB      | 取决于磁盘空间 |

### 处理存储满的情况

```typescript
try {
  storage.set('largeData', hugeObject)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.error('存储空间已满')
    // 清理旧数据
    storage.clear()
  }
}
```

## 性能建议

1. **避免存储大对象**：localStorage 有容量限制，建议只存储必要的数据
2. **使用 TTL**：为临时数据设置过期时间，自动清理
3. **批量操作**：避免频繁调用 `set()`，考虑批量更新

```typescript
// ❌ 不推荐：频繁写入
items.forEach(item => {
  storage.set(`item-${item.id}`, item)
})

// ✅ 推荐：批量存储
storage.set('items', items)
```

## 相关 API

- [Cookie](/fe/storage/cookie) - Cookie 操作
- [IndexedDB](/fe/storage/idb) - 大容量本地数据库
