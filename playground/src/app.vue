<template>
  <button @click="exportXLSX">导出XLSX</button>
</template>

<script lang="ts" setup>
import { Workbook, Worksheet } from '@cat-kit/excel'

async function exportXLSX() {
  // 创建工作表
  const sheet = new Worksheet('Sheet1', {
    // rows: [
    //   ['姓名', '年龄', '日期'],
    //   ['张三', 25, new Date('2024-01-01')],
    //   ['李四', 30, new Date('2024-01-02')]
    // ]
    table: {
      columns: [
        { name: '姓名', key: 'name', width: 200 },
        { name: '年龄', key: 'age', width: 200 },
        { name: '日期', key: 'date', width: 200 }
      ],
      data: [
        { name: '张三', age: 20, date: '2024-01-01' },
        { name: '李四', age: 21, date: '2024-01-02' }
      ]
    }
  })

  // 创建工作簿
  const workbook = new Workbook('我的工作簿', {
    sheets: [sheet]
  })
  // 导出为 Blob
  const blob = await workbook.write()

  console.log(workbook.sheets)
  // 下载文件
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '我的工作簿.xlsx'
  a.click()
}
</script>
