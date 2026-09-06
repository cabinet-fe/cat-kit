---
title: "@cat-kit/be 文件系统示例"
description: "确保目录、递归列出文件并写出 JSON 清单"
keywords:
  - ensureDir
  - readDir
  - writeJson
  - writeFile
  - 递归列出文件
  - JSON 清单
  - 下载文件写入
aliases:
  - 文件系统示例
  - fs 示例
  - 递归遍历目录
---

# 文件系统示例

常见组合：确保输出目录存在、递归收集文件路径、把结果写成 JSON 文件。

```ts
import { ensureDir, readDir, writeJson } from '@cat-kit/be'

await ensureDir('./output')
const files = await readDir('./data', { recursive: true, onlyFiles: true })
await writeJson('./output/files.json', { files })
```

写入 Web 流（如 `fetch` 响应体）时用 `writeFile`：

```ts
import { writeFile } from '@cat-kit/be'

const response = await fetch('https://example.com/file')
await writeFile('./downloads/file.txt', response.body!)
```

相关文档：[文件系统工具](index.md)、[文件系统 API](apis.md)。
