---
title: "storage 与 cookie 键值存储 API"
description: "@cat-kit/fe 存储模块 API：storage.local/.session 的 set/get/getExpire/remove/on/off（过期单位秒、支持默认值与批量读取）、storageKey 类型化键，以及 cookie 的 set/get/remove/has/getAll/clear。"
aliases: [storage api, cookie api, WebStorage, 本地存储签名, 缓存 api]
keywords: [storage, storageKey, StorageKey, ExtractStorageKey, CookieOptions, getExpire, setItem, 过期时间, 默认值, 批量读取, on, off, getAll, sameSite, 缓存监听]
---

# storage 与 cookie 键值存储 API

`@cat-kit/fe` 从包根导出 `storage`（`storage.local` / `storage.session`）、`storageKey`、`cookie`。存储实例的类类型未导出，本章以「实例方法」形式给出签名。

## 快速上手

```ts
import { storage, storageKey, cookie } from '@cat-kit/fe'

const TOKEN = storageKey<string>('token')

storage.local.set(TOKEN, 'abc', 3600) // 过期时间单位是秒：3600 秒后过期
console.log(storage.local.get(TOKEN)) // => 'abc'
console.log(storage.local.getExpire(TOKEN)) // => 过期时间戳（毫秒），永不过期时为 0

cookie.set('theme', 'dark', { expires: 86400 }) // 1 天后过期
console.log(cookie.get('theme')) // => 'dark'
```

## API 签名

```ts
/** 创建类型化存储键。运行时返回值就是字符串本身 */
export function storageKey<T>(str: string): StorageKey<T>

/** 类型化键的品牌类型，运行时无实体 */
export type StorageKey<_> = {}

/** 从 StorageKey<T> 提取 T */
export type ExtractStorageKey<T> = T extends StorageKey<infer K> ? K : never

/** 存储入口；local 对应 localStorage，session 对应 sessionStorage，实例均为懒创建单例 */
export declare const storage: {
  readonly local: WebStorage
  readonly session: WebStorage
}

// WebStorage 类类型未从包导出，以下是 storage.local / storage.session 实例的方法签名：
interface WebStorage {
  /** 写入单条记录并返回自身；exp 为过期秒数，0 表示永不过期。返回 this 可链式调用 */
  set<T>(key: StorageKey<T>, value: T, exp?: number): WebStorage
  /** 读取单个键，不存在或已过期返回 null */
  get<T>(key: StorageKey<T>): T | null
  /** 读取单个键，不存在或已过期返回 defaultValue */
  get<T>(key: StorageKey<T>, defaultValue: T): T
  /** 批量读取，按传入顺序返回数组，缺失项为 null */
  get<T extends [...any[]]>(keys: [...T]): { [I in keyof T]: ExtractStorageKey<T[I]> }
  /** 读取过期时间戳（毫秒）；键不存在、解析失败或永不过期时返回 0 */
  getExpire(key: StorageKey<any>): number
  /** 移除单个键并返回自身 */
  remove(key: StorageKey<any>): WebStorage
  /** 批量移除并返回自身 */
  remove(keys: StorageKey<any>[]): WebStorage
  /** 清空整个存储并返回自身 */
  remove(): WebStorage
  /** 注册键的变更回调，set 时同步触发 */
  on(key: string, callback: (key: StorageKey<any>, value?: any, temp?: { value: any; exp: number }) => void): void
  /** 移除多个键的回调 */
  off(keys: string[]): void
  /** 移除单个键的回调 */
  off(key: string): void
  /** 移除全部回调 */
  off(): void
}

export interface CookieOptions {
  /** 过期时间：秒数或 Date 对象。未设置时会话级 cookie（浏览器关闭即失效） */
  expires?: number | Date
  /** Cookie 路径。未设置时为当前页面路径 */
  path?: string
  /** Cookie 域名。未设置时为当前域 */
  domain?: string
  /** 为 true 时仅通过 HTTPS 传输 */
  secure?: boolean
  /** 同站策略：'Strict' | 'Lax' | 'None'。未设置时不写入 samesite 属性，行为由浏览器决定 */
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export declare const cookie: {
  /** 设置 cookie；key 与 value 会被 encodeURIComponent */
  set(key: string, value: string, options?: CookieOptions): void
  /** 读取 cookie 值，不存在返回 null */
  get(key: string): string | null
  /** 删除 cookie；删除不同 path/domain 的 cookie 时需传入对应的 path/domain */
  remove(key: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void
  /** 判断 cookie 是否存在 */
  has(key: string): boolean
  /** 读取当前可见的全部 cookie 键值对 */
  getAll(): Record<string, string>
  /** 清空当前可见的全部 cookie */
  clear(): void
}
```

## 参数说明

`WebStorage.set` / `get` / `getExpire` / `remove` / `on` / `off`：

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `key` | `StorageKey<T>` | — | 是 | 由 `storageKey<T>(str)` 创建；运行时为字符串 |
| `value` | `T` | — | 是 | 仅接受 `string` / `number` / `object`（含数组）/ `boolean` / `bigint`；`null`、`undefined`、`function`、`symbol` 静默跳过不写入；`bigint` 抛 `TypeError`（见注意事项） |
| `exp` | `number` | `0` | 否 | 过期秒数；`0` 表示永不过期 |
| `defaultValue` | `T` | — | 否 | 仅单键 `get` 重载支持；批量 `get` 不支持默认值 |
| `keys`（批量 get / remove / off） | `StorageKey[]` / `string[]` | — | 是 | 按传入顺序处理 |

`CookieOptions`：

| 字段 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `expires` | `number \| Date` | — | 否 | `number` 为秒数（内部换算 `Date.now() + 秒 * 1000`）；不设置时会话级 |
| `path` | `string` | 当前路径 | 否 | 读取与删除须与写入时一致才能命中 |
| `domain` | `string` | 当前域 | 否 | 跨子域共享时设置 |
| `secure` | `boolean` | 不写入 | 否 | `true` 时仅 HTTPS 传输 |
| `sameSite` | `'Strict' \| 'Lax' \| 'None'` | 不写入 | 否 | 写入为小写 `samesite=<值>` |

## 方法与事件

`WebStorage` 实例方法（`storage.local` / `storage.session` 同构）：

- `set(key, value, exp)`：同步，返回 `this` 支持链式调用；先触发该键的 `on` 回调再写入。存储格式为 `{ value, exp }` 的 JSON，`exp` 为过期毫秒时间戳（永不过期为 0）
- `get(key)`：同步；未命中返回 `null`（或 `defaultValue`）；**命中但已过期时移除该键**并返回 `null`（或 `defaultValue`）；参数既非字符串也非数组时抛 `Error('get第一个参数的类型应该是string或者array, 但传入的值是X类型')`（`X` 为实际类型名）
- `getExpire(key)`：同步；返回过期毫秒时间戳。键不存在、值解析失败、永不过期三种情况都返回 `0`，调用方无法用返回值区分这三种情况
- `remove()`：无参调用清空整个存储（`storage.clear()`）；传键或键数组时逐个移除；返回 `this`
- `on(key, callback)`：`set` 时同步触发，回调参数为 `(key, value, temp)`，`temp` 是 `{ value, exp }`（`exp` 为过期毫秒时间戳）
- `off(key)` / `off(keys)` / `off()`：删除该键全部回调、多键回调或全部回调

`cookie` 方法：全部同步。`set` 写入 `document.cookie`，键与值经 `encodeURIComponent`；`get` / `getAll` 解码后返回；`remove` 通过写入过期时间 `new Date(0)` 实现；`clear` 基于 `getAll` 逐个 `remove`。

## 典型示例

### 带过期的会话缓存与默认值

```ts
import { storage, storageKey } from '@cat-kit/fe'

const USER = storageKey<{ id: number; name: string }>('user')

storage.local.set(USER, { id: 1, name: 'Alice' }, 60) // 60 秒过期
console.log(storage.local.get(USER)) // => { id: 1, name: 'Alice' }

console.log(storage.session.get(USER, { id: 0, name: 'guest' })) // => { id: 0, name: 'guest' }（session 未写入，返回默认值）
```

### 批量读取与变更回调

```ts
import { storage, storageKey } from '@cat-kit/fe'

const A = storageKey<string>('a')
const B = storageKey<number>('b')

storage.local.set(A, 'va').set(B, 2) // 链式写入

console.log(storage.local.get([A, B])) // => ['va', 2]
console.log(storage.local.get([A, storageKey('missing')])) // => ['va', null]

const handler = (key, value) => console.log(String(key), value)
storage.local.on('a', handler)
storage.local.set(A, 'changed') // 控制台：a changed
storage.local.off('a') // 之后对 'a' 的 set 不再触发 handler
```

### Cookie 偏好设置

```ts
import { cookie } from '@cat-kit/fe'

cookie.set('theme', 'dark', { expires: 7 * 24 * 3600, path: '/', sameSite: 'Lax' }) // 7 天
console.log(cookie.get('theme')) // => 'dark'
console.log(cookie.has('theme')) // => true
console.log(cookie.getAll()) // => { theme: 'dark' }

cookie.remove('theme', { path: '/' })
console.log(cookie.get('theme')) // => null
```

## 注意事项

> [!WARNING]
> - `exp` 单位是**秒**，不是毫秒：`set(key, value, 60)` 是 60 秒后过期。与以毫秒计的缓存库不同。
> - `set` 对 `null` / `undefined` / `function` / `symbol` **静默跳过**（不写入、不报错）；`bigint` 虽在类型白名单内，但 `JSON.stringify` 无法序列化，会抛 `TypeError: JSON.stringify cannot serialize BigInt.`。
> - `get` 命中已过期键时会**移除该键**再返回 `null`/默认值；批量 `get` 对缺失项返回 `null`，不接受默认值参数。
> - `storageKey` 返回值运行时就是字符串，但 API 类型签名要求 `StorageKey<T>`；直接传裸字符串无法通过类型检查。
> - `cookie.get` / `cookie.getAll` 按 `=` 切分且只接受两段：本库 `set` 写入的值经 `encodeURIComponent` 编码可正常读回；外部代码写入的原始值含 `=`（如 `raw=a=b`）时读不到、返回 `null`。
> - `cookie.remove` / `cookie.clear` 只能删除「当前 path 可见」的 cookie；删除其他 `path` / `domain` 写入的 cookie 必须在 `remove` 时传入相同 `path` / `domain`，否则无效。
> - 非浏览器环境首次访问 `storage.local` 抛 `ReferenceError: localStorage is not defined`；`cookie` 依赖 `document.cookie`，同样仅浏览器可用。
