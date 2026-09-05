---
title: "日期处理"
description: "@cat-kit/core 的 date/Dater：解析、格式化、加减、对齐、比较与区间判断"
---

# 日期处理

`@cat-kit/core` 的日期工具以 `date(input?)` 工厂与 `Dater` 类为核心，提供日期解析、格式化、加减推算、时间对齐（startOf/endOf）、比较与区间判断，输入非法时不抛错而是产出 Invalid Date。

## 适用场景

解析、格式化、加减、对齐、比较与区间判断。

## 推荐公开 API

- `date(input?)`、`Dater.parse(value, format?, { utc? })`
- 可变：`setTime`、`setYear`、`setMonth`、`setDay`、`setHours`、`setMinutes`、`setSeconds`、`toEndOfMonth`
- 不可变：`clone`、`calc`、`addDays|Weeks|Months|Years`、`startOf`、`endOf`
- `diff`、`isBefore`/`isAfter`/`isSame`/`isBetween`、`format`

```ts
import { date } from '@cat-kit/core'

date('2024-01-15').addWeeks(1).format('yyyy-MM-dd')
```

## 约束

- 非法输入产生 Invalid Date / `NaN` 时间戳，不抛错
- `startOf('week')` 以周一为起点
- `diff` 的 month/year 为日历差；day/week 等按固定毫秒
- `isBetween` 接受反转边界，默认包容性 `[]`

## 类型声明

[packages/core/dist/date/date.d.ts](../../../../packages/core/dist/date/date.d.ts)

## 更多

- API：[日期处理 API](apis.md)
