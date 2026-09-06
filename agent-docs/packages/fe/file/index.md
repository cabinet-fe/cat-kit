---
title: "@cat-kit/fe 文件处理"
description: 分块读取 Blob/File 与触发浏览器下载保存 Blob
keywords:
  - readChunks
  - saveBlob
  - 分块读取
  - Blob
  - File
  - 分片上传
  - 文件下载
  - chunkSize
aliases:
  - file chunks
  - 文件读取
  - blob 下载
  - 大文件处理
---

# fe — 浏览器文件

`@cat-kit/fe` 的文件处理模块提供两个能力：用 `readChunks` 按块异步读取 `Blob`/`File`（基于 `Blob.slice()` + `arrayBuffer()`，支持 `for await` 遍历与 `break` 提前退出），以及用 `saveBlob` 触发浏览器下载保存一个 `Blob`。

## 适用场景

分块读取 `Blob`/`File`（如计算大文件哈希、分片上传），或触发 Blob 下载。

## 推荐 API

`readChunks`、`saveBlob`

```ts
import { readChunks, saveBlob } from '@cat-kit/fe'

for await (const chunk of readChunks(file, { chunkSize: 1024 * 1024 })) {
  void chunk
}
saveBlob(new Blob(['hi']), 'hello.txt')
```

完整签名见 [apis.md](apis.md)。

## 注意事项

- 调用方保证 `chunkSize > 0` 且 `0 <= offset <= file.size`；`chunkSize: 0` 不会前进
- `saveBlob` 依赖浏览器下载能力，适用于通常小于 500MB 的文件（`Object URL` + `a[download]` 方式）
