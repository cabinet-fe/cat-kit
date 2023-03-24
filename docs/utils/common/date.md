# 日期 date

好用的日期库应当保持足够简洁的 api, 保证可读性, 性能.
从前端角度来讲，日期库最大的作用就是生成一个用户易读的文本，次要作用就是转化成一个后端容易接收的数据格式（通常是一个时间戳或者日期字符串）

> TC39 有个提案[**Temporal**](https://github.com/tc39/proposals#onboarding-existing-proposals), 是目前 Date 构造函数的替代， 这意味着，将来某个版本该库会被取缔，但是此刻此日期库仍然是最好的选择（之一）

## 快速使用

::: demo
  render(utils/common/date/basic)
:::

## 格式化 format

前端关于日期格式化最常用的 api

::: demo
render(utils/common/date/format)
:::

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

::: demo
render(utils/common/date/matcher)
:::


## 获取时间戳

时间戳是一个属性，在你第一次访问它时用原生 date 的 getTime()方法获取，后续的获取方式则直接是从缓存中获取。

::: demo
render(utils/common/date/timestamp)
:::


## 日期计算

有时候，你需要计算相对某个时间的相对天数或者月数的日期，你可以使用 calc api.

::: demo
render(utils/common/date/calc)
:::

## 日期比较

如果你想知道两个日期之间差了多少天， 你可以使用 compare api

默认情况下compare函数传一个参数即另外一个日期时返回的是天数,
你也可以传入第二个参数, 该参数是一个函数, 改函数有三个参数year, month, day分别代表年月日

::: demo
render(utils/common/date/compare)
:::

## 跳转至月末

有时候你想要获取某个月一共有多少天, 你可以进行月份跳转

也许做万年历的时候挺有用的


::: demo
render(utils/common/date/month-end)
:::

## 获取年月日时分秒

提供了年月日时分秒的快捷写法

处理了月份从 0 开始的问题

::: demo
render(utils/common/date/quick-prop)
:::

## 插件

一个插件就是一个函数， 该函数接受一个 Date 上下文参数, 可以用来设置匹配器等等
虽然可以直接操作 Dater 的 api，但可以使用插件机制来更好的组织你的代码

::: demo
render(utils/common/date/plugins)
:::

