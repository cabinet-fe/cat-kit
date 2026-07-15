# core — 日期

## 何时使用

- 统一创建、格式化和按模板解析日期。
- 做日期加减、周期起止对齐、差值、区间和同日/同月判断。

## 推荐公开 API

- `date(input?)`、`Dater.parse(value, format?, options?)`：创建或解析。
- `format`：格式化；默认模板为 `yyyy-MM-dd`，可传 `{ utc: true }`。
- `addDays`、`addWeeks`、`addMonths`、`addYears`、`startOf`、`endOf`：返回新的 `Dater`。
- `diff`、`compare`、`isBetween`、`isSameDay`、`isSameMonth`、`isSameYear`：比较。
- `isWeekend`、`isLeapYear`、`getDays`：日期信息。
- `setTime`、`setYear`、`setMonth`、`setDay`、`setHours`、`setMinutes`、`setSeconds`、`toEndOfMonth`：原地修改。

## 最小示例

```ts
import { Dater } from '@cat-kit/core'

const start = Dater.parse('2026-07-15', 'yyyy-MM-dd')
const nextWeek = start.addWeeks(1)

console.log(nextWeek.format('yyyy/MM/dd')) // '2026/07/22'
console.log(nextWeek.diff(start, 'days')) // 7
```

## 约束与边界

- `date` 接受时间戳、字符串、`Date` 或 `Dater`；未提供输入时使用当前时间。
- 无显式模板的字符串解析沿用原生 `Date` 规则，可能受格式和运行环境影响；固定输入格式时优先使用 `Dater.parse`。
- 格式占位符包括 `yyyy`/`YYYY`、`M`/`MM`、`d`/`dd`、`D`/`DD`、`H`/`HH`、`h`/`hh`、`m`/`mm`、`s`/`ss`。`D` 与 `d` 都表示日期，不表示星期。
- `diff` 的单位使用复数全名：`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`weeks`、`months`、`years`；默认单位是 `milliseconds`，结果方向为“当前值减参数值”。
- `diff` 默认向零取整毫秒到周的结果；传 `{ float: true }` 保留小数。月和年按日历差返回整数。
- `startOf('week')` 以周一为一周开始；`isBetween` 默认闭区间，并接受反向起止参数。
- 加减月份与年份遵循 JavaScript `Date` 的日期溢出规则，不自动钳制到目标月末。
- `set*`、`toEndOfMonth` 和通过 `.raw` 修改 `Date` 会改变当前实例；`add*`、`startOf`、`endOf` 返回新实例。
- 解析非法值不会自动抛错，应通过 `timestamp` 是否为 `NaN` 判断有效性。

## 精确类型入口

[日期声明](../../generated/core/date/date.d.ts)
