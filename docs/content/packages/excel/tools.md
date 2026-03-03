---
title: 地址与日期工具
description: A1 地址转换、列宽转换、Excel 日期序列号与错误类型
sidebarOrder: 3
outline: deep
---

# 地址与日期工具

## 介绍

除读写能力外，`@cat-kit/excel` 还提供可独立使用的辅助函数：

- 地址工具：列名/索引与 A1 地址互转
- 尺寸工具：像素宽度与 Excel 列宽互转
- 日期工具：`Date` 与 Excel 序列号互转（含 1900/1904 系统）
- 错误类型：统一的 `ExcelError` 体系

## 快速使用

```ts
import {
  columnToIndex,
  formatCellAddress,
  pixelsToExcelWidth,
  dateToExcelSerial,
  excelSerialToDate
} from '@cat-kit/excel'

const col = columnToIndex('AA') // 27
const address = formatCellAddress(10, 3) // C10
const width = pixelsToExcelWidth(140) // 20

const serial = dateToExcelSerial(new Date('2026-03-03T00:00:00.000Z'), 1900)
const date = excelSerialToDate(serial, 1900)

console.log(col, address, width, date.toISOString())
```

::: demo excel/address-date-tools.vue
:::

## API参考

### 地址相关

- `columnToIndex(column: string): number`
- `indexToColumn(index: number): string`
- `parseCellAddress(address: string): { row: number; col: number }`
- `formatCellAddress(row: number, col: number): string`
- `pixelsToExcelWidth(pixels: number): number`
- `excelWidthToPixels(width: number): number`

说明：

- 列/行均为 1-based，最大列 `16384`（`XFD`），最大行 `1048576`
- 参数非法时抛 `ExcelValueError`

### 日期相关

- `dateToExcelSerial(date: Date, dateSystem?: 1900 | 1904): number`
- `excelSerialToDate(serial: number, dateSystem?: 1900 | 1904): Date`

说明：

- 默认 `dateSystem = 1900`
- 已处理 Excel 1900 日期系统中的闰年历史兼容差异

### 错误类型

- `ExcelError`：基础错误类型，含 `code` 与可选 `path`
- `ExcelParseError`：解析阶段错误
- `ExcelWriteError`：写入阶段错误
- `ExcelSchemaError`：结构/约束错误（如重复工作表名）
- `ExcelValueError`：输入值或参数错误
