# @cat-kit/excel

基于不可变数据结构和 Web Streams API 的现代化 Excel 处理库。

## 特性

- ✨ **不可变数据结构** - 所有操作返回新实例，保证数据安全
- 📦 **轻量级** - 使用 `fflate` 替代 JSZip，体积更小
- 🚀 **现代化 API** - 基于 TypeScript，类型安全
- 📊 **表格数据语法糖** - 快速从结构化数据创建工作表
- 🎨 **丰富的样式支持** - 字体、边框、填充、对齐、数字格式
- 📖 **读写支持** - 支持读取和写入 XLSX 文件
- 🔧 **辅助工具** - 地址解析、列宽转换等实用函数

## 安装

```bash
bun add @cat-kit/excel
```

## 快速开始

### 创建并导出工作簿

```typescript
import { Workbook, Worksheet, Cell } from '@cat-kit/excel'

// 创建单元格
const cell1 = new Cell('Hello')
const cell2 = new Cell(42)
const cell3 = new Cell(new Date())

// 创建工作表
const sheet = new Worksheet('Sheet1', {
  rows: [
    ['姓名', '年龄', '日期'],
    ['张三', 25, new Date('2024-01-01')],
    ['李四', 30, new Date('2024-01-02')]
  ]
})

// 创建工作簿
const workbook = new Workbook('我的工作簿', {
  sheets: [sheet]
})

// 导出为 Blob
const blob = await workbook.write()

// 下载文件
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = '我的工作簿.xlsx'
a.click()
```

### 使用表格数据语法糖

```typescript
import { Workbook, Worksheet } from '@cat-kit/excel'

interface User {
  name: string
  age: number
  email: string
}

const users: User[] = [
  { name: '张三', age: 25, email: 'zhangsan@example.com' },
  { name: '李四', age: 30, email: 'lisi@example.com' }
]

const sheet = new Worksheet('用户列表', {
  table: {
    columns: [
      { name: '姓名', key: 'name', width: 100, align: 'left' },
      { name: '年龄', key: 'age', width: 80, align: 'right' },
      { name: '邮箱', key: 'email', width: 200 }
    ],
    data: users,
    headerStyle: {
      font: { bold: true, size: 12 },
      fill: { fgColor: '#4472C4', patternType: 'solid' },
      alignment: { horizontal: 'center' }
    }
  }
})

const workbook = new Workbook('用户数据', { sheets: [sheet] })
const blob = await workbook.write()
```

### 读取 Excel 文件

```typescript
import { readWorkbook } from '@cat-kit/excel'

// 从文件输入读取
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const workbook = await readWorkbook(file)

  // 遍历工作表
  for (const sheet of workbook) {
    console.log(`工作表: ${sheet.name}`)

    // 遍历行
    for (const row of sheet) {
      const values = row.cells.map(cell => cell.value)
      console.log(values)
    }
  }
})
```

## API 文档

### Workbook（工作簿）

工作簿是 Excel 文件的顶层容器，包含多个工作表。

#### 构造函数

```typescript
new Workbook(name?: string, options?: {
  sheets?: Worksheet[]
  metadata?: WorkbookMetadata
})
```

#### 方法

- `addSheet(sheet: Worksheet): Workbook` - 添加工作表
- `addSheets(sheets: Worksheet[]): Workbook` - 添加多个工作表
- `getSheet(index: number): Worksheet | undefined` - 通过索引获取工作表
- `getSheet(name: string): Worksheet | undefined` - 通过名称获取工作表
- `removeSheet(identifier: number | string): Workbook` - 删除工作表
- `withMetadata(metadata: WorkbookMetadata): Workbook` - 设置元数据
- `withName(newName: string): Workbook` - 重命名工作簿
- `write(): Promise<Blob>` - 导出为 Excel 文件

#### 属性

- `name: string` - 工作簿名称
- `sheets: ReadonlyArray<Worksheet>` - 工作表数组
- `metadata?: WorkbookMetadata` - 元数据
- `sheetCount: number` - 工作表数量

### Worksheet（工作表）

工作表包含行数据和样式配置。

#### 构造函数

```typescript
new Worksheet(name: string, options?: {
  rows?: CellValue[][]
  table?: TableData
  mergedCells?: MergedCellRange[]
  columnWidths?: Record<number, number>
})
```

#### 方法

- `withName(newName: string): Worksheet` - 重命名工作表
- `appendRow(row: Row): Worksheet` - 追加行
- `appendRows(rows: Row[]): Worksheet` - 追加多行
- `getRow(index: number): Row | undefined` - 获取指定行
- `getCell(address: string): Cell | undefined` - 通过地址获取单元格
- `getCell(row: number, column: number): Cell | undefined` - 通过行列索引获取单元格
- `withColumnWidth(columnIndex: number, width: number): Worksheet` - 设置列宽
- `withMergedCell(range: MergedCellRange): Worksheet` - 添加合并单元格

#### 属性

- `name: string` - 工作表名称
- `rows: ReadonlyArray<Row>` - 行数组
- `mergedCells: ReadonlyArray<MergedCellRange>` - 合并单元格范围
- `columnWidths: Readonly<Record<number, number>>` - 列宽配置
- `rowCount: number` - 行数
- `columnCount: number` - 列数

### Cell（单元格）

单元格是不可变的数据单元，包含值和样式。

#### 构造函数

```typescript
new Cell<T extends CellValue>(value: T, style?: CellStyle)
```

#### 方法

- `withValue<U extends CellValue>(newValue: U): Cell<U>` - 设置新值
- `withStyle(newStyle: CellStyle): Cell<T>` - 设置样式
- `mergeStyle(additionalStyle: CellStyle): Cell<T>` - 合并样式
- `isEmpty(): boolean` - 检查是否为空
- `getValueType(): 'string' | 'number' | 'date' | 'boolean' | 'null'` - 获取值类型

#### 属性

- `value: T` - 单元格值
- `style?: CellStyle` - 单元格样式

### Row（行）

行是单元格的容器。

#### 构造函数

```typescript
new Row(cells: Cell[] | CellValue[])
```

#### 方法

- `getCell(index: number): Cell | undefined` - 获取指定索引的单元格
- `getValues(): CellValue[]` - 获取所有单元格的值

#### 属性

- `cells: ReadonlyArray<Cell>` - 单元格数组
- `length: number` - 单元格数量
- `height?: number` - 行高

## 样式配置

### CellStyle

```typescript
interface CellStyle {
  font?: CellFont          // 字体样式
  border?: CellBorder      // 边框样式
  fill?: CellFill          // 填充样式
  alignment?: CellAlignment // 对齐方式
  numberFormat?: string    // 数字格式
}
```

### 字体样式

```typescript
const cell = new Cell('Hello', {
  font: {
    name: 'Arial',
    size: 14,
    bold: true,
    italic: false,
    underline: true,
    color: '#FF0000'
  }
})
```

### 边框样式

```typescript
const cell = new Cell('Bordered', {
  border: {
    top: { style: 'thin', color: '#000000' },
    right: { style: 'medium', color: '#000000' },
    bottom: { style: 'thick', color: '#000000' },
    left: { style: 'double', color: '#000000' }
  }
})
```

### 填充样式

```typescript
const cell = new Cell('Filled', {
  fill: {
    fgColor: '#FFFF00',
    bgColor: '#FF0000',
    patternType: 'solid'
  }
})
```

### 对齐方式

```typescript
const cell = new Cell('Aligned', {
  alignment: {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
    indent: 2
  }
})
```

### 数字格式

```typescript
const cell = new Cell(1234.56, {
  numberFormat: '#,##0.00'  // 显示为 1,234.56
})
```

## 辅助函数

### 地址解析

```typescript
import { parseAddress, formatAddress, parseRange, formatRange } from '@cat-kit/excel'

// 解析地址
const addr = parseAddress('A1')  // { row: 0, column: 0 }
const str = formatAddress({ row: 0, column: 0 })  // 'A1'

// 解析范围
const range = parseRange('A1:B10')
const rangeStr = formatRange(range)  // 'A1:B10'
```

### 列索引转换

```typescript
import { columnLetterToIndex, columnIndexToLetter } from '@cat-kit/excel'

columnLetterToIndex('A')   // 0
columnLetterToIndex('Z')   // 25
columnLetterToIndex('AA')  // 26

columnIndexToLetter(0)     // 'A'
columnIndexToLetter(25)    // 'Z'
columnIndexToLetter(26)    // 'AA'
```

### 列宽转换

```typescript
import { pixelsToExcelWidth, excelWidthToPixels } from '@cat-kit/excel'

pixelsToExcelWidth(100)  // 约 14
excelWidthToPixels(14)   // 约 98
```

## 错误处理

库提供了多种错误类型：

- `ExcelError` - 基础错误类
- `FileFormatError` - 文件格式错误
- `ParseError` - 解析错误
- `StreamError` - 流处理错误
- `ValidationError` - 验证错误
- `MemoryError` - 内存错误

```typescript
import { ValidationError } from '@cat-kit/excel'

try {
  const addr = parseAddress('invalid')
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('验证错误:', error.message)
  }
}
```

## 类型定义

### CellValue

```typescript
type CellValue = string | number | Date | boolean | null
```

### TableColumn

```typescript
interface TableColumn<T = any> {
  name: string              // 表头名称
  key: keyof T              // 值键
  width?: number            // 列宽（像素）
  align?: 'left' | 'center' | 'right'  // 对齐方式
  format?: string           // 数字格式
  style?: CellStyle         // 自定义样式
}
```

### TableData

```typescript
interface TableData<T = any> {
  columns: TableColumn<T>[]  // 列定义
  data: T[]                   // 数据行
  headerStyle?: CellStyle     // 表头样式
  dataStyle?: CellStyle       // 数据样式
}
```

## 注意事项

1. **不可变性**：所有修改操作都返回新实例，原实例不会被修改
2. **索引从 0 开始**：行和列的索引都从 0 开始（但 Excel 地址从 1 开始）
3. **日期处理**：日期会自动转换为 Excel 日期格式
4. **字符串共享**：写入时会自动使用 SharedStrings 优化文件大小
5. **样式去重**：相同的样式会被复用，减少文件大小

## 许可证

MIT

