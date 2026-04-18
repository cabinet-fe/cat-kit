# @cat-kit/http - HTTP 客户端

基于插件架构的现代 HTTP 客户端，提供灵活的引擎抽象和插件系统。

**依赖**：`@cat-kit/core`
**运行环境**：通用（取决于所用引擎）

## 核心架构

- **引擎（Engine）**：底层请求执行（XHR / Fetch），可替换
- **插件（Plugin）**：横切关注点（认证、拦截、重试等），通过 `beforeRequest` / `afterRespond` / `onError` 钩子介入
- **客户端（Client）**：用户交互的高级 API，管理引擎和插件
- 支持通过 `ClientConfig.engine` 注入自定义 `HttpEngine` 子类实例以替换底层。

## 目录结构

```
packages/http/src/
├── engine/            # 请求引擎
│   ├── engine.ts      # HttpEngine 抽象基类
│   ├── xhr.ts         # XMLHttpRequest 引擎
│   ├── fetch.ts       # Fetch API 引擎
│   ├── shared.ts      # 引擎间共享工具
│   └── index.ts       # 统一导出
├── plugins/           # 内置插件
│   ├── token.ts       # Token 管理插件（含刷新/排队/响应级重试）
│   ├── retry.ts       # 通用重试插件（onError + 退避）
│   ├── method-override.ts  # HTTP 方法覆盖插件
│   └── index.ts
├── client.ts          # HTTP 客户端实现
├── types.ts           # 类型定义
└── index.ts           # 主导出文件
```

**当 `http/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- 基础工具函数从 `@cat-kit/core` 导入，禁止重复实现
- 插件返回新配置对象而非修改原配置（不可变原则）
- 新增插件放 `src/plugins/`，新增引擎放 `src/engine/`
- 客户端、类型与内置插件均由 `src/index.ts` 重导出；`package.json` 另提供 `@cat-kit/http/plugins` 子路径以便按需分包
- 插件必须填写唯一的非空 name 字段；`HTTPClient` 构造时的 `config.plugins` 与运行时 `registerPlugin` 都会强制校验唯一性，冲突抛 `HTTPError({ code: 'PLUGIN' })`。
- `HTTPClient.group()` 派生的子 client 通过父链继承插件（父影响子、子不影响父），同名校验跨父子层级生效。
