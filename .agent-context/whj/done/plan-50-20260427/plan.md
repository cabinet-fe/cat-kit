# cat-kit 统一技能 — 填充 core + http 详细 API 文档

> 状态: 已执行

## 目标

为 `skills/cat-kit/packages/core/` 和 `skills/cat-kit/packages/http/` 下的每个 topic 文件编写精确的 API 文档，让 AI 代理能准确获取函数签名、参数含义、返回值、注意事项和代码示例，不需要查阅 generated 类型声明即可完成开发任务。

## 内容

### 1. 编写 core 包 API 文档

对以下文件从 stub 状态升级为完整内容，每个 API 按统一格式编写（签名 + 说明 + 参数 + 返回 + 注意 + 示例）：

- `packages/core/data.md`：arr/union、intersect、diff、deepMerge、pick/omit、集合操作等
- `packages/core/data-structure.md`：TreeManager（构造、traverse、find、add/remove）、LRU Cache 等
- `packages/core/date.md`：日期格式化、相对时间、时间戳转换等
- `packages/core/env.md`：isBrowser、isNode、isBun 等运行时检测
- `packages/core/optimize.md`：throttle、debounce、once、memoize 等
- `packages/core/pattern.md`：Observer 观察者模式、EventEmitter 等

每个 API 文档需对照 `generated/core/` 下的 `.d.ts` 类型声明和 `packages/core/src/` 下的源码编写，确保签名精确。

### 2. 编写 http 包 API 文档

- `packages/http/client.md`：HTTPClient 构造器选项、get/post/put/delete/patch 方法、拦截器、超时控制、响应类型、引擎选择（fetch/xhr）
- `packages/http/plugins.md`：TokenAuthPlugin、RetryPlugin、MethodOverridePlugin 等的配置与使用方式

### 3. 补充示例

在 `packages/core/examples.md` 中补充典型用法（每个分类 1-2 个有代表性的组合示例），`packages/http/examples.md` 补充插件组合示例。

## 影响范围

- 修改文件: `skills/cat-kit/packages/core/data.md`
- 修改文件: `skills/cat-kit/packages/core/data-structure.md`
- 修改文件: `skills/cat-kit/packages/core/date.md`
- 修改文件: `skills/cat-kit/packages/core/env.md`
- 修改文件: `skills/cat-kit/packages/core/optimize.md`
- 修改文件: `skills/cat-kit/packages/core/pattern.md`
- 修改文件: `skills/cat-kit/packages/core/examples.md`
- 修改文件: `skills/cat-kit/packages/http/client.md`
- 修改文件: `skills/cat-kit/packages/http/plugins.md`
- 修改文件: `skills/cat-kit/packages/http/examples.md`

## 历史补丁
