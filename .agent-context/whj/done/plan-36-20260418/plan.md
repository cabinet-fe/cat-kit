# http 插件注册 API 与 engine 结构性收敛

> 状态: 已执行

## 目标

当前 `@cat-kit/http` 的插件只能在构造 `HTTPClient` 时通过 `config.plugins` 一次性注入。真实项目中，错误消息提示、全局 loading、业务埋点等插件依赖应用侧上下文，必须延迟到初始化之后才能装配。因此需为 `HTTPClient` 提供 `registerPlugin` 方法，并利用插件已有的 `name` 字段强制校验唯一性，避免重复注册导致重复副作用。

同时本计划顺带修复引擎评估中发现的**结构性瑕疵**：

- 对外暴露 `HttpEngine` 基类与内置引擎实现，支持用户注入自定义引擎；
- 修正抽象签名与实现不一致、冗余代码；
- 修正 `AGENTS.md` 中 `engine/` 目录描述与实际文件的偏差。

`group()` 派生出的子 client 必须具备如下插件继承语义：**父影响子、子不影响父、子可在父的基础上追加自己的插件**。本计划需实现这一模型，且同名校验跨父子层级生效。

### 已知 / 假设 / 待确认

- 已知：`HTTPClientPlugin.name` 为必填字段（`types.ts` 第 180 行已定义）；内置三个插件均已填写 `token` / `retry` / `method-override`。
- 已知：测试文件当前用 `TokenPlugin` / `MethodOverridePlugin` 命名引入，而源码导出名为 `HTTPTokenPlugin` / `HTTPMethodOverridePlugin`，属历史遗留问题，**不在本计划范围**。
- 已知：`MAX_PLUGIN_RETRIES` 为内部重试上限，与本次插件注册无关，不动。
- 假设：`engine` 注入点放在 `ClientConfig.engine` 字段上，接收 `HttpEngine` 实例；未传时保持现有自动选择逻辑。
- 假设：跨父链重复 `name` 同样视为冲突；子 client 不能注册与父链已有插件同名的插件。
- 假设：每次请求在入口拍一次 `effectivePlugins` 快照并贯穿 `beforeRequest` / `afterRespond` / `onError` 三个阶段，**请求中途注册的插件不影响本次请求**，以保证语义稳定可预期。

## 内容

### 步骤 1：Engine 抽象与实现层修正

文件：`packages/http/src/engine/engine.ts`

- 抽象方法签名改为 `abstract request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>`，删掉 `options?` 的可选写法并将形参名统一为 `config`。JSDoc 中的参数名同步改为 `config`。

文件：`packages/http/src/engine/fetch.ts`

- 删除空的 `constructor() { super() }`。其他逻辑保持不变。

文件：`packages/http/src/engine/xhr.ts`

- 删除 `sendHeaders` 方法中对 `xhr.withCredentials = true` 的赋值语句（连同 `if (credentials !== false)` 判空分支整体删除）。`request()` 开头已按 `credentials` 统一设置，无需重复。
- `sendHeaders` 简化后只保留 `setRequestHeader` 循环，并把参数裁剪为 `sendHeaders(xhr: XMLHttpRequest, headers: Record<string, string>)`，调用处 `this.sendHeaders(xhr, headers)` 同步更新。

### 步骤 2：新增 `engine/index.ts` 作为引擎子模块的统一出口

文件：`packages/http/src/engine/index.ts`（**新建**）

- 导出 `HttpEngine`（从 `./engine`）、`XHREngine`（从 `./xhr`）、`FetchEngine`（从 `./fetch`）。
- **不**导出 `shared.ts` 中的工具函数（属内部细节）。
- 文件顶部加入模块级 JSDoc：`HTTP 引擎层：抽象基类 + 内置实现。用户可实现 HttpEngine 子类并通过 ClientConfig.engine 注入。`

### 步骤 3：`types.ts` 扩展 `HttpErrorCode` 与 `ClientConfig`

文件：`packages/http/src/types.ts`

3.1 `HttpErrorCode` 类型并集中新增 `'PLUGIN'`：

```ts
export type HttpErrorCode =
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NETWORK'
  | 'PARSE'
  | 'UNKNOWN'
  | 'RETRY_LIMIT_EXCEEDED'
  | 'PLUGIN'
```

3.2 在文件顶部追加 `import type { HttpEngine } from './engine/engine'`，与现有 `client.ts` 对 `HttpEngine` 的引用路径保持一致。

3.3 `ClientConfig` 接口追加可选字段：

```ts
/**
 * 自定义请求引擎
 * - 未传入时，自动选择 FetchEngine（全局 fetch 可用）或 XHREngine
 * - 可传入自定义 HttpEngine 子类实例以对接其他底层（如 undici、msw mock）
 */
engine?: HttpEngine
```

3.4 其它字段保持不变；`ClientConfig` 中已有的 `plugins?: HTTPClientPlugin[]` 字段**继续保留不动**，构造函数仍以它为初始插件来源。

### 步骤 4：`HTTPClient` 重构：引擎注入 + 插件注册 + 父子继承

文件：`packages/http/src/client.ts`

4.1 **新增字段与构造函数改造**

- 在类上新增两个字段声明：
  - `private parent?: HTTPClient`（仅由 `group()` 内部赋值；根 client 为 `undefined`）
  - `private ownPlugins: HTTPClientPlugin[] = []`（当前 client 自身持有的插件列表）
- `engine` 字段初始化改为：`this.engine = config.engine ?? (typeof fetch === 'undefined' ? new XHREngine() : new FetchEngine())`。
- 构造函数末尾遍历 `config.plugins ?? []`，对每个元素依次调用 `this.registerPluginInternal(plugin)`。构造阶段若同一批次内或与已进入 `ownPlugins` 的插件 `name` 冲突 → 由 `registerPluginInternal` 抛 `HTTPError`（见 4.4）。
- `this.config` 仍保留并赋值，但**后续不再通过 `this.config.plugins` 读取插件**；保留字段是为了 `group()` 传递 `origin` / `timeout` / `credentials` / `headers`。

  4.2 **新增 `private getEffectivePlugins(): HTTPClientPlugin[]`**

- 实现：`return [...(this.parent?.getEffectivePlugins() ?? []), ...this.ownPlugins]`。
- 语义：父链在前、子在后；与注册顺序一致。

  4.3 **`_executeRequest` 与 `runOnErrorPlugins` 改造（重点）**

- 在 `_executeRequest` 入口获取**一次**快照：`const effectivePlugins = this.getEffectivePlugins()`，在本次调用的全部阶段（beforeRequest / afterRespond / afterRespond-on-error-recovery / 调用 `runOnErrorPlugins`）统一使用这份快照。
- 把 `runOnErrorPlugins(error, context)` 签名改为 `runOnErrorPlugins(error, context, plugins: HTTPClientPlugin[])`，由 `_executeRequest` 把快照传入；内部不再读取 `this.config.plugins`。
- **以下所有位置全部替换**（共 5 处，逐一点名以避免遗漏）：
  1. `runOnErrorPlugins` 内 `if (!this.config.plugins?.length)` → `if (!plugins.length)`
  2. `runOnErrorPlugins` 内 `for (const plugin of this.config.plugins)` → `for (const plugin of plugins)`
  3. `_executeRequest` 内 `if (this.config.plugins?.length)`（beforeRequest 段） → `if (effectivePlugins.length)`
  4. `_executeRequest` 内 `if (this.config.plugins?.length)`（afterRespond 段） → `if (effectivePlugins.length)`
  5. `_executeRequest` catch 内 `this.config.plugins?.length`（afterRespond 错误恢复段） → `effectivePlugins.length`
- 相应的 `for (const plugin of this.config.plugins)` 循环也改为遍历 `effectivePlugins`。

  4.4 **新增 `public registerPlugin(plugin: HTTPClientPlugin): void`**

- 参数校验：`plugin == null || typeof plugin !== 'object' || typeof plugin.name !== 'string' || plugin.name === ''` 时抛 `new HTTPError('插件必须提供非空 name 字段', { code: 'PLUGIN' })`。
- 校验通过 → 调用 `this.registerPluginInternal(plugin)`。
- 方法上写 JSDoc：说明用途、返回值、冲突时抛出 `HTTPError({ code: 'PLUGIN' })`、以及"跨父链重名同样会冲突"的语义。

  4.5 **新增 `private registerPluginInternal(plugin: HTTPClientPlugin): void`**

- 计算 `const existingNames = new Set(this.getEffectivePlugins().map(p => p.name))`。
- 若 `existingNames.has(plugin.name)` → 抛 `new HTTPError(`插件名称冲突: ${plugin.name}`, { code: 'PLUGIN' })`。
- 通过后 `this.ownPlugins.push(plugin)`。

  4.6 **`group()` 改造**

- 新实现：
  ```ts
  group(prefix: string): HTTPClient {
    const child = new HTTPClient($str.joinUrlPath(this.prefix, prefix), {
      origin: this.config.origin,
      timeout: this.config.timeout,
      credentials: this.config.credentials,
      headers: this.config.headers,
      engine: this.engine
    })
    child.parent = this
    return child
  }
  ```
- 构造子 client 时**不再传递** `plugins` 字段；插件通过 `parent` 链运行时收集。
- `child.parent = this` 利用 TS 中同类实例可互访 `private` 字段，无需额外 setter。
- 注释说明："子 client 继承父链插件；父后续 registerPlugin 会自动反映到子（父影响子）；子 registerPlugin 仅改动 `child.ownPlugins`（子不影响父）。"
- 共享 `engine` 实例是有意为之（`abort()` 会中止父或子任意一方对该引擎的所有在途请求），这点在方法 JSDoc 中注明，避免被误改。

### 步骤 5：更新 `src/index.ts` 导出

文件：`packages/http/src/index.ts`

- 在现有 `export * from ...` 列表中追加 `export * from './engine'`，把 `HttpEngine` / `XHREngine` / `FetchEngine` 暴露到包顶层。
- 其他既有 `export * from ...` 保持不变。

### 步骤 6：新增测试用例

文件：`packages/tests/http/client-register-plugin.test.ts`（**新建**）

- 引入：`import { HTTPClient, HTTPError } from '@cat-kit/http'` 与 `vitest` 全局 API。
- Mock：沿用 `client.test.ts` 的 `global.fetch = vi.fn()` 模式，回 200 空 JSON。
- 测试用例（**覆盖 6 个场景**）：
  1. `registerPlugin` 能成功注册并在请求时按注册顺序调用 `beforeRequest` / `afterRespond`。
  2. 构造函数传入同 name 的两个插件 → 抛 `HTTPError` 且 `code === 'PLUGIN'`。
  3. `registerPlugin` 传入 `{ name: '' }` / `{}` / `null` → 抛 `HTTPError` 且 `code === 'PLUGIN'`。
  4. `registerPlugin` 传入已存在同 name 插件 → 抛 `HTTPError` 且 `code === 'PLUGIN'`。
  5. 子 client 通过 `group()` 派生，断言：发请求时父插件的钩子先于子插件执行（验证"父在前、子在后"）；父在派生之后 `registerPlugin` 新插件，子的请求也能看到该插件（验证"父影响子"）。
  6. 子 client `registerPlugin` 后，父 client 再发请求不应触发该插件（验证"子不影响父"）；且子 client 注册与父链重名的插件应抛错。
- 所有断言使用 `expect(...).toBe(...)` / `.toThrowError(HTTPError)` / `.rejects.toThrow(HTTPError)` 等 Vitest 标准 API。

### 步骤 7：同步 `packages/http/AGENTS.md` 目录结构与约束

文件：`packages/http/AGENTS.md`

- 对目录结构代码块进行**仅替换 `engine/` 整段**的修改：保留 `plugins/`、`client.ts`、`types.ts`、`index.ts` 各行不动，将 `engine/` 子树改为：
  ```
  ├── engine/            # 请求引擎
  │   ├── engine.ts      # HttpEngine 抽象基类
  │   ├── xhr.ts         # XMLHttpRequest 引擎
  │   ├── fetch.ts       # Fetch API 引擎
  │   ├── shared.ts      # 引擎间共享工具
  │   └── index.ts       # 统一导出
  ```
- 「核心架构」小节末尾追加一条 bullet：`支持通过 ClientConfig.engine 注入自定义 HttpEngine 子类实例以替换底层。`
- 「约束」小节末尾追加两条 bullet：
  - `插件必须填写唯一的非空 name 字段；HTTPClient 构造时的 config.plugins 与运行时 registerPlugin 都会强制校验唯一性，冲突抛 HTTPError({ code: 'PLUGIN' })。`
  - `HTTPClient.group() 派生的子 client 通过父链继承插件（父影响子、子不影响父），同名校验跨父子层级生效。`

### 步骤 8：同步 README（条件执行）

文件：`packages/http/README.md`

- 用 Grep 搜索 README 内是否出现 `registerPlugin` 或"插件注册"相关章节。
  - 若已有插件用法示例小节（例如 `## 插件` 或类似） → 在其末尾追加 `registerPlugin` 的最小示例（3–5 行代码，演示后置注册）。
  - 若没有插件相关章节 → 本步骤跳过，不新增章节。

### 步骤 9：lint 与格式化

- 运行 `bunx oxlint packages/http/src`，修正本次改动引入的 lint 错误（若有）；若报错来自本计划未触碰的文件，不修正。
- 运行 `bunx oxfmt --write packages/http/src packages/http/AGENTS.md packages/tests/http/client-register-plugin.test.ts`。

## 影响范围

- `packages/http/src/engine/engine.ts`：抽象 `request` 签名参数名/JSDoc 由 `options?` 改为必填 `config`。
- `packages/http/src/engine/fetch.ts`：删除空 `constructor`。
- `packages/http/src/engine/xhr.ts`：简化 `sendHeaders` 签名与实现，移除重复的 `xhr.withCredentials` 赋值分支；调用点同步更新。
- `packages/http/src/engine/index.ts`：**新建**，统一导出 `HttpEngine` / `FetchEngine` / `XHREngine`。
- `packages/http/src/types.ts`：`HttpErrorCode` 追加 `'PLUGIN'`；`ClientConfig` 追加 `engine?: HttpEngine` 字段；顶部新增 `HttpEngine` 类型导入。
- `packages/http/src/client.ts`：新增 `parent` / `ownPlugins` 字段；构造函数支持 `config.engine` 注入与构造期插件注册；新增 `registerPlugin` / `registerPluginInternal` / `getEffectivePlugins`；`_executeRequest` / `runOnErrorPlugins` 改为基于入口快照的 `effectivePlugins`；`group()` 改为父子继承派生，不再透传 `plugins`，共享 `engine` 实例。
- `packages/http/src/index.ts`：追加 `export * from './engine'`。
- `packages/http/AGENTS.md`：更新 `engine/` 目录子树，「核心架构」追加自定义引擎说明，「约束」追加插件唯一性与父子继承两条。
- `packages/http/README.md`：插件系统末尾新增“运行时动态注册插件”最小示例。
- `packages/tests/http/client-register-plugin.test.ts`：**新建**，覆盖 6 个场景。
- `packages/tests/http/client.test.ts`：补全 10 处匿名插件 fixture 的 `name` 字段（patch-1）。
- `packages/tests/http/engine.test.ts`：移除 `MockXHR` 未读字段 `_method` / `_url`，`open()` 形参以下划线标记未使用（patch-1）。
- `packages/tests/http/plugins.test.ts`：以 `import as` 别名修正 `HTTPTokenPlugin` / `HTTPMethodOverridePlugin` 的导入名不匹配（patch-1）。
- `packages/tests/tsconfig.json`：`include` 扩展各工作区包源码目录，修复 composite 项目 `TS6307` 报错（patch-1）。
- `packages/http/README.md`：同步插件 API 新名称、`ClientConfig` / `HTTPClientPlugin` 声明、错误码表与父子插件继承说明，新增「迁移说明」小节（patch-2）。
- `packages/tests/AGENTS.md`：「测试范围」列表与 `df3257a` 删包后的实际 workspace 对齐（移除 excel、maintenance，新增 cli）（patch-2）。

## 历史补丁

- patch-1: 修复 http 包类型错误
- patch-2: 补充插件 API 重命名迁移说明 + 同步 tests 测试范围文档
