# 修复 HTTP 客户端已知缺陷

## 补丁内容

修复上一轮代码审查中发现的 6 个缺陷，不引入新功能，不过度设计：

1. **修复 `runOnErrorPlugins` 静默吞异常**
   - 去掉 `catch {}`，`onError` 抛错与 `beforeRequest`/`afterRespond` 行为一致，便于插件调试。

2. **修正 `credentials` 文档描述**
   - 原描述"默认在同源请求时发送凭证"与实际代码（`credentials: 'include'` / `withCredentials = true`）不符，已修正为"默认发送，跨域请求也会携带凭证"。

3. **对齐双引擎多值 header 行为**
   - `XHREngine.parseHeaders` 中，仅 `set-cookie` 保留数组形式，其余多值 header 用 `, ` 合并，与 `FetchEngine` / Fetch API 标准行为一致。

4. **`ClientConfig` 支持更多全局默认值**
   - 新增 `responseType` / `signal` / `onUploadProgress` / `onDownloadProgress`，可在 `ClientConfig` 级别统一设置并由单次请求覆盖；`group()` 子 client 自动继承。

5. **HTTPTokenPlugin 刷新令牌过期使用更准确的错误码**
   - 新增 `HttpErrorCode = 'AUTH'`；将原先 `'UNKNOWN'` 替换为 `'AUTH'`，语义更清晰。

6. **消除 FetchEngine 解码逻辑重复**
   - 提取 `parseJSONBody` 私有方法，供 `parseResponseData` 与 `decodeBytes`（原 `decodeResponseBody`）共用，减少重复代码。

## 影响范围

- 修改文件: `packages/http/src/client.ts`
- 修改文件: `packages/http/src/types.ts`
- 修改文件: `packages/http/src/engine/fetch.ts`
- 修改文件: `packages/http/src/engine/xhr.ts`
- 修改文件: `packages/http/src/plugins/token.ts`
- 修改文件: `packages/http/test/client.test.ts`
- 修改文件: `packages/http/test/engine.test.ts`
- 修改文件: `packages/http/test/plugins.test.ts`
- 修改文件: `packages/http/README.md`
- 修改文件: `docs/content/packages/http/client.md`
- 修改文件: `docs/content/packages/http/types.md`
- 修改文件: `skills/cat-kit-http/generated/index.d.ts`（通过 `bun run sync-cat-kit-skills-api` 自动刷新）
