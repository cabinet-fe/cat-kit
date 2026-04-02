# @cat-kit/http 认证与重试插件

> 状态: 已执行

## 目标

基于 Plan 25 增强后的客户端基础设施（`PluginContext.retry`、`onError` 错误恢复），重写 Token 插件以支持完整认证生命周期（令牌刷新、过期检测、并发请求排队），并新增通用 Retry 插件。保持 Token 插件的现有配置项完全向后兼容。

## 内容

### 1. Token 插件 v2 (`plugins/token.ts`)

`TokenPluginOptions` 在保留现有 `getter`、`headerName`、`authType`、`formatter` 的基础上新增：

- `onRefresh?: () => Promise<void>` — 刷新令牌回调，用户在此回调中负责调用后端刷新接口并更新本地存储的 token（插件不管理存储，刷新完成后通过 `getter` 重新获取新 token）
- `isExpired?: () => boolean` — 判断当前 access_token 是否已过期，返回 `true` 时触发刷新流程
- `isRefreshExpired?: () => boolean` — 判断当前 refresh_token 是否已过期
- `shouldRefresh?: (response: HTTPResponse) => boolean` — 基于响应判断是否需要刷新（典型场景：`response.code === 401`）
- `onRefreshExpired?: () => void` — refresh_token 过期时的回调（典型场景：触发登出、跳转登录页）

内部实现要点：

- **请求排队机制**：内部维护 `refreshPromise: Promise<void> | null`，当 `onRefresh` 正在执行时，后续进入 `beforeRequest` 的请求 `await refreshPromise`，保证同一时刻只触发一次刷新
- **beforeRequest 逻辑**（按顺序执行）：
  1. 若配置了 `isRefreshExpired` 且返回 `true` → 调用 `onRefreshExpired?.()` → 抛出 `HTTPError(code: 'UNKNOWN', message: '刷新令牌已过期')`
  2. 若 `refreshPromise` 非空（刷新进行中）→ `await refreshPromise`
  3. 若配置了 `isExpired` 且返回 `true` → 执行 `doRefresh()`（内部创建 `refreshPromise`，调用 `onRefresh()`，完成后置空 `refreshPromise`），等待完成
  4. 通过 `getter()` 获取 token 并注入 header（与现有逻辑一致）
- **afterRespond 逻辑**：
  1. 若配置了 `shouldRefresh` 且 `shouldRefresh(response)` 返回 `true` → 执行 `doRefresh()` → 通过 `context.retry()` 重试当前请求 → 返回重试结果
  2. 否则不处理（返回 void）

完成标准：不配置新选项时行为与 v1 完全一致；配置 `isExpired` + `onRefresh` 后过期请求自动刷新；并发请求只触发一次刷新；`shouldRefresh` 触发的响应级刷新能通过 retry 重试成功。

### 2. Retry 插件 (`plugins/retry.ts`)

新建文件 `packages/http/src/plugins/retry.ts`，导出 `RetryPlugin` 工厂函数。

`RetryPluginOptions` 接口：

- `maxRetries?: number` — 最大重试次数，默认 3
- `delay?: number | ((attempt: number) => number)` — 重试延迟（ms），数值型为固定延迟，函数型支持自定义退避策略；默认指数退避 `(attempt) => Math.min(1000 * 2 ** attempt, 30000)`
- `retryOn?: (error: unknown, context: RequestContext) => boolean` — 自定义重试判断函数，返回 `true` 时重试
- `retryOnStatus?: number[]` — 按 HTTP 状态码触发重试，默认 `[408, 429, 500, 502, 503, 504]`

实现要点：

- 通过 `onError` 钩子实现：捕获错误 → 判断是否需要重试（优先用 `retryOn`，其次检查 `error` 为 `HTTPError` 时其 `response.code` 是否在 `retryOnStatus` 中）→ 等待 `delay` 时间 → 调用 `context.retry()` 返回结果
- 重试计数通过 `RequestConfig` 上的内部字段 `_retryAttempt?: number` 传递，每次 retry 时递增，达到 `maxRetries` 后不再重试，重新抛出原始错误
- `_retryAttempt` 字段仅内部使用，不在公开类型中暴露（通过类型断言访问）

完成标准：默认配置下网络错误自动重试最多 3 次；自定义 `retryOn` 能精确控制重试条件；超过最大次数后抛出原始错误。

### 3. 导出更新

- `packages/http/src/plugins/index.ts` 添加 `export * from './retry'`
- `packages/http/src/index.ts` 添加 `export * from './plugins/retry'`
- `packages/http/AGENTS.md` 目录结构中 `plugins/` 下添加 `retry.ts` 条目及简要说明

完成标准：从 `@cat-kit/http` 和 `@cat-kit/http/src` 均可导入 `RetryPlugin` 和 `RetryPluginOptions`。

### 4. 测试 (`packages/tests/http/plugins.test.ts`)

Token 插件 v2 测试：

- **向后兼容**：不配置新选项时，所有现有 Token 测试用例继续通过
- **access_token 过期自动刷新**：配置 `isExpired` 首次返回 true，`onRefresh` mock 实现将 `isExpired` 改为返回 false，断言 `onRefresh` 被调用 1 次且请求成功带上新 token
- **refresh_token 过期**：配置 `isRefreshExpired` 返回 true，断言 `onRefreshExpired` 被调用且请求抛出错误
- **并发请求排队**：同时发起 3 个请求，`isExpired` 首次返回 true，断言 `onRefresh` 仅被调用 1 次
- **响应级刷新**：配置 `shouldRefresh` 检查 `response.code === 401`，mock 首次返回 401，刷新后返回 200，断言最终结果为 200 响应

Retry 插件测试：

- **默认重试**：mock fetch 连续失败 2 次后成功，断言最终请求成功且 fetch 被调用 3 次
- **超过最大重试**：mock fetch 持续失败，`maxRetries: 2`，断言抛出原始错误且 fetch 被调用 3 次（1 + 2 重试）
- **自定义 retryOn**：`retryOn` 返回 false 时不重试
- **延迟策略**：使用 `vi.useFakeTimers()` 验证固定延迟和函数延迟被正确调用
- **retryOnStatus**：配置 `retryOnStatus: [503]`，mock 返回 503 后成功，断言重试生效

完成标准：所有新增测试通过；所有现有测试通过。

## 影响范围

- `packages/http/src/types.ts`（`RequestContext.retry`）
- `packages/http/src/client.ts`（`onError` 传入 `retry`、合并 `_retryAttempt`、非 2xx 带 `response` 时先跑 `afterRespond` 以支持 401 刷新）
- `packages/http/src/plugins/token.ts`（Token v2）
- `packages/http/src/plugins/retry.ts`（新建）
- `packages/http/src/plugins/index.ts`、`packages/http/src/index.ts`
- `packages/http/AGENTS.md`
- `packages/tests/http/plugins.test.ts`
- `skills/use-cat-kit/references/http/plugins.md`

## 历史补丁

- patch-1: 审查修复：主导出、Token 边界、文档与测试
