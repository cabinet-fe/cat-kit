# @cat-kit/excel - Excel 文件处理库

本文件为 `@cat-kit/excel` 包提供详细的开发指导。

## 包概述

`@cat-kit/excel` 是一个现代化的 Excel 文件处理库，基于不可变数据结构和 Web Streams API，支持流式读取和写入大型 Excel 文件。

**包名称**：`@cat-kit/excel`
**依赖关系**：依赖 `@cat-kit/core`
**运行环境**：浏览器和 Node.js

## 依赖说明

⚠️ **重要**：在开发此包时，优先从 `@cat-kit/core` 导入基础工具函数。

```typescript
// ✅ 正确：从 core 导入
import { isObject, deepClone } from '@cat-kit/core/src'
```

## 目录结构

```
packages/excel/src/
├── core/              # 核心数据结构
│   ├── cell.ts        # Cell 类（单元格）
│   ├── row.ts         # Row 类（行）
│   ├── worksheet.ts   # Worksheet 类（工作表）
│   ├── workbook.ts    # Workbook 类（工作簿）
│   ├── types.ts       # 核心类型定义
│   └── index.ts
├── reader/            # 读取功能
│   ├── xlsx-reader.ts # 非流式读取
│   ├── stream-reader.ts # 流式读取
│   └── index.ts
├── writer/            # 写入功能
│   ├── stream-writer.ts # 流式写入
│   └── index.ts
├── helpers/           # 辅助函数
│   ├── address.ts     # 地址相关（如 A1、B2）
│   ├── date.ts        # 日期转换
│   └── index.ts
├── errors/            # 错误类
│   └── index.ts
├── worker.ts          # Web Worker 支持
├── worker-client.ts   # Worker 客户端
└── index.ts           # 主导出文件
```

## 核心概念

### 1. 不可变数据结构

所有核心类（Cell、Row、Worksheet、Workbook）都是**不可变的**，修改操作返回新实例：

```typescript
// ✅ 正确：不可变操作
const cell1 = new Cell({ value: 'Hello' })
const cell2 = cell1.setValue('World') // 返回新 Cell 实例
console.log(cell1.value) // 'Hello' - 原实例未变
console.log(cell2.value) // 'World' - 新实例

// ❌ 错误：尝试直接修改
cell1.value = 'World' // TypeScript 错误：value 是 readonly
```

### 2. 流式处理

支持流式读取和写入，适合处理大型 Excel 文件：

**流式读取**：
```typescript
import { readWorkbookStream } from '@cat-kit/excel'

const stream = await readWorkbookStream(file)

for await (const data of stream) {
  console.log(`Sheet: ${data.sheetName}, Row: ${data.rowIndex}`)
  console.log(data.row) // Row 对象
}
```

**流式写入**：
```typescript
import { StreamWorkbookWriter } from '@cat-kit/excel'

const writer = new StreamWorkbookWriter()
const sheet = writer.createSheet('Sheet1')

for (let i = 0; i < 10000; i++) {
  sheet.addRow([`Cell ${i}`, i])
}

const blob = await writer.toBlob()
```

### 3. Web Worker 支持

可以在 Web Worker 中处理 Excel 文件，避免阻塞主线程：

```typescript
import { ExcelWorkerClient } from '@cat-kit/excel'

const client = new ExcelWorkerClient(new Worker('./excel-worker.js'))
const workbook = await client.readWorkbook(file)
```

## 核心类

### Cell - 单元格

表示单个单元格的数据和样式。

```typescript
export class Cell {
  constructor(options: CellOptions)

  /** 单元格值 */
  readonly value: CellValue

  /** 单元格公式 */
  readonly formula?: CellFormula

  /** 单元格样式 */
  readonly style?: CellStyle

  /** 设置值（返回新 Cell） */
  setValue(value: CellValue): Cell

  /** 设置公式（返回新 Cell） */
  setFormula(formula: CellFormula): Cell

  /** 设置样式（返回新 Cell） */
  setStyle(style: CellStyle): Cell

  /** 转换为普通对象 */
  toJSON(): CellOptions
}
```

### Row - 行

表示一行单元格。

```typescript
export class Row {
  constructor(cells: Cell[], options?: RowOptions)

  /** 行中的单元格 */
  readonly cells: readonly Cell[]

  /** 行高 */
  readonly height?: number

  /** 获取指定列的单元格 */
  getCell(columnIndex: number): Cell | undefined

  /** 设置单元格（返回新 Row） */
  setCell(columnIndex: number, cell: Cell): Row

  /** 转换为普通对象 */
  toJSON(): RowOptions
}
```

### Worksheet - 工作表

表示一个工作表。

```typescript
export class Worksheet {
  constructor(options: WorksheetOptions)

  /** 工作表名称 */
  readonly name: string

  /** 行数据 */
  readonly rows: readonly Row[]

  /** 合并单元格范围 */
  readonly mergedCells: readonly MergedCellRange[]

  /** 获取指定行 */
  getRow(rowIndex: number): Row | undefined

  /** 设置行（返回新 Worksheet） */
  setRow(rowIndex: number, row: Row): Worksheet

  /** 添加行（返回新 Worksheet） */
  addRow(row: Row): Worksheet

  /** 转换为表格数据 */
  toTable(): TableData

  /** 从表格数据创建 */
  static fromTable(data: TableData, options?: WorksheetOptions): Worksheet
}
```

### Workbook - 工作簿

表示整个 Excel 文件。

```typescript
export class Workbook {
  constructor(options: WorkbookOptions)

  /** 工作表列表 */
  readonly sheets: readonly Worksheet[]

  /** 元数据 */
  readonly metadata?: WorkbookMetadata

  /** 获取工作表 */
  getSheet(nameOrIndex: string | number): Worksheet | undefined

  /** 添加工作表（返回新 Workbook） */
  addSheet(sheet: Worksheet): Workbook

  /** 设置工作表（返回新 Workbook） */
  setSheet(nameOrIndex: string | number, sheet: Worksheet): Workbook

  /** 删除工作表（返回新 Workbook） */
  removeSheet(nameOrIndex: string | number): Workbook
}
```

## 核心类型

### CellValue

单元格值类型：

```typescript
export type CellValue = string | number | boolean | Date | null
```

### CellFormula

单元格公式：

```typescript
export interface CellFormula {
  /** 公式字符串（不含等号） */
  formula: string
  /** 计算结果（可选） */
  result?: CellValue
}
```

### CellStyle

单元格样式：

```typescript
export interface CellStyle {
  font?: CellFont
  fill?: CellFill
  border?: CellBorder
  alignment?: CellAlignment
  numberFormat?: string
}
```

## 读取 Excel

### 非流式读取（适合小文件）

```typescript
import { readWorkbook } from '@cat-kit/excel'

const workbook = await readWorkbook(file)
const sheet = workbook.getSheet(0)
const table = sheet.toTable()
```

### 流式读取（适合大文件）

```typescript
import { readWorkbookStream } from '@cat-kit/excel'

const stream = await readWorkbookStream(file, {
  sheetNames: ['Sheet1'], // 可选：只读特定工作表
  startRow: 1, // 可选：跳过标题行
})

for await (const data of stream) {
  const { sheetName, rowIndex, row } = data
  // 处理每一行
}
```

## 写入 Excel

### 流式写入

```typescript
import { StreamWorkbookWriter } from '@cat-kit/excel'

const writer = new StreamWorkbookWriter()
const sheet1 = writer.createSheet('Data')

// 添加标题行
sheet1.addRow(['Name', 'Age', 'Email'])

// 添加数据行
for (const user of users) {
  sheet1.addRow([user.name, user.age, user.email])
}

// 生成 Blob
const blob = await writer.toBlob()

// 或直接下载
writer.download('data.xlsx')
```

## 辅助函数

### 地址相关

```typescript
import {
  parseAddress,
  formatAddress,
  columnLetterToIndex,
  columnIndexToLetter
} from '@cat-kit/excel'

// 解析地址
const { row, col } = parseAddress('B5') // { row: 4, col: 1 }

// 格式化地址
const addr = formatAddress(4, 1) // 'B5'

// 列字母 <-> 索引
const index = columnLetterToIndex('AB') // 27
const letter = columnIndexToLetter(27) // 'AB'
```

### 日期转换

```typescript
import {
  dateToExcelNumber,
  excelNumberToDate,
  isDateFormat
} from '@cat-kit/excel'

// Date -> Excel 数字
const excelNum = dateToExcelNumber(new Date('2024-01-01'))

// Excel 数字 -> Date
const date = excelNumberToDate(45292)

// 检查是否为日期格式
if (isDateFormat('yyyy-mm-dd')) {
  // 是日期格式
}
```

## 错误处理

提供了专门的错误类：

```typescript
export class ExcelError extends Error
export class FileFormatError extends ExcelError // 文件格式错误
export class ParseError extends ExcelError // 解析错误
export class StreamError extends ExcelError // 流处理错误
export class ValidationError extends ExcelError // 验证错误
export class MemoryError extends ExcelError // 内存不足
```

使用示例：

```typescript
import { readWorkbook, FileFormatError } from '@cat-kit/excel'

try {
  const workbook = await readWorkbook(file)
} catch (error) {
  if (error instanceof FileFormatError) {
    console.error('Invalid Excel file format')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## 编码规范

### 不可变性

所有核心类必须保持不可变：

```typescript
// ✅ 正确：返回新实例
export class Cell {
  setValue(value: CellValue): Cell {
    return new Cell({ ...this.toJSON(), value })
  }
}

// ❌ 错误：修改自身
export class Cell {
  setValue(value: CellValue): void {
    this.value = value // 违反不可变性
  }
}
```

### 流式处理优先

对于大数据量，优先使用流式 API：

```typescript
// ✅ 正确：流式处理大文件
async function processLargeFile(file: File) {
  const stream = await readWorkbookStream(file)
  for await (const { row } of stream) {
    // 逐行处理
  }
}

// ❌ 错误：一次性加载大文件到内存
async function processLargeFile(file: File) {
  const workbook = await readWorkbook(file) // 可能导致内存溢出
  // ...
}
```

### 类型安全

使用类型守卫：

```typescript
import { isCellFormula, isCellError } from '@cat-kit/excel'

if (isCellFormula(cell.value)) {
  console.log(cell.value.formula)
}

if (isCellError(cell.value)) {
  console.log(cell.value.error)
}
```

## 性能优化

### 使用 Web Worker

对于大文件处理，使用 Web Worker 避免阻塞 UI：

```typescript
import { ExcelWorkerClient } from '@cat-kit/excel'

// 创建 Worker 客户端
const worker = new Worker('./excel-worker.js')
const client = new ExcelWorkerClient(worker)

// 在 Worker 中处理
const workbook = await client.readWorkbook(file)
```

### 批量操作

避免频繁创建新实例，使用批量操作：

```typescript
// ✅ 正确：批量添加行
const rows = users.map(u => new Row([
  new Cell({ value: u.name }),
  new Cell({ value: u.age })
]))
const sheet = rows.reduce((s, r) => s.addRow(r), worksheet)

// ❌ 错误：逐行添加（创建多个中间实例）
let sheet = worksheet
for (const user of users) {
  sheet = sheet.addRow(new Row([
    new Cell({ value: user.name }),
    new Cell({ value: user.age })
  ]))
}
```

## 测试规范

测试文件位于 `packages/tests/excel/` 目录：

```typescript
// packages/tests/excel/core/cell.test.ts
import { describe, it, expect } from 'vitest'
import { Cell } from '@cat-kit/excel/src'

describe('Cell', () => {
  it('should create cell with value', () => {
    const cell = new Cell({ value: 'test' })
    expect(cell.value).toBe('test')
  })

  it('should be immutable', () => {
    const cell1 = new Cell({ value: 'a' })
    const cell2 = cell1.setValue('b')
    expect(cell1.value).toBe('a')
    expect(cell2.value).toBe('b')
  })
})
```

## 添加新功能

### 步骤

1. **确定模块**：确定功能应该属于哪个模块（`core/`、`reader/`、`writer/`、`helpers/`）
2. **实现功能**：遵循不可变性原则
3. **添加类型**：在 `types.ts` 中添加必要的类型定义
4. **导出**：在相应的 `index.ts` 中导出
5. **添加测试**：在 `packages/tests/excel/` 下添加测试
6. **构建验证**：运行 `cd build && bun run build` 验证构建

## 构建配置

构建配置位于 `build/pkgs.ts`：

```typescript
{
  dir: pkg('excel'),
  deps: ['@cat-kit/core'],
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']
  }
}
```

## 常见任务

### 添加新的单元格样式属性
→ 编辑 `src/core/types.ts`，更新 `CellStyle` 接口

### 添加新的读取选项
→ 编辑 `src/reader/stream-reader.ts`，更新 `StreamReadOptions`

### 优化流式写入性能
→ 编辑 `src/writer/stream-writer.ts`

### 添加新的辅助函数
→ 在 `src/helpers/` 下创建新文件或编辑现有文件

## 浏览器兼容性

需要的浏览器 API：
- Web Streams API（流式处理）
- Blob API（文件生成）
- Web Worker API（可选，用于后台处理）

目标浏览器：
- Chrome/Edge 89+
- Firefox 102+
- Safari 14.1+

## Node.js 支持

在 Node.js 环境中使用时，需要 polyfill Web Streams API（Node.js 18+ 原生支持）。
