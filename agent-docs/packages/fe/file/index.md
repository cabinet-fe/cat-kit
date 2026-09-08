---
title: "file 文件分块读取与下载"
description: "@cat-kit/fe 的文件处理模块：readChunks 按 Blob.slice() 分块异步读取 Blob/File（for-await 遍历、break 提前退出），saveBlob 通过 Object URL + a[download] 触发浏览器下载。"
aliases: [file chunks, 文件读取, 文件下载, blob 下载, 大文件处理]
keywords: [readChunks, saveBlob, ReadChunksOptions, chunkSize, offset, Uint8Array, AsyncGenerator, 分块读取, 分片上传, 文件下载, 计算哈希]
---

# file 文件分块读取与下载

`@cat-kit/fe` 的 `file` 模块导出两个函数：`readChunks` 用 `Blob.slice()` + `arrayBuffer()` 按固定块大小异步读取 `Blob`/`File`，产出 `Uint8Array`；`saveBlob` 用 `Object URL` + `a[download]` 触发浏览器下载一个 `Blob`。典型用途是大文件哈希计算、分片上传与前端生成文件下载。

## 安装

```bash
npm install @cat-kit/fe
```

全部导出仅从包根提供：`import { readChunks, saveBlob } from '@cat-kit/fe'`。

运行前提：`readChunks` 需要运行环境支持 `Blob`（浏览器原生支持）；`saveBlob` 需要浏览器 DOM（`document` 与 `URL.createObjectURL`），仅浏览器可用。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `readChunks` | 分块读取 `Blob`/`File`，返回 `AsyncGenerator<Uint8Array>`，支持 `for await` 与 `break` 提前退出 | `packages/fe/file/apis.md` |
| `ReadChunksOptions` | `readChunks` 选项：`chunkSize`（默认 10MB）、`offset`（默认 0）（类型） | `packages/fe/file/apis.md` |
| `saveBlob` | 触发浏览器下载一个 `Blob`，同步无返回值 | `packages/fe/file/apis.md` |
