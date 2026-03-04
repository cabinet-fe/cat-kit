# @cat-kit/excel API 参考

## 工作簿

```ts
// 创建工作簿
// 第二个参数都是必填的
const wb = new Workbook({
  creator: '',
  lastModifiedBy: '',
  createdAt: new Date(),
  modifiedAt: new Date()
})
```

## 工作表

```ts
// 创建工作表
const ws = wb.addWorksheet('sheet1', {
  defaultRowHeight: 18,
  defaultColWidth: 11,
  frozenPane: { xSplit: 1, ySplit: 1, topLeftCell: 'B2' }
})

// 获取工作表列表
const sheets = wb.getSheets()

// 获取工作表
const ws1 = sheets[0]!
// 按`名称/id`获取工作表
const ws2 = wb.getSheet('sheet1')

// 删除工作表
wb.removeSheet(ws1.id)
```

## 设置列
