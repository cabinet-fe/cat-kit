---
title: "date 与 Dater 日期 API"
description: "@cat-kit/core 日期 API：date() 与 Dater 类的完整签名——模板格式化与解析、可变/不可变加减、startOf/endOf、diff/compare 差值、isBetween 区间与月尾、闰年查询。"
aliases: [日期 API, dater API, 日期加减, 日期比较]
keywords: [date, Dater, Dater.parse, format, calc, addDays, addMonths, addYears, startOf, endOf, diff, compare, isBetween, isSameDay, isWeekend, getDays, toEndOfMonth, 日期格式化, 时间差, 区间判断]
---

# date 与 Dater 日期 API

`@cat-kit/core` 导出工厂函数 `date(input?)` 与 `Dater` 类。输入支持 `number`（毫秒时间戳）、`string`、`Date` 与 `Dater` 实例。除 `setXxx` / `setTime` / `toEndOfMonth` 原地修改外，其余方法均返回新的 `Dater`。非法输入不抛错，内部 `Date` 为 Invalid Date，读取数值得到 `NaN`。

## 快速上手

```ts
import { date } from '@cat-kit/core'

const d = date('2024-01-15')
console.log(d.addWeeks(1).format('yyyy-MM-dd')) // => '2024-01-22'
console.log(d.format()) // => '2024-01-15'（默认模板 'yyyy-MM-dd'）
console.log(d.month) // => 1（月份从 1 开始）
```

## API 签名

```ts
type DateInput = number | string | Date | Dater

/** 构造 Dater；缺省为当前时间 */
export function date(d?: DateInput): Dater

export declare class Dater {
  constructor(date: DateInput)
  /** 字符串解析。无 format 时用原生 Date 解析；有 format 时按模板严格解析，
   *  不匹配或越界返回 Invalid Date（不抛错） */
  static parse(value: string, format?: string, options?: { utc?: boolean }): Dater

  readonly raw: Date
  get timestamp(): number
  get year(): number
  /** 1~12 */
  get month(): number
  /** 0=周日，1=周一 …… 6=周六 */
  get weekDay(): number
  get day(): number
  get hours(): number
  get minutes(): number
  get seconds(): number

  /** 以下 setter 原地修改并返回 this，可链式 */
  setTime(timestamp: number): Dater
  setYear(year: number): Dater
  /** month 从 1 开始 */
  setMonth(month: number): Dater
  /** 0 表示上个月最后一天 */
  setDay(day: number): Dater
  setHours(hours: number): Dater
  setMinutes(minutes: number): Dater
  setSeconds(sec: number): Dater

  clone(): Dater
  /** 格式化；默认模板 'yyyy-MM-dd'；utc 为 true 时按 UTC 取值 */
  format(formatter?: string, options?: { utc?: boolean }): string
  /** 相对推算，返回新 Dater；type 缺省 'days' */
  calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years'): Dater
  addDays(days: number): Dater
  addWeeks(weeks: number): Dater
  addMonths(months: number): Dater
  addYears(years: number): Dater
  /** 对齐到单位起点；week 以周一为一周开始 */
  startOf(unit: 'day' | 'week' | 'month' | 'year'): Dater
  /** 对齐到单位末尾（23:59:59.999） */
  endOf(unit: 'day' | 'week' | 'month' | 'year'): Dater

  /** 天数差：正数向下取整、负数向上取整，同日不同时刻返回 0 */
  compare(date: DateInput): number
  /** 自定义比较：reducer 收到毫秒差（this − date） */
  compare<R>(date: DateInput, reducer: (timeDiff: number) => R): R
  /** 差值；unit 缺省 'milliseconds' */
  diff(date: DateInput, unit?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', options?: { absolute?: boolean; float?: boolean }): number
  /** 区间判断；inclusive 缺省 '[]'；start/end 大小自动纠正 */
  isBetween(start: DateInput, end: DateInput, options?: { inclusive?: '()' | '[]' | '[)' | '(]' }): boolean
  isSameDay(date: DateInput): boolean
  isSameMonth(date: DateInput): boolean
  isSameYear(date: DateInput): boolean
  isWeekend(): boolean
  isLeapYear(): boolean
  /** 跳到本月或偏移后的月末最后一天；原地修改并返回 this */
  toEndOfMonth(offsetMonth?: number): Dater
  /** 当月天数；不改变实例状态 */
  getDays(): number
}
```

## 参数说明

### 构造与解析

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `d`（`date()`） | `number \| string \| Date \| Dater` | 当前时间 | 否 | 字符串走原生 `Date` 解析；非法值得到 Invalid Date |
| `value`（`Dater.parse`） | `string` | — | 是 | `format` 缺省时用原生解析（如 `'2024-01-15'`、ISO 8601） |
| `format`（`Dater.parse`） | `string` | — | 否 | 占位符 `yyyy/YYYY`、`MM`/`M`、`dd`/`d`/`DD`/`D`、`HH`/`H`、`hh`/`h`、`mm`/`m`、`ss`/`s`；未提供部分的缺省值：年=当年、月=1、日=1、时分秒=0；不匹配或月/日/时/分/秒越界时返回 Invalid Date |
| `options.utc` | `boolean` | `false` | 否 | `true` 时按 UTC 取值或解析 |

### 推算与查询

| 方法/参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | --- |
| `calc` 的 `timeStep` | `number` | — | 是 | 负数向前；`months` / `years` 走原生 setMonth/setFullYear，溢出顺延（`2024-01-31` 加 1 个月得 `2024-03-02`） |
| `calc` 的 `type` | `'days' \| 'weeks' \| 'months' \| 'years'` | `'days'` | 否 | `days` / `weeks` 按固定毫秒数换算 |
| `startOf` / `endOf` 的 `unit` | `'day' \| 'week' \| 'month' \| 'year'` | — | 是 | `endOf` 返回该单位最后一毫秒（`23:59:59.999`）；week 以周一为起点 |
| `diff` 的 `unit` | `'milliseconds'` 至 `'years'` | `'milliseconds'` | 否 | `months` / `years` 为日历差；其余为毫秒差换算 |
| `diff` 的 `options` | `{ absolute?: boolean; float?: boolean }` | `{}` | 否 | `absolute` 取绝对值；`float` 保留小数，仅对 `milliseconds`~`weeks` 生效，缺省 `Math.trunc` 截断；`months` / `years` 恒为整数 |
| `isBetween` 的 `inclusive` | `'()' \| '[]' \| '[)' \| '(]'` | `'[]'` | 否 | `'['` 含边界、`'('` 不含边界 |
| `toEndOfMonth` 的 `offsetMonth` | `number` | `0` | 否 | `1` 为下个月末、`-1` 为上个月末 |

## 方法与事件

- 可变方法（原地修改、返回 `this`）：`setTime`、`setYear`、`setMonth`、`setDay`、`setHours`、`setMinutes`、`setSeconds`、`toEndOfMonth`。
- 不可变方法（返回新 `Dater`）：`clone`、`calc`、`addDays`、`addWeeks`、`addMonths`、`addYears`、`startOf`、`endOf`、`Dater.parse`、`date()`。
- 查询方法（返回值或 `boolean`，同步、不抛错）：`compare`、`diff`、`isBetween`、`isSameDay`、`isSameMonth`、`isSameYear`、`isWeekend`、`isLeapYear`、`getDays`、`format`、`timestamp` 与各字段 getter。
- 全部方法同步执行；任何输入都不抛异常，非法日期经 `NaN` 传播。

## 典型示例

### 格式化与模板解析

```ts
import { Dater, date } from '@cat-kit/core'

const d = date(new Date(2024, 2, 5, 15, 4, 5))
console.log(d.format('yyyy-MM-dd HH:mm:ss')) // => '2024-03-05 15:04:05'
console.log(d.format('hh:mm A')) // => '03:04 A'（未知占位符 A 原样保留；hh 为 12 小时制）

const parsed = Dater.parse('15/03 2024', 'dd/MM yyyy')
console.log(parsed.format('yyyy-MM-dd')) // => '2024-03-15'

const invalid = Dater.parse('nope', 'yyyy-MM-dd')
console.log(invalid.timestamp) // => NaN
```

### 截止日推算与区间判断

```ts
import { date } from '@cat-kit/core'

const start = date('2024-03-10')
const deadline = start.addMonths(1).endOf('month')
console.log(deadline.format('yyyy-MM-dd HH:mm:ss')) // => '2024-04-30 23:59:59'

const now = date('2024-04-15')
console.log(now.isBetween('2024-04-01', '2024-04-30')) // => true（默认闭区间 []）
console.log(now.diff('2024-03-10', 'days')) // => 36
console.log(now.diff('2024-03-10', 'days', { absolute: true })) // => 36
console.log(date('2024-03-10').diff('2024-04-15', 'days')) // => -36
```

### 日历查询：月末、当月天数、闰年

```ts
import { date } from '@cat-kit/core'

console.log(date('2024-02-10').getDays()) // => 29（闰年）
console.log(date('2024-02-10').isLeapYear()) // => true
console.log(date('2024-03-10').isWeekend()) // => true（周日）
console.log(date('2024-03-10').isSameDay('2024-03-10 23:00')) // => true

const monthEnd = date('2024-01-15')
monthEnd.toEndOfMonth()
console.log(monthEnd.format('yyyy-MM-dd')) // => '2024-01-31'（toEndOfMonth 原地修改）

const nextEnd = date('2024-01-15').clone().toEndOfMonth(1)
console.log(nextEnd.format('yyyy-MM-dd')) // => '2024-02-29'
```

## 注意事项

> [!WARNING]
> - 本库没有 `isBefore` / `isAfter` / `isSame` 方法；前置/后置判断用 `compare(other) > 0` / `< 0`，同日/同月/同年用 `isSameDay` / `isSameMonth` / `isSameYear`。
> - 本库的 `month` 从 1 开始（1~12），`setMonth(2)` 是二月；这不是原生 `Date` 的 0~11 语义。
> - `startOf('week')` 以周一为一周开始；dayjs 缺省以周日开始，迁移时注意。
> - `diff` 的 `months` / `years` 是日历差（按日锚定），`days` 及以下按固定毫秒数换算，跨夏令时时段会与日历直觉不同。
> - `toEndOfMonth` 是本类中除 `setXxx` 外唯一原地修改的方法；需要保持原值时先 `clone()`。
> - `format` 不支持毫秒与文本占位符：`SSS` 之类的未知写法原样输出到结果里。
> - `addMonths` 溢出顺延（`2024-01-31` 加 1 个月得 `2024-03-02`），不是截断到月末；要月末对齐用 `toEndOfMonth`。
