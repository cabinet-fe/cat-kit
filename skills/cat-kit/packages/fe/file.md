# fe — 文件处理

## 适用场景

- 不一次性把整个 `Blob` / `File` 交给业务逻辑，而是逐块上传、解析或计算摘要
- 从指定字节位置继续读取
- 将内存中的 `Blob` 交给浏览器下载

## 如何选择

| 需求                     | 选择                                        |
| ------------------------ | ------------------------------------------- |
| 顺序读取大文件并逐块处理 | `readChunks`                                |
| 文件很小且只需一次读取   | 直接用 `blob.arrayBuffer()` / `blob.text()` |
| 触发普通 Blob 下载       | `saveBlob`                                  |
| 持续生成或超大数据下载   | 优先评估 Streams API 或服务端下载           |

## 公共 API

```ts
interface ReadChunksOptions {
  chunkSize?: number
  offset?: number
}

readChunks(
  file: Blob | File,
  options?: ReadChunksOptions
): AsyncGenerator<Uint8Array>

saveBlob(blob: Blob, filename: string): void
```

`readChunks` 默认每块 10 MiB、从偏移 `0` 开始。`saveBlob` 发起浏览器下载，不返回下载完成状态。

## 最小示例

```ts
import { readChunks, saveBlob } from '@cat-kit/fe'

const file = document.querySelector<HTMLInputElement>('#file')!.files?.[0]
if (file) {
  for await (const chunk of readChunks(file, { chunkSize: 1024 * 1024 })) {
    console.log(chunk.byteLength)
  }
}

saveBlob(new Blob(['done'], { type: 'text/plain' }), 'result.txt')
```

## 必要边界

- `chunkSize` 必须是正数，`offset` 应位于 `0` 到 `file.size` 之间；API 不负责校验无效值。
- `readChunks` 按需读取；`break` 或停止迭代会阻止后续块继续读取，但没有独立的 `AbortSignal` 选项。
- 每次产出的是新的 `Uint8Array`。调用方负责上传并发、重试、摘要状态或块序号。
- `saveBlob` 依赖 DOM、Object URL 和浏览器下载策略；文件名和是否提示保存由浏览器决定。
- `saveBlob` 适合小到中等 Blob。超大内容应避免先在内存中完整构造 Blob。
- 只有根入口 `@cat-kit/fe` 是公开导入路径。

## 类型入口

- [分块读取](../../generated/fe/file/read.d.ts)
- [Blob 下载](../../generated/fe/file/saver.d.ts)
