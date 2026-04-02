# 审查修复：主导出、Token 边界、文档与测试

## 补丁内容

- 在 `packages/http/src/index.ts` 增加 `export * from './plugins'`，使 `@cat-kit/http` 与 `@cat-kit/http/src` 均可导入内置插件，消除与 plan-26 完成标准及既有 JSDoc 示例的偏差，并避免仅使用子路径 `dist` 时的隐性破坏性变更。
- `TokenPlugin` 的 `afterRespond`：在配置了 `shouldRefresh` 但未配置 `onRefresh` 时不再调用 `context.retry()`，避免无意义重试直至 `MAX_PLUGIN_RETRIES`；补充 `shouldRefresh` 的 JSDoc 说明。
- `RequestConfig` 增加 `@internal` 的 `_retryAttempt?: number`；`RetryPlugin` 直接读取该字段，与 `mergeRequestConfig` 行为一致。
- `packages/http/AGENTS.md`：约束改为「主导出重导出插件 + 子路径按需分包」。
- `skills/use-cat-kit/references/http/plugins.md`：同步 `ClientPlugin` 签名（`afterRespond` 第四参、`onError` 可恢复）、`TokenPlugin`/`RetryPlugin` 说明与导入方式。
- 测试：`packages/tests/http/plugins.test.ts` 统一从 `@cat-kit/http/src` 引入（符合集中测试约定，避免 `HTTPClient` 走源码而插件走陈旧 `dist` 的不一致）；新增「仅 `shouldRefresh` 无 `onRefresh`」与「默认退避首次 1000ms」用例。

## 影响范围

- 修改文件: `packages/http/src/index.ts`
- 修改文件: `packages/http/src/plugins/token.ts`
- 修改文件: `packages/http/src/types.ts`
- 修改文件: `packages/http/src/plugins/retry.ts`
- 修改文件: `packages/http/AGENTS.md`
- 修改文件: `packages/tests/http/plugins.test.ts`
- 修改文件: `skills/use-cat-kit/references/http/plugins.md`
