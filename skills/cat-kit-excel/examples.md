# @cat-kit/excel 示例

## 流式读取

```ts
import { readWorkbookStream } from '@cat-kit/excel'

const stream = readWorkbookStream(file, {
  /* ReadStreamOptions */
})
for await (const event of stream) {
  // StreamEvent …
}
```

## 一次性读取

```ts
import { readWorkbook } from '@cat-kit/excel'

const wb = await readWorkbook(input)
```

详见 [`generated/index.d.ts`](generated/index.d.ts) 与 [references/io.md](references/io.md)。
