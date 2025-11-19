# 日期处理

提供 `Dater` 类和 `date` 工厂函数用于日期操作和格式化。

## Dater 类

`Dater` 是对原生 `Date` 的封装，提供了更友好的 API。

### 创建日期对象

```typescript
import { Dater, date } from '@cat-kit/core'

// 使用构造函数
const d1 = new Dater(new Date())
const d2 = new Dater(1700000000000) // 时间戳
const d3 = new Dater('2024-01-15') // 字符串

// 使用工厂函数
const d4 = date() // 当前时间
const d5 = date('2024-01-15 10:30:45')
const d6 = date(1700000000000)
```

### 获取日期属性

```typescript
import { date } from '@cat-kit/core'

const d = date('2024-01-15 10:30:45')

d.year // 2024
d.month // 1 (从1开始，不是0)
d.day // 15
d.hours // 10
d.minutes // 30
d.seconds // 45
d.weekDay // 1 (周一，0=周日)
d.timestamp // 时间戳(毫秒)
d.raw // 原生 Date 对象
```

### 设置日期属性

```typescript
import { date } from '@cat-kit/core'

const d = date('2024-01-15')

// 链式调用
d.setYear(2025).setMonth(6).setDay(20).setHours(14).setMinutes(30).setSeconds(0)

console.log(d.format()) // '2025-06-20'
```

### 日期格式化

```typescript
import { date } from '@cat-kit/core'

const d = date('2024-01-15 14:30:45')

// 默认格式
d.format() // '2024-01-15'

// 自定义格式
d.format('yyyy-MM-dd') // '2024-01-15'
d.format('yyyy/MM/dd') // '2024/01/15'
d.format('yyyy年MM月dd日') // '2024年01月15日'

// 包含时间
d.format('yyyy-MM-dd HH:mm:ss') // '2024-01-15 14:30:45'
d.format('HH:mm') // '14:30'

// 12小时制
d.format('hh:mm') // '02:30'

// 灵活格式
d.format('yyyy/M/d') // '2024/1/15' (不补零)
d.format('yyyy-MM-dd HH:mm') // '2024-01-15 14:30'
```

### 格式化占位符

| 占位符 | 说明          | 示例  |
| ------ | ------------- | ----- |
| `yyyy` | 4 位年份      | 2024  |
| `YYYY` | 4 位年份      | 2024  |
| `MM`   | 2 位月份      | 01-12 |
| `M`    | 月份          | 1-12  |
| `dd`   | 2 位日期      | 01-31 |
| `d`    | 日期          | 1-31  |
| `HH`   | 24 小时制小时 | 00-23 |
| `H`    | 24 小时制小时 | 0-23  |
| `hh`   | 12 小时制小时 | 01-12 |
| `h`    | 12 小时制小时 | 1-12  |
| `mm`   | 2 位分钟      | 00-59 |
| `m`    | 分钟          | 0-59  |
| `ss`   | 2 位秒        | 00-59 |
| `s`    | 秒            | 0-59  |

### 日期计算

```typescript
import { date } from '@cat-kit/core'

const d = date('2024-01-15')

// 加减天数
const tomorrow = d.calc(1, 'days')
const yesterday = d.calc(-1, 'days')
const nextWeek = d.calc(7, 'days')

// 加减周
const nextWeek2 = d.calc(1, 'weeks')
const lastWeek = d.calc(-1, 'weeks')

// 加减月
const nextMonth = d.calc(1, 'months')
const lastMonth = d.calc(-1, 'months')

// 加减年
const nextYear = d.calc(1, 'years')
const lastYear = d.calc(-1, 'years')

// 默认按天计算
const future = d.calc(30) // 30天后
```

### 日期比较

```typescript
import { date } from '@cat-kit/core'

const d1 = date('2024-01-15')
const d2 = date('2024-01-20')

// 比较天数差
const diff = d1.compare(d2) // -5 (5天前)
const diff2 = d2.compare(d1) // 5 (5天后)

// 自定义比较（小时差）
const hoursDiff = d1.compare(d2, timeDiff => {
  return Math.floor(timeDiff / (1000 * 60 * 60))
})

// 比较相同日期
const same = d1.compare(d1) // 0
```

### 月份操作

```typescript
import { date } from '@cat-kit/core'

const d = date('2024-01-15')

// 跳转到月末
d.toEndOfMonth() // 2024-01-31

// 跳转到下个月末
d.toEndOfMonth(1) // 2024-02-29

// 获取这个月的天数
const days = d.getDays() // 31
```

## 实际应用

### 日期范围选择器

```typescript
import { date, Dater } from '@cat-kit/core'

interface DateRange {
  start: Dater
  end: Dater
}

class DateRangePicker {
  getToday(): DateRange {
    const today = date()
    return {
      start: date(today.format('yyyy-MM-dd 00:00:00')),
      end: date(today.format('yyyy-MM-dd 23:59:59'))
    }
  }

  getYesterday(): DateRange {
    const yesterday = date().calc(-1, 'days')
    return {
      start: date(yesterday.format('yyyy-MM-dd 00:00:00')),
      end: date(yesterday.format('yyyy-MM-dd 23:59:59'))
    }
  }

  getLast7Days(): DateRange {
    const end = date()
    const start = date().calc(-6, 'days')
    return {
      start: date(start.format('yyyy-MM-dd 00:00:00')),
      end: date(end.format('yyyy-MM-dd 23:59:59'))
    }
  }

  getLast30Days(): DateRange {
    const end = date()
    const start = date().calc(-29, 'days')
    return {
      start: date(start.format('yyyy-MM-dd 00:00:00')),
      end: date(end.format('yyyy-MM-dd 23:59:59'))
    }
  }

  getThisMonth(): DateRange {
    const now = date()
    const start = date(`${now.year}-${now.month}-01 00:00:00`)
    const end = date(now.format('yyyy-MM-dd 23:59:59'))
    return { start, end }
  }

  getLastMonth(): DateRange {
    const now = date()
    const lastMonth = now.calc(-1, 'months')
    const start = date(`${lastMonth.year}-${lastMonth.month}-01 00:00:00`)
    const end = date(start.format()).toEndOfMonth()
    return {
      start,
      end: date(end.format('yyyy-MM-dd 23:59:59'))
    }
  }
}
```

### 倒计时

```typescript
import { date, Dater } from '@cat-kit/core'

class Countdown {
  private target: Dater
  private timer?: number

  constructor(targetDate: string | Date | number) {
    this.target = date(targetDate)
  }

  start(
    callback: (remaining: {
      days: number
      hours: number
      minutes: number
      seconds: number
    }) => void
  ) {
    this.timer = window.setInterval(() => {
      const now = date()
      const diff = now.compare(this.target, ms => Math.abs(ms))

      if (diff <= 0) {
        this.stop()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      callback({ days, hours, minutes, seconds })
    }, 1000)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}

// 使用
const countdown = new Countdown('2024-12-31 23:59:59')
countdown.start(({ days, hours, minutes, seconds }) => {
  console.log(`${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`)
})
```

### 工作日计算

```typescript
import { date, Dater } from '@cat-kit/core'

class WorkDayCalculator {
  private holidays: Set<string> = new Set()

  constructor(holidays: string[] = []) {
    holidays.forEach(h => this.holidays.add(h))
  }

  isWorkDay(d: Dater): boolean {
    // 周末
    if (d.weekDay === 0 || d.weekDay === 6) {
      return false
    }

    // 法定节假日
    const dateStr = d.format('yyyy-MM-dd')
    if (this.holidays.has(dateStr)) {
      return false
    }

    return true
  }

  getWorkDaysBetween(start: Dater, end: Dater): number {
    let count = 0
    let current = date(start.format())

    while (current.compare(end) <= 0) {
      if (this.isWorkDay(current)) {
        count++
      }
      current = current.calc(1, 'days')
    }

    return count
  }

  addWorkDays(start: Dater, days: number): Dater {
    let current = date(start.format())
    let remaining = days

    while (remaining > 0) {
      current = current.calc(1, 'days')
      if (this.isWorkDay(current)) {
        remaining--
      }
    }

    return current
  }
}

// 使用
const calculator = new WorkDayCalculator([
  '2024-01-01', // 元旦
  '2024-02-10', // 春节
  '2024-02-11'
  // ... 更多节假日
])

const workDays = calculator.getWorkDaysBetween(
  date('2024-01-01'),
  date('2024-01-31')
)
console.log(`1月工作日: ${workDays}天`)
```

### 年龄计算

```typescript
import { date, Dater } from '@cat-kit/core'

function calculateAge(birthday: string | Date): {
  years: number
  months: number
  days: number
} {
  const birth = date(birthday)
  const now = date()

  let years = now.year - birth.year
  let months = now.month - birth.month
  let days = now.day - birth.day

  if (days < 0) {
    months--
    const lastMonth = now.calc(-1, 'months')
    days += lastMonth.getDays()
  }

  if (months < 0) {
    years--
    months += 12
  }

  return { years, months, days }
}

// 使用
const age = calculateAge('1990-05-15')
console.log(`${age.years}岁 ${age.months}个月 ${age.days}天`)
```

### 日历生成器

```typescript
import { date, Dater } from '@cat-kit/core'

interface CalendarDay {
  date: Dater
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

function generateCalendar(year: number, month: number): CalendarDay[][] {
  const firstDay = date(`${year}-${month}-01`)
  const lastDay = date(firstDay.format()).toEndOfMonth()

  // 补全周的开始
  const startWeekDay = firstDay.weekDay
  const startDate = firstDay.calc(
    -(startWeekDay === 0 ? 6 : startWeekDay - 1),
    'days'
  )

  // 补全周的结束
  const endWeekDay = lastDay.weekDay
  const endDate = lastDay.calc(endWeekDay === 0 ? 0 : 7 - endWeekDay, 'days')

  // 生成日历
  const weeks: CalendarDay[][] = []
  let week: CalendarDay[] = []

  let current = date(startDate.format())
  const today = date()

  while (current.compare(endDate) <= 0) {
    week.push({
      date: date(current.format()),
      isCurrentMonth: current.month === month,
      isToday: current.format() === today.format(),
      isWeekend: current.weekDay === 0 || current.weekDay === 6
    })

    if (week.length === 7) {
      weeks.push(week)
      week = []
    }

    current = current.calc(1, 'days')
  }

  return weeks
}

// 使用
const calendar = generateCalendar(2024, 1)
calendar.forEach((week, i) => {
  console.log(`Week ${i + 1}:`)
  week.forEach(day => {
    console.log(`  ${day.date.format('MM-dd')} ${day.isToday ? '(今天)' : ''}`)
  })
})
```

## API 参考

### Dater 类

#### 构造函数

```typescript
new Dater(date: number | string | Date | Dater)
```

#### 属性 (只读)

- `raw: Date` - 原生 Date 对象
- `year: number` - 年份
- `month: number` - 月份 (1-12)
- `day: number` - 日期 (1-31)
- `hours: number` - 小时 (0-23)
- `minutes: number` - 分钟 (0-59)
- `seconds: number` - 秒 (0-59)
- `weekDay: number` - 星期 (0=周日, 1=周一, ..., 6=周六)
- `timestamp: number` - 时间戳(毫秒)

#### 方法

- `setYear(year)` - 设置年份
- `setMonth(month)` - 设置月份 (1-12)
- `setDay(day)` - 设置日期
- `setHours(hours)` - 设置小时
- `setMinutes(minutes)` - 设置分钟
- `setSeconds(seconds)` - 设置秒
- `setTime(timestamp)` - 设置时间戳
- `format(formatter?)` - 格式化日期
- `calc(timeStep, type?)` - 计算相对日期
- `compare(date, reducer?)` - 比较日期
- `toEndOfMonth(offsetMonth?)` - 跳转到月末
- `getDays()` - 获取当月天数

### date 工厂函数

```typescript
function date(d?: number | string | Date | Dater): Dater
```

创建 Dater 实例，不传参数则使用当前时间。

## 注意事项

1. **月份从 1 开始**：`month` 属性从 1 开始，与原生 Date 不同
2. **方法链式调用**：set 方法返回 this，支持链式调用
3. **不可变性**：`calc` 等方法返回新实例，不修改原对象
4. **时区**：使用本地时区，跨时区应用需特殊处理
5. **闰年**：自动处理闰年 2 月 29 日

## 最佳实践

1. **统一使用 Dater**：在项目中统一使用 Dater 而非原生 Date
2. **格式化字符串常量**：定义常量避免格式字符串错误
3. **时区感知**：跨时区应用考虑使用 UTC
4. **验证输入**：解析用户输入的日期时进行验证
5. **性能考虑**：频繁操作时复用 Dater 实例
