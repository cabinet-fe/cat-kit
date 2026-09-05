---
title: "@cat-kit/fe 浏览器存储 API"
description: storage、storageKey、cookie 的类型签名与行为说明
---

# 浏览器存储 — API

本篇列出 `@cat-kit/fe` 存储模块的公共类型签名。完整声明见 [storage.d.ts](../../../../packages/fe/dist/storage/storage.d.ts) 与 [cookie.d.ts](../../../../packages/fe/dist/storage/cookie.d.ts)。

```ts
declare function storageKey<T>(str: string): StorageKey<T>

type ExtractStorageKey<T> = T extends StorageKey<infer K> ? K : never

declare const storage: {
  readonly local: WebStorage
  readonly session: WebStorage
}

declare const cookie: {
  set(key: string, value: string, options?: CookieOptions): void
  get(key: string): string | null
  remove(key: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void
  has(key: string): boolean
  getAll(): Record<string, string>
  clear(): void
}
```

## WebStorage

`storage.local` 与 `storage.session` 均为 `WebStorage` 实例：

```ts
declare class WebStorage {
  set<T>(key: StorageKey<T>, value: T, exp?: number): WebStorage
  get<T>(key: StorageKey<T>): T | null
  get<T>(key: StorageKey<T>, defaultValue: T): T
  get<T extends [...any[]]>(keys: [...T]): { [I in keyof T]: ExtractStorageKey<T[I]> }
  getExpire(key: StorageKey<any>): number
  remove(key: StorageKey<any>): WebStorage
  remove(keys: StorageKey<any>[]): WebStorage
  remove(): WebStorage
  on(key: string, callback: Callback): void
  off(keys: string[]): void
  off(key: string): void
  off(): void
}
```

- `set` 第三参 `exp` 为过期秒数，`0` 或缺省表示不过期
- `get` 支持默认值重载与批量键数组重载；值已过期时移除并返回 `null`/默认值
- `remove` 重载：传单个键、键数组（批量移除）或不传（清空）
- `on`/`off`：注册与移除键改动的回调

## CookieOptions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `expires` | `number \| Date` | 过期时间，秒数或 `Date` 对象 |
| `path` | `string` | Cookie 路径 |
| `domain` | `string` | Cookie 域名 |
| `secure` | `boolean` | 是否仅通过 HTTPS 传输 |
| `sameSite` | `'Strict' \| 'Lax' \| 'None'` | 同站策略 |
