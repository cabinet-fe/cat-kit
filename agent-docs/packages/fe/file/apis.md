---
title: "readChunks 分块读取与 saveBlob 下载"
description: "@cat-kit/fe 文件模块 API：readChunks 以 AsyncGenerator 形式按块产出 Uint8Array（chunkSize 默认 10MB，支持 offset 与 break 提前退出），saveBlob 触发浏览器下载 Blob。"
aliases: [readChunks, saveBlob, blob 读取, 文件签名, chunk reader]
keywords: [readChunks, ReadChunksOptions, saveBlob, chunkSize, offset, Uint8Array, AsyncGenerator, for await, break, 分块读取, 分片上传, Object URL, "a[download]"]
---

# readChunks 分块读取与 saveBlob 下载

`@cat-kit/fe` 从包根导出 `readChunks`（分块读取 `Blob`/`File`）与 `saveBlob`（触发浏览器下载）。`readChunks` 基于 `Blob.slice()` + `arrayBuffer()` 实现，不用 `FileReader`；`saveBlob` 基于 `Object URL` + `a[download]`。

## 快速上手

```ts
import { readChunks } from '@cat-kit/fe'

const file = new File([new Uint8Array(1024)], 'data.bin') // 实际场景为 <input type="file"> 拿到的文件

let bytes = 0
for await (const chunk of readChunks(file, { chunkSize: 256 })) {
  bytes += chunk.byteLength // 每个 chunk 是 Uint8Array
}
console.log(bytes) // => 1024
```

```ts
import { saveBlob } from '@cat-kit/fe'

const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
saveBlob(blob, 'hello.txt') // 浏览器弹出/开始下载 hello.txt
```

## API 签名

```ts
export interface ReadChunksOptions {
  /** 每次读取的块大小（字节），默认 10 * 1024 * 1024（10MB）。必须大于 0 */
  chunkSize?: number
  /** 开始读取的字节偏移量，默认 0 */
  offset?: number
}

/**
 * 分块读取文件，返回 AsyncGenerator，逐块产出 Uint8Array。
 * 支持 for-await-of 遍历与 break 提前退出（break 会自动调用生成器的 return() 终止读取）。
 */
export function readChunks(
  file: Blob | File,
  options?: ReadChunksOptions
): AsyncGenerator<Uint8Array>

/**
 * 通过 Object URL + a[download] 触发浏览器下载。同步执行，无返回值。
 * 内部在点击下载 100ms 后调用 URL.revokeObjectURL 释放 URL。
 */
export function saveBlob(blob: Blob, filename: string): void
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `file` | `Blob \| File` | — | 是 | 任意大小的 `Blob` 或 `File` |
| `options.chunkSize` | `number` | `10485760`（10MB） | 否 | 字节数，必须大于 0；小于等于 0 时循环不前进，会无限产出空块（见注意事项） |
| `options.offset` | `number` | `0` | 否 | 起始字节偏移；`offset >= file.size` 时不产出任何块，不抛错 |
| `blob`（saveBlob） | `Blob` | — | 是 | 待下载的数据 |
| `filename`（saveBlob） | `string` | — | 是 | 下载文件名，写入 `a[download]` |

## 方法与事件

`readChunks` 返回 `AsyncGenerator<Uint8Array>`，异步迭代：

- 每次迭代产出该块的 `Uint8Array`，块大小为 `min(chunkSize, 剩余字节数)`，最后一块可小于 `chunkSize`
- `Blob` 为空或 `offset >= file.size` 时一次也不产出
- 内部依赖 `Blob.slice().arrayBuffer()`；该 Promise 被拒绝时，拒绝原因从迭代中向上抛出
- `for await ... of` 中 `break` 会触发生成器的 `return()`，停止后续读取；手动控制时用 `reader.next()` 取块、`reader.return(undefined)` 提前结束
- 读取进度不通过回调提供；用「已读字节 / `file.size`」自行计算

`saveBlob`：同步函数，立即返回 `void`；副作用是创建临时 `<a>` 元素并触发一次点击，`setTimeout(..., 100)` 后释放 Object URL。调用环境缺少 `document` 或 `URL.createObjectURL` 时抛出对应 `ReferenceError`。

## 典型示例

### 分片上传：逐块上传并统计进度

```ts
import { readChunks } from '@cat-kit/fe'

async function uploadInChunks(file: File, onProgress: (percent: number) => void) {
  let uploaded = 0
  let index = 0
  for await (const chunk of readChunks(file, { chunkSize: 512 * 1024 })) {
    // 每块独立上传；此处用占位函数表示上传请求
    await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-chunk-index': String(index) },
      body: chunk
    })
    uploaded += chunk.byteLength
    index += 1
    onProgress(Math.round((uploaded / file.size) * 100))
  }
}

await uploadInChunks(new File([new Uint8Array(2048)], 'a.bin'), (p) => console.log(p))
// => 100（最后一次回调）
```

### 读取前 1MB 后提前退出

```ts
import { readChunks } from '@cat-kit/fe'

const blob = new Blob([new Uint8Array(10 * 1024 * 1024)])
let head = 0
for await (const chunk of readChunks(blob, { chunkSize: 256 * 1024 })) {
  head += chunk.byteLength
  if (head >= 1024 * 1024) break // 只读前 1MB，后续块不再读取
}
console.log(head) // => 1048576
```

### 手动控制生成器

```ts
import { readChunks } from '@cat-kit/fe'

const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5])])
const reader = readChunks(blob, { chunkSize: 2 })

const first = await reader.next()
console.log(first.value) // => Uint8Array [1, 2]
await reader.return(undefined) // 提前结束，等价于 break
```

## 注意事项

> [!WARNING]
> - `chunkSize` 必须大于 0：本库对 `chunkSize <= 0` 不抛错，而是 `pos` 不前进，**无限产出空 `Uint8Array` 形成死循环**。不是像某些流库那样抛 `RangeError`。
> - 本库用 `Blob.slice()` + `arrayBuffer()`，不是 `FileReader`；没有 `onprogress` 事件，进度用已读字节自行累计。
> - `saveBlob` 是 `Object URL` + `a[download]` 触发浏览器下载，不是 File System Access API 的 `showSaveFilePicker`；无法自定义保存路径，也没有完成回调。
> - `saveBlob` 下载的 `Blob` 数据全程在内存中；仓库源码注释给出的适用上限为 500MB，更大的文件请走服务端下载。
