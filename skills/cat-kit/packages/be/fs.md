# be — 文件系统

## 何时使用

需要比 `node:fs` 更省步骤的目录遍历、自动建父目录写入、JSON 文件读写或路径清理时使用。

## 如何选择

- `readDir`：返回目录项元数据；传 `onlyFiles: true` 时改为返回绝对文件路径。
- `writeFile`：写字符串、Buffer、Node/Web 流或迭代器，并自动创建父目录。
- `readJson` / `writeJson`：解析或格式化 JSON；写入时自动建目录并默认追加换行。
- `ensureDir` / `emptyDir`：确保目录存在，或删除其全部内容但保留目录。
- `movePath` / `removePath`：移动或递归删除文件、目录。
- `readFile`、`cp`、`copyFile`、`existsSync`：从 Node.js 原生模块重新导出的常用能力。

## 最小示例

```ts
import { readDir, writeJson } from '@cat-kit/be'

const files = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: (entry) => entry.name.endsWith('.ts')
})

await writeJson('./reports/typescript-files.json', files)
```

## 约束与边界

- `readDir` 默认只读一层；递归读取必须显式传 `recursive: true`。
- `filter` 接收含绝对路径、相对路径、深度和文件类型的 `DirEntry`。
- `movePath` 默认不覆盖目标；源与已存在目标必须同为文件或同为目录。
- `removePath` 和 `emptyDir` 会删除数据。仅在路径已确认时调用；不存在路径只有在 `removePath(..., { force: true })` 时忽略。
- `writeFile` 的 `flag` 仅支持 `'w'`、`'a'`、`'wx'`。

## 精确类型入口

[目录遍历](../../generated/be/fs/read-dir.d.ts) · [文件写入](../../generated/be/fs/write-file.d.ts) · [JSON](../../generated/be/fs/json.d.ts) · [移动](../../generated/be/fs/move.d.ts) · [删除](../../generated/be/fs/remove.d.ts)
