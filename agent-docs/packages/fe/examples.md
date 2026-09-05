---
title: "@cat-kit/fe 组合示例"
description: 跨主题组合使用 fe 包的存储、文件、剪贴板与虚拟列表能力
---

# @cat-kit/fe 组合示例

以下示例演示在一个业务流程里组合使用 `@cat-kit/fe` 的多个能力：记录上传文件名到本地存储、分块读取文件、写剪贴板，以及驱动一个虚拟列表。

```ts
import {
  clipboard,
  readChunks,
  storage,
  storageKey,
  Virtualizer
} from '@cat-kit/fe'

const FILE_KEY = storageKey<string>('last-file-name')

async function upload(file: File) {
  storage.local.set(FILE_KEY, file.name, 0)
  let bytes = 0
  for await (const chunk of readChunks(file, { chunkSize: 512 * 1024 })) {
    bytes += chunk.byteLength
  }
  await clipboard.copy(`uploaded:${file.name}(${bytes} bytes)`)
}

const list = new Virtualizer({ count: 1000, estimateSize: () => 36 })
list.setViewport(600)
list.subscribe(({ items }) => {
  // 用 items 渲染可视区
  void items
})
```

各主题的独立示例见对应主题文档：[虚拟列表示例](virtualizer/examples.md)。
