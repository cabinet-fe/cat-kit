# 日期处理

## 介绍

本页介绍 `@cat-kit/core` 的日期工具 `date` / `Dater`，用于格式化、计算、比较与范围处理。

## 快速使用

```typescript
import { date } from '@cat-kit/core'

const now = date()
const text = now.format('YYYY-MM-DD HH:mm:ss')
const nextWeek = now.addDays(7)
const inRange = now.isBetween('2026-01-01', '2026-12-31')

console.log(text, nextWeek.timestamp, inRange)
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 基础知识

- UTC：协调世界时，不带夏令时偏移的统一时间标准；本地时间 = UTC + 时区偏移。
- 时区与偏移：例如东八区为 UTC+8，西五区为 UTC-5；同一绝对时刻在不同地区呈现的本地时间不同。
- DST（夏令时）：部分地区会在一年内切换偏移，导致“重复或缺失”小时，应尽量在运算中使用 UTC 避免歧义。
- ISO 8601：推荐的时间字符串格式，如 `2024-03-01T12:00:00.000Z`（Z 表示 UTC）；带偏移示例 `2024-03-01T12:00:00+08:00`。
- 时间戳：通常指自 1970-01-01T00:00:00Z 起的毫秒/秒计数（Unix 时间）；与时区无关，适合存储和比较。

### 数据库存储建议

- **统一存储为 UTC**，读取后按需要再转换为本地时区，避免跨地区/夏令时误差。
- **推荐格式**
  - 文本：ISO 8601 UTC 字符串（带 `Z`），便于跨语言解析与排序。
  - 数值：Unix 时间戳（秒或毫秒），类型可用 `BIGINT`（毫秒更精确，需前端/后端一致约定）。
- **字段类型示例**
  - PostgreSQL：`timestamptz`（存储时自动归一到 UTC，查询按会话时区展示）。
  - MySQL/MariaDB：`timestamp` 默认以 UTC 存储；如用 `datetime` 请确保写入即为 UTC。
- **避免做法**
  - 存本地时间且不带偏移信息（会在迁移/跨区时产生歧义）。
  - 将字符串与时间戳混用而无明确约定。
  - 在数据库层做 DST 相关加减法，建议先在应用层转换到 UTC 再入库。

## 快速上手

```typescript
import { date, Dater } from '@cat-kit/core'

const d = date('2024-01-15 10:30:45')
d.format('yyyy-MM-dd HH:mm:ss') // 2024-01-15 10:30:45

d.clone().addDays(1).startOf('day').format() // 2024-01-16
```

## 构造与克隆

- 接受 `number | string | Date | Dater`，不传则使用当前时间。
- 无效输入行为与 `new Date` 一致：返回 `Invalid Date`（时间戳为 `NaN`），不会抛错。
- `clone()` 生成独立实例，避免共享可变引用。

```typescript
const d1 = new Dater('2024-01-15')
const d2 = date(1700000000000)
const copy = d1.clone()
```

## 获取属性

```typescript
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

```typescript
const base = date('2024-01-15')

base.setYear(2025).setMonth(6).setDay(20)
base.format() // 2025-06-20

const nextWeek = base.clone().addWeeks(1) // base 未被修改
```

## 格式化

::: demo core/format-demo.vue
:::

```typescript
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

- 当提供 `format` 时会先按模板校验并提取字段，未匹配成功直接返回 `Invalid Date`。
- 模板缺失的字段使用默认值：年=当前年、月=1、日=1、时分秒=0。
- 解析结果会进行溢出校验（例如 2024-02-30 会返回 `Invalid Date` 而不是自动进位）。

::: demo core/parse-demo.vue
:::

```typescript
const parsed = Dater.parse('2024-03-05 14:20:10', 'yyyy-MM-dd HH:mm:ss')
parsed.format('yyyy/MM/dd HH:mm') // 2024/03/05 14:20

const utcParsed = Dater.parse('2024-01-01 00:00:00', 'yyyy-MM-dd HH:mm:ss', { utc: true })
utcParsed.format('yyyy-MM-dd HH:mm:ss', { utc: true }) // 2024-01-01 00:00:00

// 无效日期：timestamp 为 NaN（不抛错）
const invalid = Dater.parse('2024-02-30', 'yyyy-MM-dd')
Number.isNaN(invalid.timestamp) // true
```

## 计算与对齐

::: demo core/calc-demo.vue
:::

```typescript
const d = date('2024-03-15 10:20:30')

d.calc(7) // +7 天
d.addMonths(1) // +1 月（不可变）

d.startOf('day')   // 2024-03-15 00:00:00
d.endOf('day')     // 2024-03-15 23:59:59
d.startOf('week')  // 周一为一周开始

// calc 支持天/周/月/年
date('2024-01-10').calc(2, 'weeks') // 2024-01-24

// startOf/endOf 返回新的 Dater；endOf 返回该区间最后 1ms
date('2024-02-01 12:00').endOf('month').format('yyyy-MM-dd HH:mm:ss') // 2024-02-29 23:59:59
```

## 比较、差值与范围

::: demo core/compare-demo.vue
:::

```typescript
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

- `compare(date, reducer?)` 默认返回向零取整的天数差；传入 reducer 可基于毫秒差自定义结果。
- `diff` 支持毫秒至年，`absolute` 取绝对值，`float` 允许非整数（仅毫秒-周）。
- `months/years` 差值按日历月/年计算并截断（不会假设固定 30/365 天）。
- `isBetween` 可通过 `inclusive` 指定区间类型：`[]`（默认）、`()`、`[)`、`(]`。

## 月份工具

```typescript
const d = date('2024-02-15')

d.toEndOfMonth() // 2024-02-29
d.getDays() // 29

// 支持偏移跳转到未来/过去月末（可变操作）
date('2024-02-15').toEndOfMonth(1).format() // 2024-03-31
// getDays 会短暂修改日期后恢复原时间戳
```

## 注意事项

1. 月份从 1 开始，星期从周日=0 起算，`startOf('week')` 以周一为一周开始。
2. `set*`、`toEndOfMonth` 属于可变操作；`add*`/`calc`/`startOf`/`endOf`/`clone` 返回新实例。
3. `format`/`parse` 默认使用本地时区，可通过 `utc: true` 切换为 UTC。
4. 无效日期不会抛错，需在业务侧检查 `Number.isNaN(d.timestamp)`。
5. 复杂跨月/跨年的差值请优先使用 `diff` 而非手写算法。
