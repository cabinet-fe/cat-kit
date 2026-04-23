# 修复 @cat-kit/http 已知缺陷

> 状态: 已执行

## 目标

修复上一轮探索中发现的 6 个缺陷，不引入新功能，不过度设计。

## 内容

1. **修复 `runOnErrorPlugins` 静默吞异常**
   - `packages/http/src/client.ts`: 去掉 `catch {}`，让 `onError` 抛错与 `beforeRequest`/`afterRespond` 一致
   - `packages/http/test/client.test.ts`: 新增测试

2. **修正 `credentials` 文档与安全行为不符**
   - `packages/http/src/types.ts` (JSDoc)
   - `packages/http/README.md`
   - `docs/content/packages/http/client.md`
   - `docs/content/packages/http/types.md`

3. **对齐双引擎多值 header 行为**
   - `packages/http/src/engine/xhr.ts`: `parseHeaders` 中除 `set-cookie` 外多值 header 用逗号+空格合并
   - `packages/http/test/engine.test.ts`: 更新断言

4. **`ClientConfig` 支持 `responseType` / `signal` / `onUploadProgress` / `onDownloadProgress` 全局默认值**
   - `packages/http/src/types.ts`: `ClientConfig` 接口新增字段
   - `packages/http/src/client.ts`: `getRequestConfig()` 与 `group()` 纳入合并/传递
   - `packages/http/test/client.test.ts`: 新增测试

5. **HTTPTokenPlugin 刷新令牌过期使用更准确的错误码**
   - `packages/http/src/types.ts`: `HttpErrorCode` 新增 `'AUTH'`
   - `packages/http/src/plugins/token.ts`: `'UNKNOWN'` → `'AUTH'`
   - `packages/http/test/plugins.test.ts`: 更新断言

6. **消除 FetchEngine 解码逻辑重复**
   - `packages/http/src/engine/fetch.ts`: 提取 `decodeResponseBody` 供 `parseResponseData` 与 `parseResponseWithDownloadProgress` 共用

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

## 历史补丁

- patch-1: 修复 HTTP 客户端已知缺陷
