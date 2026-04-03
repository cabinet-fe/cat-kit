# @cat-kit/fe 模块精简与 API 现代化

> 状态: 已执行

## 目标

精简 `@cat-kit/fe` 包中不实用的 API，现代化保留的 API，并同步更新文档和 skills 引用。

## 内容

### 1. 重构 `file/saver.ts`

- 移除 `SaveOptions`、`StreamSaveOptions` 接口
- 移除 `createWritableStream`、`saveFromStream`、`saveFromURL` 函数
- 将 `saveFromBlob` 重命名为 `saveBlob`，保留原有实现
- 更新 `packages/fe/src/index.ts` 的导出

### 2. 移除 `storage/idb.ts`

- 删除 `packages/fe/src/storage/idb.ts` 文件
- 从 `packages/fe/src/storage/index.ts` 中移除 `export * from './idb'`

### 3. 重构 `storage/storage.ts`

- 不再导出 `WebStorage` 类，改为导出 `storage` 对象
- `storage` 对象拥有两个属性：`session`（基于 `sessionStorage`）和 `local`（基于 `localStorage`）
- 保留 `storageKey`、`ExtractStorageKey` 类型导出
- `WebStorage` 类本身保留但不导出（内部使用）
- 更新 `packages/fe/src/storage/index.ts` 的导出

### 4. 现代化 `file/read.ts`

- 移除旧的 `readFile` 函数
- 新增 `readChunks(file, options?)` 函数，返回 `AsyncGenerator<Uint8Array>`
- 使用 `Blob.slice()` + `arrayBuffer()` 替代 FileReader
- 参数：`file: Blob | File`，`options?: { chunkSize?: number; offset?: number }`
- 支持 `for await...of` 遍历，支持 `break` 提前退出

### 5. 同步更新 skills 引用

- 更新 `skills/use-cat-kit/references/fe/file.md`：移除流式保存 API，更新 readFile → readChunks
- 更新 `skills/use-cat-kit/references/fe/storage.md`：移除 IDB 部分，更新 WebStorage → storage 对象
- 更新 `skills/use-cat-kit/SKILL.md` 导航表中的 fe/storage 和 fe/file 描述

### 6. 同步更新 docs

- 更新 `docs/content/packages/fe/file.md`：移除流式保存相关内容，更新 readFile → readChunks，更新 API 签名
- 更新 `docs/content/packages/fe/storage.md`：移除 IDB 部分，更新 WebStorage → storage 对象用法，更新 API 签名

### 7. 更新测试

- 查找并更新 `packages/tests/` 下对应的测试文件，确保引用与新 API 一致

## 影响范围

- `packages/fe/src/file/saver.ts` — 重写，仅保留 `saveBlob`
- `packages/fe/src/file/read.ts` — 重写，`readFile` → `readChunks`（AsyncGenerator），提取 `ReadChunksOptions` 接口
- `packages/fe/src/storage/idb.ts` — 已删除
- `packages/fe/src/storage/storage.ts` — 不再导出 `WebStorage` 类，导出 `storage` 对象（lazy getter），移除无用泛型
- `packages/fe/src/storage/index.ts` — 移除 idb 导出
- `packages/tests/fe/file.test.ts` — 重写，测试 `saveBlob` 和 `readChunks`
- `packages/tests/fe/storage.test.ts` — 改用 `storage` 对象测试
- `packages/tests/fe/idb.test.ts` — 已删除
- `skills/use-cat-kit/SKILL.md` — 更新 fe 模块导航表
- `skills/use-cat-kit/references/fe/file.md` — 更新为 `readChunks` + `saveBlob`
- `skills/use-cat-kit/references/fe/storage.md` — 移除 IDB，更新为 `storage` 对象
- `docs/content/packages/fe/file.md` — 全面更新 API 文档
- `docs/content/packages/fe/storage.md` — 移除 IDB 部分，更新 storage 用法

## 历史补丁

- patch-1: 审查问题修复
