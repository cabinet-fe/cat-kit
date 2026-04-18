# 补充插件 API 重命名迁移说明 + 同步 tests 测试范围文档

## 补丁内容

review 审查发现 plan-36 的实施存在两处文档遗漏，本补丁予以修补。

### 1. `packages/http/README.md`：补齐插件 API 重命名的迁移说明与 API 名同步

`plan-36` 在实施中一并完成了 `ClientPlugin` → `HTTPClientPlugin`、`TokenPlugin` → `HTTPTokenPlugin`、`MethodOverridePlugin` → `HTTPMethodOverridePlugin` 及对应 `*Options` 的重命名（`git diff df3257a~1 df3257a -- packages/http/src/plugins packages/http/src/types.ts` 可证），并把 `HTTPClientPlugin.name` 从可选改为必填且唯一。但 `README.md` 对此毫无提及，仍然用旧名做示例，会让升级者遇到 `TS2305`/`TS2724` 时无处下手。

- 「特性」列表：`内置 TokenPlugin 与 MethodOverridePlugin` → `内置 HTTPTokenPlugin、HTTPMethodOverridePlugin 与 RetryPlugin`（顺带补上 `RetryPlugin`）。
- 「配置说明」的 `ClientConfig` 伪代码：`plugins?: ClientPlugin[]` → `plugins?: HTTPClientPlugin[]`，并新增 `engine?: HttpEngine` 字段以反映 plan-36 步骤 3。
- 「插件系统」的 `ClientPlugin` 接口声明：整体改为 `HTTPClientPlugin`，显式加上必填 `name`，`afterRespond` 签名补 `context?: PluginContext`，`onError` 返回类型改为 `HTTPResponse | void | Promise<HTTPResponse | void>`，以反映当前类型。
- 子章节与示例代码：`TokenPlugin` → `HTTPTokenPlugin`、`MethodOverridePlugin` → `HTTPMethodOverridePlugin`，示例保持语义不变。
- 「错误处理」的错误码列表补 `RETRY_LIMIT_EXCEEDED` 与 `PLUGIN` 两项。
- 「请求分组」章节追加一段父子插件继承与 `engine` 共享的说明。
- **新增「迁移说明」小节**：以对照表列出 5 个旧名 → 新名映射，并声明 `RetryPlugin` / `RetryPluginOptions` 不变；说明内置插件已自带 `name`（`token` / `method-override` / `retry`），用户自定义插件需补 `name`，冲突时抛 `HTTPError({ code: 'PLUGIN' })`。

### 2. `packages/tests/AGENTS.md`：同步「测试范围」列表

commit `df3257a refactor: 移除部分包` 删除了 `packages/excel` 与 `packages/maintenance`，并新增了 `packages/cli`，但 `packages/tests/AGENTS.md` 的「测试范围」列表没有跟进：

- 移除 `packages/excel`
- 移除 `packages/maintenance`
- 新增 `packages/cli`

修订后的列表与 `patch-1` 更新的 `packages/tests/tsconfig.json` 的 `include` 完全对齐。

## 影响范围

- 修改文件:
  - `packages/http/README.md`
  - `packages/tests/AGENTS.md`
