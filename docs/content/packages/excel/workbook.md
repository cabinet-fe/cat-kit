---
title: 工作簿模型
description: Workbook / Worksheet / Row / Cell 的模型 API 与写入示例
sidebarOrder: 1
outline: deep
---

# 工作簿模型

## 介绍

本页介绍 `@cat-kit/excel` 的内存模型：`Workbook`、`Worksheet`、`Row`、`Cell`。这些类用于构建和管理表格数据，再配合 `writeWorkbook` 输出 xlsx 二进制。

## 快速使用

```ts
import { Workbook, writeWorkbook } from '@cat-kit/excel'

const workbook = new Workbook({ creator: 'cat-kit', createdAt: new Date() })
const sheet = workbook.addWorksheet('Sales', {
  frozenPane: { ySplit: 1, topLeftCell: 'A2' }
})

sheet
  .setCell('A1', '产品')
  .setCell('B1', '销售额')
  .setCell('A2', 'Wi-Fi 7 AP')
  .setCell('B2', 3600, { numberFormat: '#,##0.00' })

const bytes = writeWorkbook(workbook, { useSharedStrings: true })
const blob = new Blob([bytes], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
})
```

::: demo excel/create-and-download.vue
:::

## API参考

### Workbook

```ts
new Workbook(metadata?: WorkbookMetadata)
```

- `metadata: WorkbookMetadata`：工作簿元信息，可写 `creator`、`lastModifiedBy`、`createdAt`、`modifiedAt`
- `addWorksheet(name, options?)`：新增工作表；名称为空或重复会抛 `ExcelSchemaError`
- `getWorksheet(nameOrIndex)`：按名称或索引获取工作表
- `worksheets`：工作表快照数组（只读快照）
- `removeWorksheet(name)`：删除指定工作表，返回是否删除成功

### Worksheet

```ts
new Worksheet(name: string, options?: WorksheetOptions)
```

- `row(index)`：按 1-based 行号创建/获取 `Row`
- `addRow(values)`：在当前最大行后追加一行
- `setCell(address, value, style?)` / `getCell(address)`：按 A1 地址读写单元格
- `setColumn(index, column)` / `getColumn(index)`：设置列定义（`width`、`hidden`、`style` 等）
- `getRows()` / `getColumns()`：返回排序后的行/列信息
- `maxRowIndex()` / `maxColIndex()`：获取当前工作表最大行列号

### Row

```ts
new Row(index: number)
```

- `cell(column)`：按列号或列字母（如 `1` / `'A'`）获取 `Cell`
- `setCell(column, value, style?)`：设置单元格
- `getCell(column)`：读取单元格
- `getCells()`：返回按列排序的 `[column, cell]` 数组
- `toValues()`：转为值数组，空洞补 `null`

### Cell

```ts
new Cell(value?: CellValue, style?: CellStyle)
```

- `value`：支持 `string | number | boolean | null | Date | { formula, result? }`
- `style`：支持字体、填充、边框、对齐、数字格式与保护字段
- `setValue(value)` / `setStyle(style)`：链式更新
- `clone()`：复制单元格；`Date` 会复制为新实例

### 写出函数

```ts
writeWorkbook(workbook: Workbook, options?: WriteOptions): Uint8Array
```

- `dateSystem`：`1900 | 1904`，默认 `1900`
- `useSharedStrings`：是否启用共享字符串，默认 `true`
- `compressionLevel`：zip 压缩级别
