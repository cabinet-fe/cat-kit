# @cat-kit/excel API 参考

## 创建工作簿

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

## 创建工作表

```ts
const ws = wb.addWorksheet('sheet1', {
  defaultRowHeight: 18,
  defaultColWidth: 11,
  frozenPane: { xSplit: 1, ySplit: 1, topLeftCell: 'B2' }
})
```

## 设置列
