# Excel 表格包

`@cat-kit/excel` 面向浏览器环境，提供不可变的工作簿模型、流式读写与地址/日期等辅助工具，适合构建在线报表、导入导出与大文件处理。

**主要特性：**

- 不可变 `Cell` / `Row` / `Worksheet` / `Workbook` 数据结构，易于链式操作与快照管理
- 保真读写单元格样式、列宽与合并单元格，日期格式自动识别
- `readWorkbook`、`readWorkbookStream` 支持完整解析与行级流式解析
- `StreamWorkbookWriter` 流式写入，降低大数据量下的内存峰值
- 地址、日期格式转换工具，以及支持读/写的 Web Worker 客户端

## 安装

::: code-group

```bash [npm]
npm install @cat-kit/excel
```

```bash [bun]
bun add @cat-kit/excel
```

```bash [pnpm]
pnpm add @cat-kit/excel
```

:::

## 快速开始

```typescript
import { Workbook, Worksheet } from '@cat-kit/excel'

// 通过表格数据快速生成工作表
const sheet = new Worksheet('销售报表', {
  table: {
    columns: [
      { name: '产品', key: 'product', width: 120 },
      { name: '区域', key: 'region', width: 100, align: 'center' },
      { name: '销量', key: 'sales', format: '#,##0' },
      { name: '日期', key: 'date' }
    ],
    data: [
      { product: '路由器', region: '华北', sales: 1880, date: new Date() },
      { product: '交换机', region: '华东', sales: 920, date: new Date() }
    ],
    headerStyle: { font: { bold: true }, fill: { fgColor: '#eef2ff', patternType: 'solid' } },
    dataStyle: { alignment: { horizontal: 'center' } }
  }
})

// 组合为工作簿并导出
const workbook = new Workbook('月度报表', { sheets: [sheet] })
const blob = await workbook.write()
// 浏览器中触发下载
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'report.xlsx'
a.click()
URL.revokeObjectURL(url)
```

## 核心对象

### 单元格与行

```typescript
import { Cell, Row } from '@cat-kit/excel'

// 带样式的单元格
const price = new Cell(1999, {
  font: { bold: true, color: '#2563eb' },
  numberFormat: '#,##0'
})

// 设置行高与行级样式
const row = new Row(['商品', '价格', '状态'], { height: 24 })
  .withStyle({ alignment: { horizontal: 'center', vertical: 'middle' } })
  .withCell(2, new Cell('已上架', { fill: { fgColor: '#ecfeff', patternType: 'solid' } }))
```

### 工作表

```typescript
import { Worksheet, Row, Cell } from '@cat-kit/excel'

const sheet = new Worksheet('库存', {
  rows: [
    ['SKU', '名称', '库存'],
    ['A-001', '电源适配器', 320],
    ['A-002', '键盘', 120]
  ]
})
  // 插入汇总行
  .insertRow(1, new Row(['总计', null, 440], { height: 20 }))
  // 批量更新单元格样式
  .setCellStyles('A1:C1', {
    font: { bold: true },
    fill: { fgColor: '#f5f5f5', patternType: 'solid' }
  })
  // 单元格按地址更新
  .updateCell('C3', new Cell(200, { numberFormat: '#,##0' }))
```

### 工作簿

```typescript
import { Workbook } from '@cat-kit/excel'

const book = new Workbook('仓储', {
  sheets: [sheetA, sheetB],
  metadata: { creator: 'Cat Kit', created: new Date() }
})
  .addSheet(sheetC)
  .withName('仓储报表')
  .withMetadata({ customProperties: { env: 'prod' } })
```

## 读取 Excel 文件

```typescript
import { readWorkbook } from '@cat-kit/excel'

const workbook = await readWorkbook(file)
const firstSheet = workbook.getSheet(0)
const firstValue = firstSheet?.getCell('A1')?.value
```

## 流式读取大文件

```typescript
import { readWorkbookStream } from '@cat-kit/excel'

const stream = readWorkbookStream(file, {
  sheetIndices: [0], // 只读首个工作表
  batchSize: 1000
})

const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  console.log(value.sheetName, value.rowIndex, value.row.getValues())
}
```

> ⚠️ 流式模式在解析时按工作表逐步解压并按 `<row>` 片段增量产出，`batchSize` 控制解析过程的让步频率，可减少主线程占用；处理超大文件时仍需确保可容纳单个工作表的 XML 数据。

## 流式写入

```typescript
import { StreamWorkbookWriter } from '@cat-kit/excel'

const writer = new StreamWorkbookWriter({ workbookName: '导出报表' })
writer.addSheet(summarySheet)
writer.addSheet(detailSheet)

const blob = await writer.write()
```

## Worker 支持

```typescript
import { ExcelWorkerClient } from '@cat-kit/excel'

const client = new ExcelWorkerClient(new URL('./excel.worker', import.meta.url))
const workbook = await client.readWorkbook(file)

// 在 Worker 中完成写入（可传 Workbook 实例或可序列化的 plain object）
const blob = await client.writeWorkbook({
  name: '报表',
  sheets: [
    { name: 'Sheet1', rows: [['A1', 'B1'], ['A2', 'B2']] }
  ]
})

// 处理完毕后主动释放
client.terminate()
```

## 地址与日期工具

```typescript
import {
  parseAddress,
  formatRange,
  excelNumberToDate,
  dateToExcelNumber
} from '@cat-kit/excel'

parseAddress('B2') // { row: 1, column: 1 }
formatRange({ start: { row: 0, column: 0 }, end: { row: 1, column: 2 } }) // 'A1:C2'
excelNumberToDate(45567) // Date
dateToExcelNumber(new Date()) // number
```

## 示例

- 导出一份带汇总行与样式的销售报表，并触发浏览器下载：

::: demo excel/create-and-download.vue
:::

- 选择本地 `.xlsx` 文件，流式读取首个工作表并展示前几行：

::: demo excel/stream-read.vue
:::
