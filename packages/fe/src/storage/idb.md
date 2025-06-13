# IDB 浏览器数据库

## 简介

这是一个对 IndexedDB 的封装类，目的是为了简化数据库操作

## 使用

```ts
import { IDB } from '@cat-kit/fe'

// 定义store对象
const tables = IDB.defineStore('table-configs', {
  id: {
    type: Number,
    autoIncrement: true,
    required: true,
    primary: true
  },
  name: {
    type: String,
    required: true
  },
  configs: {
    type: Object,
    required: true
  }
})

const idb = new IDB('test', {
  version: 1,
  // 定义的store对象必须添加到stores中，才能在后续操作
  stores: [tables]
})

// 获取表中数据总数
tables.count()

// 新增
tables.add({
  name: 'aaa',
  configs: {}
})

// 查询
tables.find({
  name: 'aaa'
})

// 查询所有匹配的数据
tables.findMany({
  name: 'aaa'
})

// 更新
tables.update('key', {
  name: 'xxx'
})

// 数据替换
tables.put('key', {
  name: 'aaa',
  configs: {}
})

// 删除
tables.delete({
  name: 'aaa'
})

// 删除多个
tables.deleteMany({
  name: 'aaa'
})

// 删除所有
tables.clear()
```
