---
title: 读写与流式解析
description: readWorkbook / readWorkbookStream / writeWorkbook 的输入输出与事件模型
sidebarOrder: 2
outline: deep
---

# 读写与流式解析

## 介绍

`@cat-kit/excel` 提供三类 I/O API：

- `writeWorkbook`：将内存模型写成 xlsx 字节流
- `readWorkbook`：一次性读取完整工作簿
- `readWorkbookStream`：按事件流读取，适合大文件分步处理

## 快速使用

```ts
import { readWorkbook, readWorkbookStream, writeWorkbook, Workbook } from '@cat-kit/excel'

const workbook = new Workbook()
workbook.addWorksheet('Sheet1').setCell('A1', 'hello')

const bytes = writeWorkbook(workbook)
const parsed = await readWorkbook(bytes)
console.log(parsed.getWorksheet('Sheet1')?.getCell('A1')?.value)

for await (const event of readWorkbookStream(bytes, { includeEmptyRows: true })) {
  if (event.type === 'row') {
    console.log(event.sheetName, event.rowIndex, event.values)
  }
}
```

::: demo excel/stream-read.vue
:::

## API参考

### readWorkbook

```ts
readWorkbook(input: WorkbookInput, options?: ReadOptions): Promise<Workbook>
```

- 支持输入：`Uint8Array | ArrayBuffer | Blob | ReadableStream<Uint8Array> | AsyncIterable<Uint8Array>`
- `options.dateSystem`：`1900 | 1904`，用于日期序列号解释（默认 `1900`）

### readWorkbookStream

```ts
readWorkbookStream(
  input: WorkbookInput,
  options?: ReadStreamOptions
): AsyncIterable<StreamEvent>
```

- `options.sheets?: string[]`：按工作表名称过滤
- `options.includeEmptyRows?: boolean`：是否补齐空行 `row` 事件
- 事件类型：
  - `sheetStart`：工作表开始
  - `row`：行数据（`rowIndex` 为 1-based）
  - `sheetEnd`：工作表结束

### writeWorkbook

```ts
writeWorkbook(workbook: Workbook, options?: WriteOptions): Uint8Array
```

- 入参必须是 `Workbook` 实例，且至少包含一个工作表
- `options.useSharedStrings` 默认 `true`
- `options.compressionLevel` 可控制 zip 压缩级别

### StreamEvent 类型

```ts
type StreamEvent =
  | { type: 'sheetStart'; sheetName: string; sheetIndex: number }
  | { type: 'sheetEnd'; sheetName: string; sheetIndex: number }
  | { type: 'row'; sheetName: string; sheetIndex: number; rowIndex: number; values: CellValue[] }
```
