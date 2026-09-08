---
title: "@cat-kit/be 目录清单与文件写入场景"
description: 用 @cat-kit/be 生成项目目录清单并下载文件落盘：readDir 递归过滤收集文件，writeJson 输出清单，writeFile 写入 fetch 下载流，removePath 与 movePath 做清理归档。
aliases: [目录清单, 递归遍历, 下载写入, 文件清理]
keywords: [readDir, onlyFiles, filter, writeJson, writeFile, movePath, removePath, emptyDir, ensureDir, 递归遍历, 目录清单, 下载文件, 流式写入, 文件归档, 清空目录]
---

# @cat-kit/be 目录清单与文件写入场景

本方案实现一组常见的构建期文件操作：用 `readDir` 递归收集源码文件清单并写入 JSON，用 `writeFile` 把 `fetch` 下载的响应体流式落盘，最后用 `movePath` 与 `removePath` 做归档和清理。全部函数来自 `@cat-kit/be` 包根导出。

## 场景

- 何时用本方案：需要生成构建产物清单、下载远程资源到本地、或在构建流程里搬迁与清理文件。
- 何时不用：需要复制而非移动时用 Node 原生 `cp`（`@cat-kit/be` 已再导出）；需要监听文件变化时本模块没有 watcher 能力。

## 完整示例

```ts
// src/build-assets.ts
import {
  emptyDir,
  existsSync,
  movePath,
  readDir,
  removePath,
  writeFile,
  writeJson
} from '@cat-kit/be'

interface FileManifest {
  generatedAt: string
  sourceDir: string
  files: string[]
}

async function main(): Promise<void> {
  // 1. 递归收集 .ts 源码文件（不含 .d.ts），输出绝对路径数组
  const files = await readDir('./src', {
    recursive: true,
    onlyFiles: true,
    filter: (entry) => entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')
  })
  console.log(files.length > 0) // => true

  // 2. writeJson 自动创建 ./dist 目录；默认 2 空格缩进，文件末尾带一个换行符
  const manifest: FileManifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: 'src',
    files
  }
  await writeJson('./dist/manifest.json', manifest)

  // 3. 下载远程文件流式写入；response.body 是 Web ReadableStream
  const response = await fetch('https://example.com/README.md')
  if (!response.ok || !response.body) {
    throw new Error(`下载失败：HTTP ${response.status}`)
  }
  await writeFile('./dist/vendor/README.md', response.body)

  // 4. 归档上一版清单：目标存在时覆盖；源随后消失
  if (existsSync('./archive/manifest.json')) {
    await movePath('./dist/manifest.json', './archive/manifest.json', { overwrite: true })
  }

  // 5. 清空临时目录（目录保留），整目录删除用 removePath
  await emptyDir('./tmp')
  await removePath('./tmp-old', { force: true }) // 不存在也不报错
}

main().catch((err: Error) => {
  console.error('构建资产失败', err)
  process.exitCode = 1
})
```

运行：

```bash
bun run src/build-assets.ts
```

输出 `true`；`./dist/manifest.json` 写入清单；`./dist/vendor/README.md` 为下载内容；`./tmp` 变为空目录。

## 要点说明

- `readDir` 的 `filter` 与 `onlyFiles` 组合：`filter` 决定哪些条目进入结果，`onlyFiles: true` 把返回值降为 `string[]`；二者可独立使用。
- `writeJson` 的三个行为点：缩进 2 空格、末尾换行、父目录自动创建——对 `dist` 这类尚不存在的目录直接写即可。
- `writeFile` 接受 Web `ReadableStream`：`fetch` 的 `response.body` 不经 `Blob` / `arrayBuffer` 中转直接流式写入，大文件不占额外内存。
- `movePath(..., { overwrite: true })` 覆盖已有目标；不带选项时同名目标抛 `Error('目标路径 "x" 已存在')`，用 `existsSync` 预判可以少一次异常开销。
- `removePath(..., { force: true })` 对不存在的路径静默通过；`force: false`（默认）会抛错误码 `ENOENT`。
- 复制而不是移动时用再导出的 Node 原生 `cp`：`import { cp } from '@cat-kit/be'` 后 `await cp('./a', './b', { recursive: true })`。

## 注意事项

> [!WARNING]
> - 本库 `emptyDir` 保留目录本身并清空内容；`removePath` 连目录一起删除——「删空但保留目录」必须用 `emptyDir`。
> - 本库 `readDir` 的 `filter` 不缩减遍历范围：被过滤的目录在 `recursive: true` 时其子项仍会被遍历；要缩小遍历范围只能缩小根目录或收紧 `filter`。
> - 本库 `writeFile` 默认 `flag: 'w'` 截断重写；追加写必须显式传 `flag: 'a'`。
> - 本库 `movePath` 源与目标类型必须一致：文件移动到目录路径会抛 `Error('源路径是文件，但目标路径是目录，类型不一致')`。
