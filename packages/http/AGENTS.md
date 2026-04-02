# @cat-kit/http - HTTP 客户端

基于插件架构的现代 HTTP 客户端，提供灵活的引擎抽象和插件系统。

**依赖**：`@cat-kit/core`
**运行环境**：通用（取决于所用引擎）

## 核心架构

- **引擎（Engine）**：底层请求执行（XHR / Fetch），可替换
- **插件（Plugin）**：横切关注点（认证、拦截、重试等），通过 `beforeRequest` / `afterRespond` / `onError` 钩子介入
- **客户端（Client）**：用户交互的高级 API，管理引擎和插件

## 目录结构

```
packages/http/src/
├── engine/            # 请求引擎
│   ├── xhr.ts         # XMLHttpRequest 引擎
│   ├── fetch.ts       # Fetch API 引擎
│   └── index.ts
├── plugins/           # 内置插件
│   ├── token.ts       # Token 管理插件
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
- 所有公共 API 通过 `src/index.ts` 统一导出
