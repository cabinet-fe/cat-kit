# REST APIs
REST APIs有时候也被成为RESTful APIs, REST加上ful后缀成为形容词意为 REST风格的.

REST最早由Roy Thomas Fielding(HTTP协议的主要设计者)在其2000年的[博士论文](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)中提出, REST是Representational State Transfer的缩写, 意为表述性状态转移.

理解REST API还需要知道一个名词URI(Uniform Resource Identifier), 即统一资源标识符, 可以理解为资源路径, 比如linux系统/usr/bin/git这个资源符就表示为git这个命令. 值得一提的是, 我们常见或者常说的URL也属于URI的一种.


## 设计原则

REST的设计原则主要有以下两点, 或者说最主要的是第一点.

1. **统一接口。** 无论请求来自何处，对同一资源发出的所有 API 请求都应该看起来相同.

```ts
// 获取某个资源
GET('/resource/:id')

// 更改某个资源
PUT('/resource/:id')

// 删除某个资源
DELETE('/resource/:id')
```

2. **客户端/服务器解耦。** 在 REST API 设计中，客户端和服务器应用程序必须彼此完全独立。 客户端应用程序只需知道所请求资源的 URI 即可, 目前我们前后端分离的模式
都是采用这种模式.



## 规范

目前业界最流行的规范是[OpenAPI3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md)

实际上, 项目很难完全按照规范来, 我们总需要根据所使用的技术栈, 历史问题, 使用成本来综合考量. 根据在多家公司和多个项目中的联调经验, 总结出以下最佳实践.


## 长周期和复杂项目
待编辑

## 最佳实践

- 规范命名. URI中不应该包含意义不明的单词
```ts
// 反面示例
GET('/yh/{id}')

// 正面示例
GET('/user/{id}')
```

- 传输的内容**尽可能**使用JSON格式. 除了文件下载外所有的接口都应该返回JSON格式的数据, 并且指定头 Content-Type: application/json; charset=utf-8.指定头是有用的, 它将告诉
浏览器如何解析从服务端返回的数据.

- 遵守 HTTP METHOD 语义.

```ts
// 表示更新某个user
PUT('/user/{id}', { name: 'xxx', age: 20, address: 'xxxx' })

// 表示删除某个user
DELETE('/user/{id}')

// 表示获取某个user
GET('/user/{id}')

// 表示增加user
POST('/user')
```

- URI中不应该出现操作动词, 但是可以出现修饰词但是需要使用PATCH方法
```ts
// 反面示例
POST('/getUserInfo')

// 正面示例
// 下面这个例子能够看出这是一个获取动作, 获取的是user这个具体资源的信息
GET('/user/{id}')

// 正面示例, patch方法表示打补丁的意思, release表示打补丁的方式
PATCH('/file-rule/{id}/release')
```

- 主表字段的定义不要加名词修饰

```ts
// 反面示例
{
  userId: '',
  userName: '',
  userEmail: '',
  departmentId: ''
}

// 正面示例
{
  id: '',
  name: '',
  email: '',
  departmentId: ''
}

```

- 修饰词放在资源主体后面
```ts
// 反面示例
GET('/page/user')

// 正面示例
GET('/user/page')
```

- 关联查找时使用Query参数而不是将变量放到URI中

```ts
// 反面示例
GET('/rule/{userId}')

// 正面示例
GET('/rule?userId=')
```

- 如果软件可预见多次迭代或者有重构期望, 应尽可能使用版本控制. 现代web框架的资源寻址都是基于trie树, 因此无需担心版本影响资源定位性能.

```ts
GET('/api/v1/dict/{type}')
```
- 如果接口出现错误, 请在返回值里写明错误原因
```ts
// 反面示例
{
  code: 500,
  msg: '服务器错误'
}

// 正面示例
{
  code: 500,
  msg: 'xxx已完成, 不能xxx'
}
```

- 使用标准的HTTP Code表示状态, 不要在返回值里返回额外的和HTTP Code相同作用的Code, 会引起歧义.
```
# 反面示例, 该示例的HTTP Code表示成功, 但返回值里面的code表示服务器错误
Status Code: 200 OK
Response: { "code": 500, "msg": "服务器错误" }

# 正面示例
Status Code: 500 Internal Server Error
{ "code": 500, "msg": "服务器错误" }

# 更好的示例
Status Code: 500 Internal Server Error
{ "msg": "服务器错误" }
```