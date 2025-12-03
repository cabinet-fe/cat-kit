# 日期处理

`Dater` 类和 `date` 工厂函数提供日期的构造、格式化、对齐、比较与判定等能力，适用于浏览器和 Node.js 环境。

## 快速上手

```ts
import { date, Dater } from '@cat-kit/core'

const d = date('2024-01-15 10:30:45')
d.format('yyyy-MM-dd HH:mm:ss') // 2024-01-15 10:30:45

d.clone().addDays(1).startOf('day').format() // 2024-01-16
```

## 构造与克隆

- 接受 `number | string | Date | Dater`，不传则使用当前时间。
- 无效输入行为与 `new Date` 一致：返回 `Invalid Date`（时间戳为 `NaN`），不会抛错。
- `clone()` 生成独立实例，避免共享可变引用。

```ts
const d1 = new Dater('2024-01-15')
const d2 = date(1700000000000)
const copy = d1.clone()
```

## 获取属性

```ts
const d = date('2024-01-15 10:30:45')

d.year    // 2024
d.month   // 1 (从 1 开始)
d.day     // 15
d.weekDay // 1 (周一，0=周日)
d.hours   // 10
d.minutes // 30
d.seconds // 45
d.timestamp // 毫秒时间戳
d.raw       // 原生 Date
```

## 修改日期

- **可变**：`setYear`、`setMonth`、`setDay`、`setHours`、`setMinutes`、`setSeconds`、`setTime`，返回自身可链式调用。
- **不可变**：`addDays`、`addWeeks`、`addMonths`、`addYears`、`calc` 返回新实例；`clone` 可配合使用。

```ts
const base = date('2024-01-15')

base.setYear(2025).setMonth(6).setDay(20)
base.format() // 2025-06-20

const nextWeek = base.clone().addWeeks(1) // base 未被修改
```

## 格式化

```ts
const d = date('2024-01-15 14:30:45')

d.format() // 默认 'yyyy-MM-dd'
d.format('yyyy/MM/dd') // 2024/01/15
d.format('yyyy年M月d日') // 2024年1月15日
d.format('hh:mm') // 02:30 (12 小时制)
d.format('yyyy-MM-dd HH:mm:ss', { utc: true }) // 按 UTC 输出
```

### 占位符

| 占位符 | 说明 | 示例 |
| --- | --- | --- |
| `yyyy`/`YYYY` | 4 位年份 | 2024 |
| `M`/`MM` | 月份（1-12） | 1 / 01 |
| `d`/`dd`/`D`/`DD` | 日期（1-31） | 5 / 05 |
| `H`/`HH` | 24 小时制 | 0 / 00 |
| `h`/`hh` | 12 小时制 | 1 / 01 |
| `m`/`mm` | 分钟 | 3 / 03 |
| `s`/`ss` | 秒 | 7 / 07 |

## 解析

`Dater.parse(value, format?, { utc? })` 使用与 `format` 相同的占位符模板解析字符串；未传模板时等价于 `new Dater(value)`。

```ts
const parsed = Dater.parse('2024-03-05 14:20:10', 'yyyy-MM-dd HH:mm:ss')
parsed.format('yyyy/MM/dd HH:mm') // 2024/03/05 14:20

const utcParsed = Dater.parse('2024-01-01 00:00:00', 'yyyy-MM-dd HH:mm:ss', { utc: true })
utcParsed.format('yyyy-MM-dd HH:mm:ss', { utc: true }) // 2024-01-01 00:00:00

// 无效日期：timestamp 为 NaN（不抛错）
const invalid = Dater.parse('2024-02-30', 'yyyy-MM-dd')
Number.isNaN(invalid.timestamp) // true
```

## 计算与对齐

```ts
const d = date('2024-03-15 10:20:30')

d.calc(7) // +7 天
d.addMonths(1) // +1 月（不可变）

d.startOf('day')   // 2024-03-15 00:00:00
d.endOf('day')     // 2024-03-15 23:59:59
d.startOf('week')  // 周一为一周开始
```

## 比较、差值与范围

```ts
const a = date('2024-01-15')
const b = date('2024-01-20')

a.compare(b) // -5（天数差，向零取整）
a.diff(b, 'hours') // -120
a.diff(b, 'weeks', { float: true }) // -0.714...
a.diff(b, 'days', { absolute: true }) // 5

// 范围与判定
a.isBetween('2024-01-10', '2024-01-31') // true
a.isSameDay('2024-01-15 23:00:00') // true
a.isSameMonth('2024-01-01') // true
a.isSameYear('2024-12-01') // true
a.isWeekend() // 根据星期判断
a.isLeapYear() // 2024 -> true
```

## 月份工具

```ts
const d = date('2024-02-15')

d.toEndOfMonth() // 2024-02-29
d.getDays() // 29
```

## 注意事项

1. 月份从 1 开始，星期从周日=0 起算，`startOf('week')` 以周一为一周开始。
2. `set*` 属于可变操作；`add*`/`calc`/`startOf`/`endOf`/`clone` 返回新实例。
3. `format`/`parse` 默认使用本地时区，可通过 `utc: true` 切换为 UTC。
4. 无效日期不会抛错，需在业务侧检查 `Number.isNaN(d.timestamp)`。
5. 复杂跨月/跨年的差值请优先使用 `diff` 而非手写算法。
