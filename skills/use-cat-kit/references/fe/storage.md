# fe — 存储

## WebStorage

```typescript
import { WebStorage, storageKey } from '@cat-kit/fe'

const TOKEN = storageKey<string>('token')
const local = new WebStorage(localStorage)

local.set(TOKEN, 'abc', 3600)    // 设置 + 过期秒数
local.get(TOKEN)                  // string | null
local.get(TOKEN, 'default')      // 带默认值
local.get([TOKEN, USER])         // 批量获取
local.getExpire(TOKEN)            // 过期时间戳
local.remove(TOKEN)
local.on('token', (key, value, temp) => {})
```

## Cookie

```typescript
import { cookie } from '@cat-kit/fe'

cookie.set('key', 'value', {
  expires?: number | Date, path?, domain?, secure?, sameSite?
})
cookie.get('key')
cookie.has('key')
cookie.remove('key', { domain?, path? })
cookie.getAll()
cookie.clear()
```

## IndexedDB

```typescript
import { IDB } from '@cat-kit/fe'

const users = IDB.defineStore('users', {
  id: { type: Number, primary: true, autoIncrement: true },
  name: { type: String, required: true },
  age: { type: Number, default: 18 }
})
const db = new IDB('myapp', { version: 1, stores: [users] })
await db.ready

await users.add({ name: 'Alice' })
await users.find({ id })
await users.findMany({ age: 18 })
await users.update(id, { age: 26 })
await users.put(id, fullObject)
await users.delete({ id })
await users.deleteMany({ age: 18 })
await users.count()
await users.clear()
db.close()
await IDB.deleteDatabase('myapp')
```
