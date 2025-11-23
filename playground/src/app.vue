<template>
  <div class="container">
    <h1>Excel 库功能示例</h1>

    <div class="section">
      <h2>基础功能</h2>
      <div class="button-group">
        <button @click="basicExport">基础导出</button>
        <button @click="tableExport">表格数据导出</button>
        <button @click="readExcel">读取 Excel 文件</button>
      </div>
    </div>

    <div class="section">
      <h2>样式功能</h2>
      <div class="button-group">
        <button @click="styledExport">样式导出</button>
        <button @click="batchStyleExport">批量样式设置</button>
      </div>
    </div>

    <div class="section">
      <h2>高级功能</h2>
      <div class="button-group">
        <button @click="formulaExport">公式和错误值</button>
        <button @click="dateFormatExport">日期格式</button>
        <button @click="rowColumnOps">行列操作</button>
        <button @click="metadataExport">元数据导出</button>
      </div>
    </div>

    <div class="section">
      <h2>流式处理</h2>
      <div class="button-group">
        <button @click="streamWrite">流式写入</button>
        <button @click="streamRead">流式读取</button>
      </div>
    </div>

    <div class="section">
      <h2>文件上传</h2>
      <input type="file" @change="handleFileUpload" accept=".xlsx" />
    </div>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Workbook,
  Worksheet,
  Cell,
  Row,
  readWorkbook,
  readWorkbookStream,
  StreamWorkbookWriter,
  type CellFormula,
  type CellError
} from '@cat-kit/excel/src'

const message = ref('')

function showMessage(msg: string) {
  message.value = msg
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 1. 基础导出
async function basicExport() {
  const sheet = new Worksheet('基础数据', {
    rows: [
      ['姓名', '年龄', '城市'],
      ['张三', 25, '北京'],
      ['李四', 30, '上海'],
      ['王五', 28, '广州']
    ]
  })

  const workbook = new Workbook('基础示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '基础示例.xlsx')
  showMessage('基础导出成功！')
}

// 2. 表格数据导出
async function tableExport() {
  const sheet = new Worksheet('员工表', {
    table: {
      columns: [
        { name: '姓名', key: 'name', width: 150, align: 'left' },
        { name: '年龄', key: 'age', width: 100, align: 'center' },
        { name: '部门', key: 'department', width: 150 },
        { name: '薪资', key: 'salary', width: 120, format: '#,##0.00' }
      ],
      data: [
        { name: '张三', age: 25, department: '技术部', salary: 15000 },
        { name: '李四', age: 30, department: '销售部', salary: 12000 },
        { name: '王五', age: 28, department: '市场部', salary: 13000 }
      ],
      headerStyle: {
        font: { bold: true, color: '#FFFFFF' },
        fill: { fgColor: '#4472C4', patternType: 'solid' },
        alignment: { horizontal: 'center' }
      }
    }
  })

  const workbook = new Workbook('表格示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '表格示例.xlsx')
  showMessage('表格导出成功！')
}

// 3. 读取 Excel 文件
async function readExcel() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const workbook = await readWorkbook(file)
      showMessage(
        `成功读取！工作簿名称: ${workbook.name}, 工作表数: ${workbook.sheetCount}`
      )
      console.log('工作簿:', workbook)
      console.log('元数据:', workbook.metadata)

      // 遍历工作表
      for (const sheet of workbook) {
        console.log(`工作表: ${sheet.name}, 行数: ${sheet.rowCount}`)
        // 读取前几行数据
        for (let i = 0; i < Math.min(3, sheet.rowCount); i++) {
          const row = sheet.getRow(i)
          if (row) {
            console.log(`  行 ${i}:`, row.getValues())
          }
        }
      }
    } catch (error) {
      showMessage(`读取失败: ${error}`)
      console.error(error)
    }
  }
  input.click()
}

// 4. 样式导出
async function styledExport() {
  // 使用 Row 和 Cell 来创建带样式的行
  const row1 = new Row([
    new Cell('粗体文本', { font: { bold: true } }),
    new Cell('红色文本', { font: { color: '#FF0000' } }),
    new Cell('大号字体', { font: { size: 16 } })
  ])

  const row2 = new Row([
    new Cell('带边框', {
      border: {
        top: { style: 'thick', color: '#000000' },
        bottom: { style: 'thick', color: '#000000' },
        left: { style: 'thick', color: '#000000' },
        right: { style: 'thick', color: '#000000' }
      }
    }),
    new Cell('黄色背景', {
      fill: { fgColor: '#FFFF00', patternType: 'solid' }
    }),
    new Cell('居中对齐', {
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
  ])

  const row3 = new Row([
    new Cell('数字格式', {
      numberFormat: '#,##0.00',
      font: { bold: true }
    }),
    new Cell(1234567.89, {
      numberFormat: '#,##0.00'
    }),
    new Cell(0.85, {
      numberFormat: '0.00%'
    })
  ])

  // 使用 appendRow 来保留样式
  let sheet = new Worksheet('样式示例')
  sheet = sheet.appendRows([row1, row2, row3])

  const workbook = new Workbook('样式示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '样式示例.xlsx')
  showMessage('样式导出成功！')
}

// 5. 批量样式设置
async function batchStyleExport() {
  let sheet = new Worksheet('批量样式', {
    rows: [
      ['A1', 'B1', 'C1', 'D1'],
      ['A2', 'B2', 'C2', 'D2'],
      ['A3', 'B3', 'C3', 'D3']
    ]
  })

  // 批量设置第一行样式
  sheet = sheet.setRowStyles(0, {
    font: { bold: true, color: '#FFFFFF' },
    fill: { fgColor: '#4472C4', patternType: 'solid' }
  })

  // 批量设置第一列样式
  sheet = sheet.setColumnStyles(0, {
    font: { italic: true },
    alignment: { horizontal: 'right' }
  })

  // 批量设置范围样式
  sheet = sheet.setCellStyles('B2:D3', {
    fill: { fgColor: '#E7E6E6', patternType: 'solid' },
    border: {
      top: { style: 'thin', color: '#000000' },
      bottom: { style: 'thin', color: '#000000' }
    }
  })

  const workbook = new Workbook('批量样式示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '批量样式示例.xlsx')
  showMessage('批量样式导出成功！')
}

// 6. 公式和错误值
async function formulaExport() {
  const formula1: CellFormula = {
    type: 'formula',
    formula: 'SUM(A2:A4)',
    value: 150
  }

  const formula2: CellFormula = {
    type: 'formula',
    formula: 'AVERAGE(B2:B4)',
    value: 50
  }

  const error1: CellError = {
    type: 'error',
    error: '#DIV/0!'
  }

  const sheet = new Worksheet('公式示例', {
    rows: [
      ['数值1', '数值2', '公式', '错误值'],
      [10, 20, formula1, error1],
      [20, 30, null, null],
      [30, 40, null, null],
      [null, null, formula2, null]
    ]
  })

  const workbook = new Workbook('公式示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '公式示例.xlsx')
  showMessage('公式导出成功！')
}

// 7. 日期格式
async function dateFormatExport() {
  const now = new Date()
  const row1 = new Row(['日期', '日期时间', '自定义格式'])
  const row2 = new Row([
    new Cell(now, { numberFormat: 'yyyy-mm-dd' }),
    new Cell(now, { numberFormat: 'yyyy-mm-dd hh:mm:ss' }),
    new Cell(now, { numberFormat: 'yyyy年m月d日' })
  ])
  const row3 = new Row([
    new Cell(new Date('2024-01-01'), { numberFormat: 'm/d/yy' }),
    new Cell(new Date('2024-12-31'), { numberFormat: 'd-mmm-yy' }),
    new Cell(new Date('2024-06-15'), { numberFormat: 'mmm-yy' })
  ])

  // 使用 appendRow 来保留样式
  let sheet = new Worksheet('日期示例')
  sheet = sheet.appendRows([row1, row2, row3])

  const workbook = new Workbook('日期示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '日期示例.xlsx')
  showMessage('日期格式导出成功！')
}

// 8. 行列操作
async function rowColumnOps() {
  let sheet = new Worksheet('行列操作', {
    rows: [
      ['原始', '数据', '行'],
      ['A', 'B', 'C']
    ]
  })

  // 插入行
  sheet = sheet.insertRow(1, new Row(['插入', '的行', '数据']))
  sheet = sheet.insertRows(3, [
    new Row(['批量', '插入', '行1']),
    new Row(['批量', '插入', '行2'])
  ])

  // 插入列
  sheet = sheet.insertColumn(1)
  sheet = sheet.insertColumns(3, 2)

  // 更新单元格
  sheet = sheet.updateCell('B2', new Cell('更新的值', { font: { bold: true } }))
  sheet = sheet.updateCell({ row: 0, column: 0 }, '更新的A1')

  // 批量更新
  sheet = sheet.updateCells([
    { address: 'D1', value: '批量1' },
    { address: 'D2', value: '批量2' },
    { address: 'D3', value: '批量3' }
  ])

  const workbook = new Workbook('行列操作示例', { sheets: [sheet] })
  const blob = await workbook.write()
  downloadBlob(blob, '行列操作示例.xlsx')
  showMessage('行列操作导出成功！')
}

// 9. 元数据导出
async function metadataExport() {
  const sheet = new Worksheet('数据', {
    rows: [['示例数据']]
  })

  const workbook = new Workbook('元数据示例', {
    sheets: [sheet],
    metadata: {
      creator: 'Excel 库示例',
      lastModifiedBy: '用户',
      created: new Date(),
      modified: new Date(),
      customProperties: {
        department: '技术部',
        version: '1.0',
        approved: true
      }
    }
  })

  const blob = await workbook.write()
  downloadBlob(blob, '元数据示例.xlsx')
  showMessage('元数据导出成功！')
}

// 10. 流式写入
async function streamWrite() {
  const writer = new StreamWorkbookWriter({
    workbookName: '流式写入示例',
    metadata: {
      creator: 'Stream Writer',
      created: new Date()
    }
  })

  // 逐个添加工作表
  writer.addSheet(
    new Worksheet('工作表1', {
      rows: [['流式', '写入', '示例1']]
    })
  )

  writer.addSheet(
    new Worksheet('工作表2', {
      rows: [['流式', '写入', '示例2']]
    })
  )

  const blob = await writer.write()
  downloadBlob(blob, '流式写入示例.xlsx')
  showMessage('流式写入成功！')
}

// 11. 流式读取
async function streamRead() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const stream = readWorkbookStream(file)
      const reader = stream.getReader()
      let rowCount = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        rowCount++
        console.log(
          `工作表: ${value.sheetName}, 行 ${value.rowIndex}:`,
          value.row.getValues()
        )

        // 只显示前10行
        if (rowCount >= 10) {
          console.log('... (仅显示前10行)')
          break
        }
      }

      showMessage(`流式读取成功！已读取 ${rowCount} 行`)
    } catch (error) {
      showMessage(`流式读取失败: ${error}`)
      console.error(error)
    }
  }
  input.click()
}

// 12. 文件上传处理
async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const workbook = await readWorkbook(file)
    showMessage(
      `文件读取成功！\n工作簿: ${workbook.name}\n工作表数: ${workbook.sheetCount}`
    )

    // 显示工作表信息
    for (const sheet of workbook) {
      console.log(`工作表: ${sheet.name}`)
      console.log(`  行数: ${sheet.rowCount}, 列数: ${sheet.columnCount}`)

      // 显示前3行数据
      for (let i = 0; i < Math.min(3, sheet.rowCount); i++) {
        const row = sheet.getRow(i)
        if (row) {
          console.log(`  行 ${i}:`, row.getValues())
        }
      }
    }

    // 显示元数据
    if (workbook.metadata) {
      console.log('元数据:', workbook.metadata)
    }
  } catch (error) {
    showMessage(`文件读取失败: ${error}`)
    console.error(error)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  padding: 10px 20px;
  background: #4472c4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

button:hover {
  background: #365a9e;
}

button:active {
  background: #2a4a7a;
}

input[type='file'] {
  padding: 10px;
  border: 2px dashed #4472c4;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.message {
  margin-top: 20px;
  padding: 15px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  white-space: pre-line;
}
</style>
