---
title: "日期处理模块（date / Dater）"
description: "@cat-kit/core 的 date 模块：date() 工厂与 Dater 类提供日期解析（含模板解析）、格式化、加减推算、startOf/endOf 对齐、比较、差值、区间判断与月尾/闰年等日历查询。"
aliases: [日期模块, dater 模块, 时间处理模块]
keywords: [date, Dater, 日期格式化, addDays, addMonths, startOf, endOf, diff, compare, isBetween, Dater.parse, 日期解析, 时间差, 区间判断]
---

# 日期处理模块（date / Dater）

`date` 模块从 `@cat-kit/core` 导出工厂函数 `date(input?)` 与 `Dater` 类：支持从 `number` / `string` / `Date` / `Dater` 构造；提供占位符模板的 `format` 格式化与 `Dater.parse` 模板解析、不可变的 `addDays` / `addWeeks` / `addMonths` / `addYears` / `startOf` / `endOf`、可变的 `setXxx` 系列、日历差 `diff` / `compare`、区间判断 `isBetween`、同日/同月/同年判断、周末与闰年判断以及月尾天数查询。非法输入不抛错，产生 Invalid Date（时间戳 `NaN`）。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { Dater, date } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `date` | 包装日期输入为 `Dater`，缺省为当前时间 | `packages/core/date/apis.md` |
| `Dater` | 日期类：`format`、`calc`、`addXxx`、`startOf` / `endOf`、`diff`、`compare`、`isBetween`、`isSameDay` 等 | `packages/core/date/apis.md` |

`Dater.parse` 为 `Dater` 的静态方法；`DateInput`、`DiffUnit`、`DiffOptions`、`FormatOptions` 等类型为源码内部声明，不作命名导出。
