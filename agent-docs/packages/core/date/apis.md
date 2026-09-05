---
title: "日期处理 API"
description: "@cat-kit/core Dater 类完整签名：解析/设置/加减/对齐/比较/格式化与单位类型"
---

# 日期处理 API

本篇列出 `Dater` 的公开签名：工厂函数 `date()`、静态解析 `Dater.parse`、可变与不可变方法、比较与区间判断，以及 `DiffUnit`/`StartEndUnit` 单位类型。

```ts
declare function date(input?: DateInput): Dater

declare class Dater {
  constructor(date: DateInput)
  static parse(value: string, format?: string, options?: { utc?: boolean }): Dater
  readonly raw: Date
  readonly timestamp: number
  // getters: year, month, weekDay, day, hours, minutes, seconds
  setTime(timestamp: number): Dater
  setYear(year: number): Dater
  setMonth(month: number): Dater // 从 1 开始
  setDay(day: number): Dater
  setHours(hours: number): Dater
  setMinutes(minutes: number): Dater
  setSeconds(sec: number): Dater
  clone(): Dater
  format(formatter?: string, options?: { utc?: boolean }): string
  calc(timeStep: number, type?: DiffUnit): Dater
  addDays(n: number): Dater
  addWeeks(n: number): Dater
  addMonths(n: number): Dater
  addYears(n: number): Dater
  startOf(unit: StartEndUnit): Dater
  endOf(unit: StartEndUnit): Dater
  toEndOfMonth(): Dater
  diff(date: DateInput, unit?: DiffUnit, options?: DiffOptions): number
  isBefore(date: DateInput): boolean
  isAfter(date: DateInput): boolean
  isSame(date: DateInput, unit?: StartEndUnit): boolean
  isBetween(
    start: DateInput,
    end: DateInput,
    inclusive?: '()' | '[]' | '[)' | '(]'
  ): boolean
}
```

`DiffUnit`：`'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'`
`StartEndUnit`：`'day' | 'week' | 'month' | 'year'`

完整声明：[packages/core/dist/date/date.d.ts](../../../../packages/core/dist/date/date.d.ts)
