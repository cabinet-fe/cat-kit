<template>
  <div class="excel-card">
    <div class="excel-card__toolbar">
      <label>
        产品
        <input v-model.trim="draft.product" placeholder="例如：企业交换机" />
      </label>
      <label>
        区域
        <input v-model.trim="draft.region" placeholder="例如：华东" />
      </label>
      <label>
        销售额
        <input v-model.number="draft.amount" type="number" min="1" />
      </label>
      <label>
        日期
        <input v-model="draft.date" type="date" />
      </label>
      <button type="button" class="btn" @click="addRow">添加行</button>
    </div>

    <div class="excel-card__actions">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="downloading || rows.length === 0"
        @click="downloadWorkbook"
      >
        {{ downloading ? '生成中...' : '生成并下载 XLSX' }}
      </button>
      <span class="meta">{{ message || `当前 ${rows.length} 行数据，合计 ${totalAmount.toLocaleString()} 元` }}</span>
    </div>

    <table class="preview-table">
      <thead>
        <tr>
          <th>产品</th>
          <th>区域</th>
          <th class="number">销售额</th>
          <th>日期</th>
          <th class="number">税额(13%)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in rows" :key="`${item.product}-${index}`">
          <td>{{ item.product }}</td>
          <td>{{ item.region }}</td>
          <td class="number">{{ item.amount.toLocaleString() }}</td>
          <td>{{ item.date }}</td>
          <td class="number">{{ (item.amount * 0.13).toFixed(2) }}</td>
          <td>
            <button type="button" class="btn btn-ghost" @click="removeRow(index)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import {
  Workbook,
  writeWorkbook,
  formatCellAddress,
  pixelsToExcelWidth,
  type CellStyle
} from '@cat-kit/excel'

interface SalesRow {
  product: string
  region: string
  amount: number
  date: string
}

const rows = ref<SalesRow[]>([
  { product: '企业交换机', region: '华东', amount: 2800, date: '2026-02-10' },
  { product: 'Wi-Fi 7 AP', region: '华南', amount: 3600, date: '2026-02-12' },
  { product: '安全网关', region: '华北', amount: 2200, date: '2026-02-15' }
])

const draft = reactive<SalesRow>({
  product: '',
  region: '华东',
  amount: 1000,
  date: new Date().toISOString().slice(0, 10)
})

const downloading = ref(false)
const message = ref('')

const totalAmount = computed(() =>
  rows.value.reduce((sum, item) => sum + item.amount, 0)
)

const headerStyle: CellStyle = {
  font: { bold: true, color: '#FFFFFF' },
  fill: { type: 'solid', color: '#2563EB' },
  alignment: { horizontal: 'center', vertical: 'center' }
}

const amountStyle: CellStyle = {
  numberFormat: '#,##0.00',
  alignment: { horizontal: 'right' }
}

const dateStyle: CellStyle = {
  numberFormat: 'yyyy-mm-dd'
}

const summaryStyle: CellStyle = {
  font: { bold: true },
  fill: { type: 'solid', color: '#DBEAFE' },
  numberFormat: '#,##0.00'
}

function addRow() {
  if (!draft.product || !draft.region || !Number.isFinite(draft.amount) || draft.amount <= 0) {
    message.value = '请先输入合法的产品、区域和销售额'
    return
  }
  rows.value.push({ ...draft })
  draft.product = ''
  draft.amount = 1000
  message.value = ''
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

function downloadWorkbook() {
  downloading.value = true
  message.value = ''

  try {
    const workbook = new Workbook({
      creator: 'cat-kit docs',
      createdAt: new Date(),
      modifiedAt: new Date()
    })

    const sheet = workbook.addWorksheet('Sales', {
      frozenPane: { ySplit: 1, topLeftCell: 'A2' },
      defaultColWidth: 12,
      defaultRowHeight: 20
    })

    sheet
      .setColumn(1, { header: '产品', width: pixelsToExcelWidth(160) })
      .setColumn(2, { header: '区域', width: pixelsToExcelWidth(100) })
      .setColumn(3, { header: '销售额', width: pixelsToExcelWidth(110) })
      .setColumn(4, { header: '日期', width: pixelsToExcelWidth(120) })
      .setColumn(5, { header: '税额', width: pixelsToExcelWidth(110) })

    const headers = ['产品', '区域', '销售额', '日期', '税额(13%)']
    headers.forEach((title, index) => {
      sheet.setCell(formatCellAddress(1, index + 1), title, headerStyle)
    })

    rows.value.forEach((item, index) => {
      const row = index + 2
      sheet.setCell(`A${row}`, item.product)
      sheet.setCell(`B${row}`, item.region)
      sheet.setCell(`C${row}`, item.amount, amountStyle)
      sheet.setCell(`D${row}`, parseLocalDate(item.date), dateStyle)
      sheet.setCell(
        `E${row}`,
        {
          formula: `C${row}*0.13`,
          result: Number((item.amount * 0.13).toFixed(2))
        },
        amountStyle
      )
    })

    const summaryRow = rows.value.length + 2
    sheet.setCell(`A${summaryRow}`, '合计', { font: { bold: true } })
    sheet.setCell(`C${summaryRow}`, totalAmount.value, summaryStyle)
    sheet.setCell(
      `E${summaryRow}`,
      {
        formula: `C${summaryRow}*0.13`,
        result: Number((totalAmount.value * 0.13).toFixed(2))
      },
      summaryStyle
    )

    const bytes = writeWorkbook(workbook, {
      useSharedStrings: true,
      compressionLevel: 6
    })

    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sales-report-${Date.now()}.xlsx`
    anchor.click()
    URL.revokeObjectURL(url)

    message.value = `已导出 ${rows.value.length} 行数据（${bytes.byteLength} bytes）`
  } catch (error) {
    message.value = error instanceof Error ? error.message : String(error)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.excel-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
}

.excel-card__toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.excel-card__toolbar label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.excel-card__toolbar input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.excel-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.btn {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.btn-ghost {
  background: transparent;
}

.meta {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th,
.preview-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px;
  text-align: left;
}

.preview-table th {
  background: var(--vp-c-bg);
}

.number {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}
</style>
