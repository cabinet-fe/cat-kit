---
title: "n 与 $n 数值 API"
description: "@cat-kit/core 数值 API：$n 高精度四则与表达式求值 calc 的抛错条件，n() 的货币格式化（CNY / CNY_HAN）、fixed 精度与 range 限制的完整签名与约束。"
aliases: [数值 API, 高精度计算 API, 货币格式化 API, decimal API]
keywords: [n, $n, Num, plus, minus, mul, div, sum, calc, formatter, currency, CNY, CNY_HAN, fixed, range, NumberFormatOptions, 浮点精度, 表达式求值, 千分位]
---

# n 与 $n 数值 API

`@cat-kit/core` 导出工厂函数 `n(number): Num` 与工具集 `$n`。运算函数内部基于自实现 `Decimal`，输入支持 `number` 或 `string`（字符串入参可避免大数在字面量阶段丢精度），返回值均为 JS `number`。`calc` 对空表达式与非法字符抛 `Error`，其余函数不抛错。

## 快速上手

```ts
import { $n, n } from '@cat-kit/core'

console.log($n.plus(0.1, 0.2)) // => 0.3
console.log($n.calc('1 + 3 * (4 / 2)')) // => 7
console.log(n(1234.56).currency('CNY')) // => '1,234.56'
console.log(n(1.2345).fixed(2)) // => '1.23'
```

## API 签名

```ts
/** 包装数字为 Num 实例，链式格式化与范围限制 */
export function n(n: number): Num

export declare class Num {
  /** 数字转货币字符串 */
  currency(currencyType: 'CNY' | 'CNY_HAN', config?: CurrencyConfig | number): string
  /** 按精度处理小数并返回字符串 */
  fixed(precision: number | { minPrecision?: number; maxPrecision?: number }): string
  /** 从 1 到当前值逐次调用 fn（含端点）；返回自身 */
  each(fn: (n: number) => void): Num
  /** 把值限制在 [min, max] 区间并返回 number；min > max 时自动交换 */
  range(min: number, max: number): number
  /** 不超过 val */
  max(val: number): number
  /** 不小于 val */
  min(val: number): number
}

export type CurrencyConfig = {
  /** 保留小数位数（四舍五入） */
  precision?: number
  /** 最小小数位数（不足补 0） */
  minPrecision?: number
  /** 最大小数位数（超出四舍五入并去尾零） */
  maxPrecision?: number
}

export const $n: {
  /** 创建 Intl.NumberFormat('zh-CN') 格式化器 */
  formatter(options: NumberFormatOptions): Intl.NumberFormat
  /** 依次相加；无参返回 0 */
  plus(...numbers: (number | string)[]): number
  /** 依次相减；无参返回 0 */
  minus(...numbers: (number | string)[]): number
  /** 两数相乘 */
  mul(num1: number | string, num2: number | string): number
  /** 两数相除；除数为 0 时返回 ±Infinity（与 JS 原生语义一致） */
  div(num1: number | string, num2: number | string): number
  /** 求和，同 plus */
  sum(...numbers: (number | string)[]): number
  /** 计算四则表达式，如 '1 + 3 * (4 / 2)' */
  calc(expr: string): number
}

export interface NumberFormatOptions {
  /** 'decimal' 十进制 | 'currency' 货币 | 'percent' 百分比 */
  style?: 'decimal' | 'currency' | 'percent'
  /** style 为 currency 时默认 'CNY'；可选 'CNY' | 'USD' | 'JPY' | 'EUR' */
  currency?: 'CNY' | 'USD' | 'JPY' | 'EUR'
  /** 同时作为 maximum/minimumFractionDigits 的缺省值 */
  precision?: number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  /** 透传 Intl：'standard' | 'scientific' | 'engineering' | 'compact' */
  notation?: Intl.NumberFormatOptions['notation']
}
```

## 参数说明

### $n

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `numbers`（`plus` / `minus` / `sum`） | `(number \| string)[]` | — | 是 | 变长；空参返回 `0`；字符串可表达超长小数 |
| `num1` / `num2`（`mul` / `div`） | `number \| string` | — | 是 | `div` 除数为 `0` 时返回 `Infinity` / `-Infinity`，不抛错 |
| `expr`（`calc`） | `string` | — | 是 | 支持十进制数（含小数与 `e` 科学计数）、`+ - * /`、括号、一元 `±`；空表达式抛 `Error('Empty expression')`；非法字符抛 `Error(\`Unexpected character: ${char}\`)`；括号不配对抛 `Error('Invalid expression: mismatched parentheses')` |
| `options`（`formatter`） | `NumberFormatOptions` | `{}` | 否 | locale 固定 `zh-CN`；`precision` 缺省时 `Intl` 默认最多 3 位小数 |

### Num 方法

| 方法 | 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | --- | :---: | --- |
| `currency` | `currencyType` | `'CNY' \| 'CNY_HAN'` | — | 是 | `CNY` 千分位分隔；`CNY_HAN` 人民币中文大写，绝对值 `>= 1e15` 返回空字符串 `''`，`0` 返回 `'零元整'` |
| `currency` | `config` | `CurrencyConfig \| number` | `{}` | 否 | 数字形式等价 `{ precision: n }`；`CNY_HAN` 仅 `precision` 生效且上限 4 |
| `fixed` | `precision` | `number \| { minPrecision?, maxPrecision? }` | — | 是 | 数字形式按位四舍五入；对象形式先按 `maxPrecision` 四舍五入去尾零、再按 `minPrecision` 补零 |
| `each` | `fn` | `(n: number) => void` | — | 是 | 从 1 遍历到当前值（含）；当前值小于 1 时不执行；返回 `Num` 自身 |
| `range` | `min` / `max` | `number` | — | 是 | `min > max` 自动交换后比较；返回 `number` |
| `max` / `min` | `val` | `number` | — | 是 | 返回 `number` |

## 方法与事件

- `$n` 全部方法与 `Num` 全部方法均为同步函数；只有 `calc` 抛错（错误消息见上表），其余函数对任何数值输入都有返回值。
- `Num.currency` 返回 `string`；负数在 `CNY` 输出前缀 `-`，在 `CNY_HAN` 输出前缀 `负`。
- `Num.each` 返回 `Num` 实例本身，可继续链式调用 `fixed` / `currency`。
- `Num.fixed` 与 `Num.currency` 基于十进制字符串运算做四舍五入，规避二进制浮点误差。

## 典型示例

### 金额汇总与货币展示

```ts
import { $n, n } from '@cat-kit/core'

const prices = [0.1, 0.2, 19.9]
const total = $n.plus(...prices)
console.log(total) // => 20.2
console.log(0.1 + 0.2) // => 0.30000000000000004（原生浮点误差；$n.plus(0.1, 0.2) 为 0.3）
console.log($n.plus(0.1, 0.2)) // => 0.3
console.log($n.mul(19.9, 100)) // => 1990
console.log($n.div(0.3, 0.1)) // => 3
console.log($n.minus(1.0, 0.9)) // => 0.1

console.log(n(1234.5).currency('CNY', { precision: 2 })) // => '1,234.50'
console.log(n(1234.56).currency('CNY_HAN')) // => '壹仟贰佰叁拾肆元伍角陆分'
console.log(n(-1234.56).currency('CNY')) // => '-1,234.56'
```

### 表达式求值与错误处理

```ts
import { $n } from '@cat-kit/core'

console.log($n.calc('1 + 3 * (4 / 2)')) // => 7
console.log($n.calc('-2 + 5')) // => 3（一元负号）
console.log($n.calc('1e2 * 2')) // => 200（科学计数法）

try {
  $n.calc('  ') // 空表达式
} catch (err) {
  console.log((err as Error).message) // => 'Empty expression'
}
try {
  $n.calc('2 + a')
} catch (err) {
  console.log((err as Error).message) // => 'Unexpected character: a'
}
```

### 精度控制与范围限制

```ts
import { n } from '@cat-kit/core'

console.log(n(1.005).fixed(2)) // => '1.01'（十进制四舍五入；原生 (1.005).toFixed(2) 为 '1.00'）
console.log(n(9.99).fixed(1)) // => '10.0'（进位后按 minPrecision 补零）
console.log(n(1.2).fixed({ minPrecision: 2, maxPrecision: 3 })) // => '1.20'

const progress = n(150).range(0, 100)
console.log(progress) // => 100

n(3).each((i) => console.log(i)) // 依次输出 1、2、3
```

## 注意事项

> [!WARNING]
> - 返回值是 JS `number`，不是 `Decimal` 对象：本库是「高精度算完转回 number」，不是 big.js 的链式 `Decimal` 实例；连续运算时用 `$n.calc` 或传入 `string` 减少中间误差。
> - `n(x).fixed(2)` 是十进制四舍五入，与原生 `Number.toFixed` 在 `1.005` 这类边界上结果不同（本库 `'1.01'`，原生 `'1.00'`）。
> - `calc` 只支持数字字面量与四则运算，没有变量、函数与百分号；需要变量先把值拼接进表达式字符串。
> - `$n.formatter` 的 locale 固定 `'zh-CN'`：USD 输出为 `US$1,234.50` 而非 `$1,234.50`。
> - `Num.currency` 的第二个参数接受 `CurrencyConfig` 或 `number`；`CNY_HAN` 只认 `precision` 且最多 4 位（角、分、毫、厘）。
