---
title: "@cat-kit/fe 文件处理 API"
description: readChunks 分块读取与 saveBlob 保存的类型签名
keywords:
  - readChunks
  - ReadChunksOptions
  - saveBlob
  - AsyncGenerator
  - chunkSize
  - offset
  - 分块读取
  - Uint8Array
aliases:
  - file api
  - blob 读取
  - 文件签名
  - stream read
---

# 浏览器文件 — API

本篇列出 `@cat-kit/fe` 文件处理模块的公共类型签名。

```ts
interface ReadChunksOptions {
  /** 每次读取的块大小，默认 10MB */
  chunkSize?: number
  /** 开始读取的偏移量 */
  offset?: number
}

declare function readChunks(
  file: Blob | File,
  options?: ReadChunksOptions
): AsyncGenerator<Uint8Array>

declare function saveBlob(blob: Blob, filename: string): void
```

## 说明

- `readChunks`：按 `chunkSize` 逐块产出 `Uint8Array`，支持 `for await-of` 遍历与 `break` 提前退出；也可手动控制：

```ts
const reader = readChunks(file, { chunkSize: 1024 * 1024 })
const { value, done } = await reader.next()
await reader.return(undefined)
```

- `saveBlob`：内部使用 `Object URL` + `a[download]` 触发下载，无返回值。
