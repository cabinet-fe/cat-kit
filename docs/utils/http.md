# HTTP
在过去, 要请求后端的接口需要借助很多第三方库, 比如jquery的ajax, axios, 他们最大的缺点就是体积过大, 并且不是那么易用. 其中axios在现代框架中被广泛使用, 但是其同时实现了服务端的api, 因此为了体积和易用性开发出这一个用于与后端进行交互的api

## 快速使用

```ts
import { Http } from 'fe-dk'

const http = new Http({
  baseUrl: '/api', // 表示所有的接口以 /api 作为前缀
  timeout: 18000 // 表示如果请求超过18000就抛出超时错误
})
```

## api

### Http.request

```ts
http.request({
  url: '/user/1',
  method: 'GET'
}).then(res => {
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

http.post('/user', { name: '张三', age: 20 }, {
  params: { type: 'admin' }
})
// POST  http://xxx.xxx.xxx/api/user?type=admin  payload: { type: 'admin' }

http.put('http://www.baidu.com/user/1')
// PUT http://www.baidu.com/user/1

http.delete('/user/1')
// DELETE http://xxx.xxx.xxx/api/user/1
```