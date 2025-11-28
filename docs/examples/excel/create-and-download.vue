<template>
  <div class="excel-card">
    <div class="excel-card__actions">
      <var-button type="primary" :loading="downloading" @click="downloadReport">
        生成并下载报表
      </var-button>
      <span class="excel-card__hint">使用 Worksheet.table 自动生成表头与样式</span>
    </div>

    <table class="excel-preview">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">{{ column.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in sampleData" :key="index">
          <td>{{ item.product }}</td>
          <td>{{ item.region }}</td>
          <td class="number-cell">{{ item.sales.toLocaleString() }}</td>
          <td>{{ formatDate(item.date) }}</td>
        </tr>
      </tbody>
    </table>

    <p class="excel-card__meta" v-if="lastDownloaded">
      最近下载于：{{ lastDownloaded }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Workbook, Worksheet, Row, Cell } from '@cat-kit/excel'

interface SalesItem {
  product: string
  region: string
  sales: number
  date: Date
}

const columns = [
  { name: '产品', key: 'product', width: 120 },
  { name: '区域', key: 'region', width: 100, align: 'center' },
  { name: '销量', key: 'sales', format: '#,##0' },
  { name: '日期', key: 'date' }
] as const

const sampleData: SalesItem[] = [
  { product: '路由器', region: '华北', sales: 1880, date: new Date('2024-11-05') },
  { product: '交换机', region: '华东', sales: 920, date: new Date('2024-11-06') },
  { product: 'Wi-Fi 6 AP', region: '华南', sales: 1350, date: new Date('2024-11-07') }
]

const downloading = ref(false)
const lastDownloaded = ref<string | null>(null)
const totalSales = computed(() => sampleData.reduce((sum, item) => sum + item.sales, 0))

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

async function downloadReport() {
  downloading.value = true
  try {
    const sheet = new Worksheet('销售明细', {
      table: {
        columns: columns.map(col => ({
          ...col,
          // 给数字列增加右对齐
          align: col.key === 'sales' ? 'right' : col.align
        })),
        data: sampleData,
        headerStyle: {
          font: { bold: true },
          fill: { fgColor: '#eef2ff', patternType: 'solid' }
        },
        dataStyle: { alignment: { vertical: 'middle' } }
      },
      mergedCells: [{ start: { row: 0, column: 0 }, end: { row: 0, column: 1 } }]
    })

    // 插入一行汇总数据
    const summaryRow = new Row(
      [
        new Cell('本月合计', {
          font: { bold: true },
          fill: { fgColor: '#fef3c7', patternType: 'solid' }
        }),
        new Cell(null),
        new Cell(totalSales.value, {
          numberFormat: '#,##0',
          font: { bold: true, color: '#1f2937' }
        }),
        new Cell(new Date(), { numberFormat: 'yyyy-mm-dd' })
      ],
      { height: 22 }
    )

    const sheetWithSummary = sheet.insertRow(1, summaryRow)

    const workbook = new Workbook('销售报表', {
      sheets: [sheetWithSummary],
      metadata: { creator: 'Cat Kit 示例', created: new Date() }
    })

    const blob = await workbook.write()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    lastDownloaded.value = new Date().toLocaleTimeString()
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.excel-card {
  background: var(--vt-c-bg-soft);
  border: 1px solid var(--vt-c-divider);
  border-radius: 12px;
  padding: 16px;
}

.excel-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.excel-card__hint {
  color: var(--vt-c-text-2);
  font-size: 14px;
}

.excel-card__meta {
  margin-top: 12px;
  color: var(--vt-c-text-2);
  font-size: 13px;
}

.excel-preview {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: var(--vt-c-bg);
  border: 1px solid var(--vt-c-divider);
}

.excel-preview th,
.excel-preview td {
  padding: 10px;
  border: 1px solid var(--vt-c-divider);
  text-align: left;
}

.excel-preview thead {
  background: #eef2ff;
}

.number-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
