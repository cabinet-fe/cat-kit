# fe — 文件操作

## 分块读取

```typescript
import { readFile } from '@cat-kit/fe'

await readFile(file, {
  offset?: number,       // 默认 0
  chunkSize?: number,    // 默认 10MB
  onChunk?: (chunk: Uint8Array, chunkIndex: number) => void
})
```

## 保存文件

```typescript
import { saveFromBlob, saveFromStream, saveFromURL } from '@cat-kit/fe'

saveFromBlob(blob, 'output.txt')
saveFromStream(stream, 'output.txt')
await saveFromURL('https://example.com/file.pdf', 'doc.pdf')
```
