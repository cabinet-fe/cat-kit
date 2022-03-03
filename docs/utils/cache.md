# 缓存

缓存工具库是对浏览器 api: sessionStorage, localStorage 的封装, 使其更加易用简单.

## 快速使用

```ts
import { WebCache, cacheKey } from 'fe-dk'

const session = WebCache.create('session')
const local = WebCache.create('local')

// 设置一个键值对
local.set('theme', 'dark')

// 尽管你可以直接设置一个字符串字面量作为键值, 但是仍然推荐你使用可导出的 cacheKey 方法来生成一个键, 然后你就可以获取TS的类型提示了
// 获取对键的类型提示
let USER_INFO = cacheKey<{
  name: string
  email: string
  phone: string
  age: number
}>('USER_INFO')

// 错误的写法
// 如果你使用TS, 下面的写法 将会报类型错误
session.set(USER_INFO, 'info')

// 正确的写法
session.set(USER_INFO, {
  name: '张三',
  email: 'email@some.com',
  phone: '18866669999',
  age: 100
})
```

## 设置过期时间

业务中通常会有使用 token 进行授权的方式, 这时候 token 需要保存到前端, 以前的做法是在浏览器 cookie 中保存这些参数, 但是 cookie 有一个最大的缺点, 那就是存储长度限制, 但 cookie 也有其有点, 那就是可以通过过期时间来消除 cookie. 因此在 storage 缓存中引入了过期时间的参数.

```ts
// 这里的3600是以秒为单位, 表示3600秒之后这条数据过期
local.set(TOKEN, 'my token', 3600)
```

## 批量获取

当有需要是可以通过批量操作使代码看起来更加简洁

```ts
session.get([TOKEN, USER_INFO])
```

## 获取时给一个默认值

```ts
session.get(TOKEN, 'default token')
```

## 移除

```ts
// 移除单个
session.remove(TOKEN)

// 移除多个
session.remove([TOKEN, USER_INFO])

// 清空
session.remove()
```

## 添加事件

有时候你可能需要在设置缓存的时候执行一些操作, 可以使用 on 方法来添加事件

```ts
// 添加一个叫做log的事件
session.on('log', (key, value, temp) => {
  console.log(new Date().toLocaleString(), `设置了${key}为${value}`)
})

// 移除事件
session.off('log')
```
