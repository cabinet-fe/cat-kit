# @cat-kit/http 客户端核心增强

> 状态: 已执行

## 目标

增强 `@cat-kit/http` 客户端的基础能力：为 `RequestConfig` 增加 per-request 终止控制（`signal`）和上传/下载进度追踪回调，在引擎层（Fetch / XHR）实现对应功能，并在客户端层为插件系统注入重试上下文（`PluginContext.retry`）与 `onError` 错误恢复能力，为后续 Token v2 和 Retry 插件提供基础设施。

本计划要求同时固化以下行为契约，避免实现阶段再做临时决策：

- 外部 `signal` 终止与内部超时必须保留不同错误码：外部终止为 `ABORTED`，超时为 `TIMEOUT`
- `PluginContext.retry()` 的配置合并规则必须明确且可测试
- Fetch 下载进度不能通过二次消费 `response.body` 破坏现有响应解析流程
- 所有变更保持现有公开 API 向后兼容：旧插件签名继续可用，不新增外部依赖
- 所有新增行为都必须有对应测试覆盖

## 内容

### 1. 固化公共契约与类型 (`types.ts` + `client.ts`)

在 `packages/http/src/types.ts` 中：

- `RequestConfig` 新增三个可选字段：
  - `signal?: AbortSignal` — 用户传入的终止信号，允许 per-request 粒度的请求终止
  - `onUploadProgress?: (info: ProgressInfo) => void` — 上传进度回调
  - `onDownloadProgress?: (info: ProgressInfo) => void` — 下载进度回调
- 新增 `ProgressInfo` 接口：
  ```ts
  interface ProgressInfo {
    /** 已传输字节数 */
    loaded: number
    /** 总字节数，未知时为 0 */
    total: number
    /** 进度百分比 0-100，total 为 0 时固定返回 0 */
    percent: number
  }
  ```
- 新增 `PluginContext` 接口：
  ```ts
  interface PluginContext {
    /** 重试当前请求，可传入部分配置覆盖 */
    retry: (config?: Partial<RequestConfig>) => Promise<HTTPResponse>
  }
  ```
- `HttpErrorCode` 新增 `RETRY_LIMIT_EXCEEDED`
- `ClientPlugin.afterRespond` 签名新增第 4 个可选参数 `context?: PluginContext`，原有三参数插件无需修改即可继续工作
- `ClientPlugin.onError` 返回类型从 `Promise<void> | void` 扩展为 `Promise<HTTPResponse | void> | HTTPResponse | void`，返回 `HTTPResponse` 时客户端视为错误已恢复，使用该响应作为最终结果

在 `packages/http/src/client.ts` 中先固化以下公共 contract，再进入引擎实现：

- 抽出 `mergeRequestConfig(base, patch)`，并明确合并规则：
  - `headers`、`query` 做对象级合并，patch 中同名字段覆盖 base
  - `method`、`body`、`timeout`、`credentials`、`responseType`、`signal`、`onUploadProgress`、`onDownloadProgress` 采用“patch 显式传值则覆盖，否则保留 base”
  - `undefined` 不用于清空已有配置
- 定义 `MAX_PLUGIN_RETRIES = 10`，`retryCount` 从 `0` 开始表示首次请求，最多允许 10 次插件触发的 retry，总尝试次数最多为 `11`
- 定义 `onError` 恢复 contract：
  - 所有 `onError` 插件按顺序继续执行，保持已有副作用插件（日志、埋点、清理）语义不被短路
  - 记录第一个返回的 `HTTPResponse` 作为恢复结果，后续插件即使也返回 `HTTPResponse` 也不覆盖首个结果

完成标准：类型编译通过；公共 contract 在计划中写明且后续测试有覆盖。

### 2. `FetchEngine` 增强 (`engine/fetch.ts`)

- **Signal 合并**：
  - 内部超时继续使用独立 `AbortController`
  - 若 `RequestConfig.signal` 存在，优先使用原生 `AbortSignal.any([userSignal, internalController.signal])`
  - 若运行时不支持 `AbortSignal.any`，使用手动合并方案：创建新的 `AbortController`，分别监听 `userSignal` 与内部 timeout signal，任一触发时中止 merged controller，请求结束后移除监听
  - 若用户 `signal` 在请求发起前已处于 aborted 状态，直接按 `ABORTED` 语义结束请求，不再发出网络请求
- **错误码映射**：
  - 外部 `signal` 或 `client.abort()` 触发的中止 -> `HTTPError(code: 'ABORTED')`
  - 内部 timeout controller 触发的中止 -> 维持现有 `HTTPError(code: 'TIMEOUT')`
- **下载进度**：
  - 仅当存在 `onDownloadProgress` 且 `response.body?.getReader` 可用时启用
  - 进度统计必须集成到单次响应读取流程中，不能先读取 stream 再额外调用 `response.text()` / `response.arrayBuffer()`，避免二次消费 `response.body`
  - `total` 优先取 `Content-Length`，不可解析时为 `0`
  - 默认按 chunk 回调，完成时补一次最终回调；若 `total === 0`，`percent` 固定为 `0`
  - 若运行时不支持流式读取，则回退到现有解析逻辑且不触发下载进度回调
- **上传进度**：Fetch API 不支持上传进度监听，当配置了 `onUploadProgress` 时静默忽略（不报错、不回调）

完成标准：外部 abort 返回 `ABORTED`、内部超时返回 `TIMEOUT`；下载进度在支持 ReadableStream 时被正确调用，且不破坏现有响应解析行为；配置 `onUploadProgress` 时 Fetch 仍可正常请求且不会误回调。

### 3. `XHREngine` 增强 (`engine/xhr.ts`)

- **Signal 支持**：
  - 若 `RequestConfig.signal` 在请求发起前已 aborted，直接按 `ABORTED` 语义结束，不发送请求
  - 否则通过 `signal.addEventListener('abort', handler)` 监听，触发时调用 `xhr.abort()`
  - 请求结束后（`onloadend`）移除 `abort` 监听，避免泄漏
- **错误码映射**：`onabort` / `ontimeout` / `onerror` 分别保持 `ABORTED` / `TIMEOUT` / `NETWORK`，与 `FetchEngine` 语义一致
- **上传/下载进度**：
  - 统一通过一个安全的 `ProgressInfo` 构造逻辑生成回调参数
  - `total` 使用 `e.lengthComputable ? e.total : 0`
  - `percent` 使用 `total > 0 ? clamp(0, 100, Math.floor(loaded / total * 100)) : 0`
  - `xhr.upload.onprogress` 负责上传进度，`xhr.onprogress` 负责下载进度

完成标准：XHR 引擎正确响应 pre-aborted / in-flight aborted 两类 signal 场景；上传/下载进度回调被正确调用，且 `ProgressInfo` 字段值稳定、不出现 `NaN` 或大于 `100` 的 `percent`。

### 4. `HTTPClient` 增强 (`client.ts`)

- `request()` 方法内部重构为调用私有方法 `_executeRequest(originalUrl, originalConfig, retryCount)`，公开的 `request()` 调用 `_executeRequest(url, config, 0)`
- `_executeRequest` 的每次执行都重新跑完整链路：`getRequestConfig()` -> `beforeRequest` -> engine request -> `afterRespond`
- `_executeRequest` 内部构建 `PluginContext`：
  ```
  retry(newConfig?) → 若 retryCount >= MAX_PLUGIN_RETRIES
                     → 抛出 HTTPError(code: 'RETRY_LIMIT_EXCEEDED', message: '超过最大重试次数')
                     → 否则将 newConfig 合并到“原始未经过插件 beforeRequest 改写的请求配置”上
                     → 调用 this._executeRequest(originalUrl, mergedConfig, retryCount + 1)
  ```
- `retry()` 使用第 1 步定义的 `mergeRequestConfig()` 规则，避免 headers/query/回调字段语义不一致
- `afterRespond` 插件调用时传入 `PluginContext` 作为第 4 参数
- `runOnErrorPlugins` 改造：
  - 遍历全部 `onError` 插件
  - 记录第一个返回的 `HTTPResponse` 作为恢复结果
  - 后续插件继续执行，但不再覆盖恢复结果
  - `request()` 的 catch 块检查返回值，非 `undefined` 时作为最终结果返回（错误恢复）
- `getRequestConfig()` 确保新字段 `signal`、`onUploadProgress`、`onDownloadProgress` 能正确透传到引擎

完成标准：插件可通过 `context.retry()` 触发完整请求重试；`onError` 返回 `HTTPResponse` 时请求不抛错而返回该响应，同时其后的 `onError` 插件仍会执行；超过最大重试次数时抛出 `HTTPError(code: 'RETRY_LIMIT_EXCEEDED')`。

### 5. 测试 (`packages/tests/http/`)

在 `packages/tests/http/client.test.ts` 中新增以下测试用例：

- **Per-request signal 终止**：创建 `AbortController`，将 `signal` 传入请求配置，请求发出后调用 `controller.abort()`，断言抛出 `HTTPError` 且 `code === 'ABORTED'`
- **timeout 不被 signal 语义覆盖**：配置超时并模拟 timeout 中止，断言抛出 `HTTPError` 且 `code === 'TIMEOUT'`
- **Plugin retry 上下文**：注册一个 `afterRespond` 插件，首次调用时通过第 4 参数 `context.retry()` 触发重试，第二次调用时正常返回；断言 `mockFetch` 被调用 2 次
- **retry 配置合并规则**：在 `context.retry()` 中覆盖 `headers` / `query` / `timeout` 中的部分字段，断言最终请求遵循计划里定义的合并规则
- **onError 错误恢复**：注册一个 `onError` 插件，返回一个 `HTTPResponse` 对象；mock fetch 抛出错误；断言 `request()` 不抛错且返回值为插件提供的响应
- **onError 恢复不短路后续插件**：注册多个 `onError` 插件，第一个返回 `HTTPResponse`，后续插件执行副作用；断言返回恢复响应且后续插件仍被调用
- **重试上限保护**：注册一个 `afterRespond` 插件，每次都调用 `context.retry()`；断言最终抛出 `HTTPError`，`code === 'RETRY_LIMIT_EXCEEDED'`，且 message 包含 '最大重试次数'

新增 `packages/tests/http/engine.test.ts`，覆盖以下引擎级测试：

- **Fetch 下载进度**：使用可控 `ReadableStream` / mock response body 产生多 chunk 响应，断言 `onDownloadProgress` 的 `loaded`、`total`、`percent` 与回调次数符合预期
- **Fetch 上传进度忽略策略**：配置 `onUploadProgress`，断言请求正常完成且该回调未被调用
- **XHR signal 预中止**：请求发起前先让 `signal.aborted === true`，断言不会发送请求且抛出 `ABORTED`
- **XHR 上传/下载进度**：通过 XHR mock 手动触发 `upload.onprogress` / `onprogress`，断言 `ProgressInfo` 计算稳定且 `percent` 不越界
- 运行完整测试套件确保所有现有测试通过

完成标准：所有新增测试用例通过；所有现有测试用例通过。

## 影响范围

- `packages/http/src/types.ts` — `RequestConfig` 扩展字段；`ProgressInfo`；`PluginContext`；`HttpErrorCode` 增加 `RETRY_LIMIT_EXCEEDED`；`ClientPlugin.afterRespond` / `onError` 签名扩展
- `packages/http/src/client.ts` — 导出 `mergeRequestConfig`、`MAX_PLUGIN_RETRIES`；`_executeRequest`、插件 `retry` 与 `onError` 恢复逻辑
- `packages/http/src/engine/fetch.ts` — 用户/超时 `signal` 合并；`ABORTED`/`TIMEOUT` 区分；下载进度流式读取；Fetch 忽略上传进度
- `packages/http/src/engine/xhr.ts` — `signal`、上传/下载进度与 `ProgressInfo`
- `packages/tests/http/client.test.ts` — signal/超时、merge、retry、onError、重试上限等用例
- `packages/tests/http/engine.test.ts` — Fetch/XHR 引擎级用例（相对路径引用 `../../http/src/engine/*`）
- 公开行为变更需重点核对：
  - `RequestConfig` 新增 `signal`、`onUploadProgress`、`onDownloadProgress`
  - `ClientPlugin.afterRespond` 新增第 4 个可选参数 `context`
  - `ClientPlugin.onError` 允许返回 `HTTPResponse` 进行错误恢复
  - `HttpErrorCode` 新增 `RETRY_LIMIT_EXCEEDED`
  - Fetch / XHR 的 abort、timeout、progress 语义在两种引擎间保持一致

## 历史补丁
