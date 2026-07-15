# fe — 浏览器存储

## 适用场景

- 用带 TypeScript 值类型的 key 读写 `localStorage` 或 `sessionStorage`
- 为 Web Storage 值设置按秒计算的过期时间
- 在同一 `storage` 实例内响应 `.set()` 调用
- 管理由前端 JavaScript 可读写的普通 Cookie

## 如何选择

| 需求                               | 选择                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| 跨浏览器会话保留客户端状态         | `storage.local`                                       |
| 仅保留到当前标签页会话结束         | `storage.session`                                     |
| 需要随 HTTP 请求发送少量字符串     | `cookie`                                              |
| 敏感会话、HttpOnly 或服务端 Cookie | 由服务端通过 `Set-Cookie` 管理，不使用这里的 `cookie` |
| 大量、可查询或事务型浏览器数据     | 使用 IndexedDB                                        |

## 公共 API

### Web Storage

```ts
storageKey<T>(name: string): StorageKey<T>

storage.local.set(key, value, expiresInSeconds?)
storage.local.get(key): T | null
storage.local.get(key, defaultValue): T
storage.local.get([keyA, keyB])
storage.local.getExpire(key): number
storage.local.remove(key | key[])
storage.local.remove()
storage.local.on(name, callback): void
storage.local.off(name | name[]): void
storage.local.off(): void
```

`storage.session` 提供同一组方法。`getExpire` 返回绝对毫秒时间戳；不存在或没有可读过期信息时返回 `0`。

`storageKey<T>` 是编译期类型标记，运行时仍是传入的字符串。`.get()` 遇到缺失或过期值返回 `null`（有默认值时返回默认值），过期值会在读取时删除。

### Cookie

```ts
cookie.set(key: string, value: string, options?: CookieOptions): void
cookie.get(key: string): string | null
cookie.has(key: string): boolean
cookie.getAll(): Record<string, string>
cookie.remove(
  key: string,
  options?: Pick<CookieOptions, 'path' | 'domain'>
): void
cookie.clear(): void
```

`CookieOptions` 支持：

- `expires?: number | Date`：秒数表示从现在起的有效时长
- `path?: string`
- `domain?: string`
- `secure?: boolean`
- `sameSite?: 'Strict' | 'Lax' | 'None'`

## 最小示例

```ts
import { cookie, storage, storageKey } from '@cat-kit/fe'

const preferencesKey = storageKey<{ theme: 'light' | 'dark' }>('preferences')

storage.local.set(preferencesKey, { theme: 'dark' }, 24 * 60 * 60)
const preferences = storage.local.get(preferencesKey, { theme: 'light' })

cookie.set('locale', 'zh-CN', { path: '/', sameSite: 'Lax', secure: true })
```

## 必要边界

- Web Storage 值会经过 JSON 序列化，只传可 JSON 序列化的数据。`null`、`undefined`、函数和 Symbol 不会被写入；BigInt、循环引用等会导致序列化失败。
- 类型标记不能验证已存在的存储内容。其他代码写入了不同结构时，`.get()` 不会做运行时 schema 校验。
- 批量 `.get([keyA, keyB])` 保持输入顺序；运行时缺失项仍为 `null`。
- `.on(name, callback)` 只监听同一个封装实例上的 `.set()`，不是浏览器 `storage` 事件；跨标签页修改、`.remove()` 和 `.clear()` 不触发它。回调应使用传入值，不要假设回调执行时底层写入已经完成。
- 存储被禁用、超出配额或已有值不是合法 JSON 时，相关调用可能抛错；API 不吞掉这些错误。
- `cookie.set` 未提供 `path` 时使用浏览器默认路径，不是固定的 `/`。删除时应传与设置时相同的 `path` / `domain`。
- `cookie.clear()` 只能尝试删除当前 JavaScript 可见且以当前默认作用域可删除的 Cookie，不能删除 HttpOnly、其他路径或不匹配 domain 的 Cookie。
- `SameSite=None` 通常还需要 `secure: true`，最终是否接受 Cookie 由浏览器策略决定。
- 只有根入口 `@cat-kit/fe` 是公开导入路径。

## 类型入口

- [Web Storage](../../generated/fe/storage/storage.d.ts)
- [Cookie](../../generated/fe/storage/cookie.d.ts)
