# HTTP

在过去, 要请求后端的接口需要借助很多第三方库, 比如 jquery 的 ajax, axios, 他们最大的缺点就是体积过大, 并且不是那么易用. 其中 axios 在现代框架中被广泛使用, 但是其同时实现了服务端的 api, 因此为了体积和易用性开发出这一个用于与后端进行交互的 api

## 快速使用

```ts
import { Http } from 'cat-kit'

const http = new Http({
  baseUrl: '/api', // 表示所有的接口以 /api 作为前缀
  timeout: 18000 // 表示如果请求超过18000就抛出超时错误
})
```

## 例子
:::demo
render(utils/fe/http/basic)
:::

## api

### 构造参数 new Http(options: Options)

- **Options**
  - **before** `<Function>`: 生命周期, 该方法会在请求发送之前调用(如果指定的话)
  - **after** `<Function>`: 生命周期, 该方法在请求完成后调用, 无论成功还是失败
  - **baseUrl** `<string>`: 基础请求路径
  - **timeout**: `<number>`: 超时时间, 默认为 0 即不超时
  - **headers**: `<Object>`: 请求头
  - **withCredentials**: `<boolean>`: 请求是否携带 cookie, 默认为 false

### Http.request

```ts
http
  .request({
    url: '/user/1',
    method: 'GET'
  })
  .then(res => {
    console.log(res.data, res.code)
  })

// GET http://xxx.xxx.xxx/api/user/1
```

### 快捷写法

```ts
http.get('/user', {
  params: {
    id: 1
  }
})
// GET  http://xxx.xxx.xxx/api/user?id=1

http.post(
  '/user',
  { name: '张三', age: 20 },
  {
    params: { type: 'admin' }
  }
)
// POST  http://xxx.xxx.xxx/api/user?type=admin  payload: { type: 'admin' }

http.put('http://www.baidu.com/user/1')
// PUT http://www.baidu.com/user/1

http.delete('/user/1')
// DELETE http://xxx.xxx.xxx/api/user/1
```

## 生命周期

axios 中叫拦截器.

### before

before 是一个函数, 你可以返回一个 false 来阻止请求实例的创建, 亦可以返回一个新的配置对象, 以便于你对不同的接口进行通用的处理, 以下是一个小例子

```ts
const http = new Http({
  // 默认使所有的请求url之前拼接一个/api
  baseUrl: '/api',
  timeout: 18000,
  before(conf) {
    const isXWF = conf.headers['Content-Type'].includes('application/x-www-form-urlencoded')

    // 对于表单对象, 你需要手动将其转化成一个key=value拼接的字符串
    if (isXWF && isObj(conf.data)) {
      conf.data = Object.keys(conf.data)
        .map(k => `${k}=${conf.data[k]}`)
        .join('&')
    }

    // post请求不允许什么都不穿
    if (conf.method === 'POST' && (conf.data === undefined || conf.data === null)) {
      console.error('请传点东西')
      return false
    }

    // 请求之前找到
    if (token) {
      conf.headers['Authorization'] = 'some token'
    }
    // 是一个流意味着文件可能很大, 去掉超时
    if (conf.responseType === 'blob') {
      conf.timeout = 0
    }

    return conf
  }
})
```

### after

after 在请求完成后调用, 该函数有两个参数, 第一个参数是响应对象, 第二个参数指定以何种形式抛出响应值(当以error抛出时,
一个异步函数中的代码将不会执行), 看以下的例子:
默认地, 以Http标准将400到600之间的状态码作为错误抛出

```ts
// 指定以下状态吗都是报错的状态码
const customErrorCode = new Set<number>([
  1001,
  1002,
  1003
])

export const authHttp = new Http({
  baseUrl: 'http://localhost',
  after(res, returnBy) {
    if (customErrorCode.has(res.code)) {
      returnBy('error')
      message.error(res.message)
    } else {
      returnBy('normal')
    }

    if (res.is(401)) {
      router.replace('/login')
    }
    return res
  }
})


// 假设后端返回的状态码是1001(错误状态吗)
const postTo = async () => {
  await authHttp.post('/path/of/api')

  // 以下不会执行, 因为authHttp将自定义错误码以错误抛出
  // 换句话说以下代码是属于Promise<any>.then中回调函数执行的代码,
  // 以错误抛出则只执行Promise<any>.catch中的回调函数
  // 这种模式能够让你少写状态码判断的相关代码
  alert('成功')
}

// 不够优雅的例子
const badPostTo = async () => {
  const { code } = await authHttp.post('/path/of/api')
  if (code !== 200) return // 这段代码不必要增加了很多判断
  alert('成功')
}
```
