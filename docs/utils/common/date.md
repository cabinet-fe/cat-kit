# 日期 date

好用的日期库应当保持足够简洁的 api, 保证可读性, 性能.
从前端角度来讲，日期库最大的作用就是生成一个用户易读的文本，次要作用就是转化成一个后端容易接收的数据格式（通常是一个时间戳或者日期字符串）

> TC39 有个提案[**Temporal**](https://github.com/tc39/proposals#onboarding-existing-proposals), 是目前 Date 构造函数的替代， 这意味着，将来某个版本该库会被取缔，但是此刻此日期库仍然是最好的选择（之一）

## 快速使用

```ts
import { date } from 'cat-kit'

// 对此刻的日期默认使用yyyy-MM-dd格式化
date().format()
```

## 格式化 format

前端关于日期格式化最常用的 api

```ts
import { date } from 'cat-kit'

// 对此刻的日期默认使用yyyy-MM-dd格式化
date().format()

// 可以传入一个日期， 日期对象， 时间戳或者由date()生成的对象
date('2022-02-14').format('yyyy/MM/dd')
// 2022/02/14

date(1644796800000).format('yyyy/MM/dd')
// 2022/02/14

date(1644796800000).format('yyyy-MM-dd hh:mm:ss')
// 2022-02-14 08:00:00
```

## 格式化匹配器

matchers 是 date 所返回的构造函数上的一个静态属性，数据是一个对象， 对象的键是需要替换的格式化的文本， 同时也是 RegExp 构造函数的参数。大多数情况下你用不到这个 api。

默认的格式化匹配器

| 占位符 | 描述            | 示例                       |
| ------ | --------------- | -------------------------- |
| yyyy   | 表示完整的年份  | 2022                       |
| M      | 表示月份        | M -> 9, MM -> 09           |
| D      | 表示日期        | D -> 9, DD -> 09           |
| h      | 小时(12 小时制) | h -> 2, hh -> 02           |
| H      | 小时(24 小时制) | H -> 9, HH -> 09, HH -> 14 |
| m      | 分              | m -> 9, mm -> 09           |
| s      | 秒              | s -> 9, ss -> 09           |

你也可以自己添加格式化匹配器。

```ts
// 这是一个增加了周几替换的匹配器
date.setMatcher('w+', (date: Date, len: number) => {
  if (len === 1) {
    return '' + date.getDay()
  } else {
    return '0' + date.getDay()
  }
})

date('2022-02-14').format('w')
// return 1
date('2022-02-14').format('ww')
// return 01
```

## 获取时间戳

时间戳是一个属性，在你第一次访问它时用原生 date 的 getTime()方法获取，后续的获取方式则直接是从缓存中获取。

```ts
// 时间戳（毫秒）
date().timestamp
```

## 日期计算

有时候，你需要计算相对某个时间的相对天数或者月数的日期，你可以使用 calc api.

```ts
date('2022-02-14').calc(10, 'days').format()
// 2022-02-24

date('2022-02-14').calc(-10, 'days').format()
// 2022-02-04

date('2022-02-14').calc(1, 'months').format()
// 2022-03-14

date('2022-02-14').calc(1, 'weeks').format()
// 2022-02-21
```

## 日期比较

如果你想知道两个日期之间差了多少天， 你可以使用 compare api

```ts
date('2022-02-14').compare('2022-03-14')
// 28
```

## 跳转至月末

有时候你想要获取某个月一共有多少天, 你可以进行月份跳转

做万年历的时候挺有用的

```ts
date('2022-10').toEndOfMonth().month
date('2022-10-15').toEndOfMonth().month
// 31

date().toEndOfMonth().month
// 当月的最后一天

date().toEndOfMonth(10).month
// 10个月后的最后一天

date().toEndOfMonth(-2).month
// 2个月之前的最后一天
```


## 获取年月日时分秒

提供了年月日时分秒的快捷写法

处理了月份从 0 开始的问题

```ts
let d = date('2022-02-14 01:02:03')
d.year
// 2022

d.month
// 2

d.day
// 14

d.hour
// 1

d.minute
// 2

d.second
// 3
```

## 插件

一个插件就是一个函数， 该函数接受一个 Date 上下文参数, 可以用来设置匹配器等等
虽然可以直接操作 Dater 的 api，但可以使用插件机制来更好的组织你的代码

```ts
date.use(ctx => {
  ctx.setMatcher('w+', (date: Date, len: number) => {
    if (len === 1) {
      return '' + date.getDay()
    } else {
      return '0' + date.getDay()
    }
  })
})
```
