# 开发规范和详设

本文档提供开发规范和详细设计，每个点为何要这样设计都会给出具体的解释。

## 1. 技术选型和架构

项目类型绝大部分是管理类软件，多个软件间有重合和高度定制的部分。

后端基于Java(能否用Java17，有性能上的提升，不能的原因是什么？)和.net。

前端基于TS。

### 1.1 通信方式

通信协议基于http。

**常见http状态码**（相当重要所有岗位都需要掌握）：

```JSON
/** 状态码 */
 {
  /** 请求头已接收 */
  "StatusContinue": 100, // RFC 7231, 6.2.1

  /** 请求成功完成 */
  "StatusOK": 200, // RFC 7231, 6.3.1

  /** 服务器的响应中不会包括任何内容 */
  "StatusNoContent": 204, // RFC 7231, 6.3.5

  /** 地址永久移动到了新的地址, Location头给出新的URI */
  "StatusMovedPermanently": 301, // RFC 7231, 6.4.2

  /** 资源未更改, 意味着从缓存中拿到资源 */
  "StatusNotModified": 304, // RFC 7232, 4.1

  // 客户端错误
  /** 错误的请求, 通常是请求参数错误 */
  "StatusBadRequest": 400, // RFC 7231, 6.5.1
  /** 未进行授权 */
  "StatusUnauthorized": 401, // RFC 7235, 3.1
  /** 拒绝请求，跟401类似，通常在安全软件拦截时可能出现 */
  "StatusForbidden": 403, // RFC 7231, 6.5.3
  /** 资源不存在 */
  "StatusNotFound": 404, // RFC 7231, 6.5.4
  /** 请求方法错误 */
  "StatusMethodNotAllowed": 405, // RFC 7231, 6.5.5

  /** 请求超时，通常是服务器未能在预期时间内处理完请求 */
  "StatusRequestTimeout": 408, // RFC 7231, 6.5.7

  /** 请求的URI太长，一般不会出现, 除非使用了非常长的查询参数 */
  "StatusRequestURITooLong": 414, // RFC 7231, 6.5.12

  // 服务器错误
  /** 内部服务器错误 */
  "StatusInternalServerError": 500, // RFC 7231, 6.6.1
  /** 错误网关，大部分情况就是服务挂掉了，负责网关和代理的服务器无法访问这些服务 */
  "StatusBadGateway": 502, // RFC 7231, 6.6.3
  /** 服务不可用或者过载了，通常发生在服务更新或维护期间 */
  "StatusServiceUnavailable": 503, // RFC 7231, 6.6.4
  /** 网关超时 */
  "StatusGatewayTimeout": 504, // RFC 7231, 6.6.5
  /** http版本不支持，现在基本上很少出现，早期http1.0往http1.1转换的时候可能回出现 */
  "StatusHTTPVersionNotSupported": 505, // RFC 7231, 6.6.6
}
```

数据交换格式统一使用JSON。

## 2. 开发规范

### 2.1 http请求和响应的数据结构

请求:

```json
{
  "main": {
    "name": "xxx项目",
    "startDate": 1706509491317,
    "endDate": 1707509491317,
    "amount": 25000000
  },
  "paymentPlan": [
    { "ratio": 0.3, "amount": 7500000 },
    { "ratio": 0.4, "amount": 10000000 },
    { "ratio": 0.3, "amount": 7500000 }
  ]
}
```

响应格式:

```json
{
  // 数据
  "data": {
    "main": {
      "id": "1234567",
      "name": "xxx项目",
      "startDate": 1706509491317,
      "endDate": 1707509491317,
      "amount": 25000000
    },
    "paymentPlan": [
      { "ratio": 0.3, "amount": 7500000 },
      { "ratio": 0.4, "amount": 10000000 },
      { "ratio": 0.3, "amount": 7500000 }
    ]
  },
  // 错误提示信息
  "errorMsg": ""
}
```

::: tip 为什么用这样的格式？
首先，这种结构化的方式更加容易阅读（类似命名空间），尤其是在仅阅读子列表字段时更加有用。

其次，为了方便低代码工具生成统一的入参格式，贯彻入参的可配置化。

最后，此种数据格式符合UI上的直觉，有更好的UI和数据一致性。
:::

::: warning 讨论
对于导入导出来说，这种数据格式会更加方便吗？
:::

### 2.2 命名规范

::: danger 前言
无数的实践证明，不规范的命名是导致bug率和项目维护成本快速增高的最重要因素之一！
:::

在理解字段命名的重要性之前先来看一个错误的例子：

```json
{
  "xmmc": "",
  "xmdm": "",
  "xmbm": "",
  "xmdw": "",
  "bxbm": ""
}
```

上面的例子你能知道具体的含义吗？

再看下面的例子:

```json
{
  "projectName": "",
  "projectId": "",
  "contractId": "",
  "contractAmount": 0
}
```

上面的项目对象中的字段你能够分辨哪个是主键哪个是外键吗？

::: tip 软件开发速度由什么决定？
虽然不规范的命名在软件开发前期会提升开发效率，但难以贯穿整个软件生命周期。因为软件开发从来不是一个人的事情，命名规范可以影响后端，前端，测试，运维，实施，甚至产品。因此软件开发效率着重提高的是整个团队的开发效率。
:::

接下来讨论命名的一些原则：

1. 字段和变量等应该能够通过其命名知晓其表达的含义
2. 命名同时要兼顾简洁
3. 在一个对象中的字段应该能够让人清晰地分清主次

还是用表示一个项目的对象来举个例子，更好的做法应该如下方一样：

```json
{
  "name": "",
  "id": "",
  "contractId": "",
  "contractAmount": ""
}
```

对象本身已经用来表示项目，名称主键等其他有主语修饰的字段应该**丢弃主语**。

这样做的好处是：

1. 字段变得更加简洁，同时也不会失去其语义。
2. 当字段命名遵循一种约定俗成，就会大大减少沟通成本。
3. 对于低代码来讲，能够减少配置的复杂度，例如下拉选择器中的文本显示配置，子节点配置。
4. 可以清楚地知道哪些字段是内部的，哪些字段是外部的。

下面是一些常用的字段命名：

- 形容词。disabled(禁用的, 不可用的)，enabled(可用的), public(公用的，大众的), updated(已更新的)，frozen(已冻结的)。
- 名词。name(名称)，code（代码,代号），date(日期)，time(时间), year(年)，month(月), dateTime(年-月-日 时:分:秒)，amount(数量, 金额)，price(单价)，fee(费用)，remark(说明，备注)，number(编号), encoding(编码), type(类型), category(分类), status(状态)，children(子节点)。

### 2.3 接口风格

接口风格遵循RESTful设计原则。REST是一组单词(Representational State Transfer)的缩写, 直译就是具象状态传输，ful是单词后缀表示形容词。

对于RESTful我们无需理解单词的含义，而是理解为一种如何定位资源，如何操作资源，如何传输资源的一种规范。

RESTful设计原则：

- 用URI标识资源。在WEB中其实就是URL。

```
# URI示例
https://example.com/project/1
```

- 用http方法操作资源。

```yaml
# 读取资源
GET: https://example.com/project/1

# 更新资源
PUT: https://example.com/project/1

# 删除资源
DELETE: https://example.com/project/1

# 创建资源
POST: https://example.com/project

# 读取分页资源
GET: https://example.com/project/page
```

- 使用JSON进行数据交互

::: tip 对比

```yaml
# RESTful读取资源
GET: https://example.com/project/1

# 传统读取
GET: https://example.com/project/getInfoById?id=1
```

REST API要更加简洁，并且当project后面的参数丢失会抛出一个404错误更加符合直觉，传统API的id参数丢失将会报400错误。

当你想对创建资源和更新资源做权限控制时，传统API会更加难以维护。

更重要的是，传统API创建资源和更新资源通过请求体里面是否有主键(通常为ID)来判断是创建还是更新，在调试时增加了调试复杂度。
:::


## 模块设计

### 低代码


### 支付系统

支付系统用于商品订单，工资奖金支付，报销，借还款等。

支付系统的要素：

- 钱的来源和去向。
-

## 测试
