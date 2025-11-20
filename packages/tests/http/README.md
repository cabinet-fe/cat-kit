# @cat-kit/http 单元测试

## 测试覆盖

### HTTPClient 测试 (`client.test.ts`)

#### ✅ 构造函数 (3 个测试)
- 创建基本客户端实例
- 创建带前缀的客户端实例
- 创建带配置的客户端实例

#### ✅ HTTP 方法 (13 个测试)
- **GET 请求**
  - 基本 GET 请求
  - 查询参数处理
  - URL 合并查询参数
  - 前缀拼接
  - 完整 URL 处理
- **POST 请求**
  - 基本 POST 请求
  - FormData 发送
  - 自定义头部
- **PUT 请求**
- **DELETE 请求**
- **PATCH 请求**
- **HEAD 请求**
- **OPTIONS 请求**

#### ✅ 请求分组 (2 个测试)
- 创建请求分组
- 分组路径拼接

#### ✅ 配置管理 (1 个测试)
- 全局头部与请求头部合并

#### ✅ 响应处理 (2 个测试)
- JSON 响应解析
- 不同响应类型处理

#### ✅ 插件系统 (3 个测试)
- beforeRequest 钩子执行
- afterRespond 钩子执行
- 多个插件按顺序执行

#### ✅ URL 处理 (2 个测试)
- URL 解码
- 路径拼接

---

### TokenPlugin 测试 (`plugins.test.ts`)

#### ✅ 基本功能 (5 个测试)
- 创建 Token 插件
- 添加 Bearer token
- 异步 getter 支持
- null 值处理
- undefined 值处理

#### ✅ 授权类型 (3 个测试)
- Bearer 授权
- Basic 授权
- 自定义授权类型 + formatter

#### ✅ 自定义头部 (1 个测试)
- 自定义头部名称

#### ✅ 保留现有头部 (1 个测试)
- 保留并合并现有请求头

#### ✅ 实际使用场景 (2 个测试)
- 从 localStorage 获取 token
- 从异步 API 获取 token

---

### MethodOverridePlugin 测试 (`plugins.test.ts`)

#### ✅ 基本功能 (6 个测试)
- 创建方法重写插件
- 重写 DELETE 方法
- 重写 PUT 方法
- 重写 PATCH 方法
- 不重写 GET 方法
- 不重写 POST 方法

#### ✅ 自定义配置 (2 个测试)
- 自定义需要重写的方法
- 自定义重写后的方法

#### ✅ 保留现有头部 (1 个测试)
- 保留并合并现有请求头

#### ✅ 实际使用场景 (2 个测试)
- 绕过服务器 DELETE 限制
- 处理复杂的 RESTful API 场景

#### ✅ 边缘情况 (2 个测试)
- 未指定方法的情况
- 空配置处理

---

## 测试统计

- **总测试数**: 51
- **通过率**: 100%
- **代码覆盖**:
  - HTTPClient: 26 个测试
  - TokenPlugin: 12 个测试
  - MethodOverridePlugin: 13 个测试

## 运行测试

```bash
# 运行所有测试
bun test packages/http/tests

# 运行特定测试文件
bun test packages/http/tests/client.test.ts
bun test packages/http/tests/plugins.test.ts

# 运行测试并查看覆盖率
bun test --coverage packages/http/tests
```

## 测试技术

- **测试框架**: Vitest
- **Mock**: `vi.fn()` 用于模拟 fetch 和其他函数
- **环境**: 模拟浏览器环境 (`window` 对象)
- **异步测试**: 支持 async/await 和 Promise

## 注意事项

1. 所有测试都运行在模拟的浏览器环境中
2. fetch API 被完全 mock，不会发起真实的网络请求
3. 测试覆盖了所有主要功能和边缘情况
4. 插件系统经过全面测试，包括钩子执行顺序

