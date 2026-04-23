---
title: 数字操作
sidebarOrder: 50
---

# 数字操作

## 介绍

提供货币格式化、精确小数、范围限制与高精度四则运算等功能。`n()` 用于链式数字处理，`$n` 提供基于 `BigInt` 的精确计算工具。

## 快速使用

```typescript
import { n, $n } from '@cat-kit/core'

// 货币格式化
n(1234567.89).currency('CNY', 2) // '1,234,567.89'

// 精确小数
n(3.14159).fixed(2) // '3.14'

// 高精度运算
$n.plus(0.1, 0.2) // 0.3
$n.calc('1 + 2 * (3 + 4)') // 15
```

## API参考

### 货币格式化

```typescript
import { n } from '@cat-kit/core'

const amount = n(1234567.89)

// 格式化为人民币
amount.currency('CNY', 2) // '1,234,567.89'

// 格式化为中文大写金额
amount.currency('CNY_HAN', 2)
// '壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分'
```

### 精确小数

```typescript
import { n } from '@cat-kit/core'

const num = n(3.14159)

// 精确到指定小数位
num.fixed(2) // '3.14'
num.fixed(0) // '3'
```

### 范围限制

```typescript
import { n } from '@cat-kit/core'

n(120).range(0, 100) // 100
n(-5).range(0, 10) // 0
n(5).range(0, 10) // 5

n(10).max(5) // 5
n(1).min(5) // 5
```

### 高精度运算

`$n` 提供基于 `BigInt` 的精确四则运算，支持 `number` 或 `string` 入参。对于超过 `Number.MAX_SAFE_INTEGER` 的大数，建议传入 `string` 以避免解析阶段精度丢失。

```typescript
import { $n } from '@cat-kit/core'

// 基础精确运算（解决浮点数精度问题）
$n.plus(0.1, 0.2) // 0.3
$n.minus(1.0, 0.9) // 0.1
$n.mul(19.9, 100) // 1990
$n.div(0.3, 0.1) // 3

// 支持字符串入参，保持大数精度
$n.plus('1234567890123456.1', '0.1')
// 1234567890123456.2

// 表达式计算
$n.calc('1 + 2 * (3 + 4)') // 15
$n.calc('0.1 + 0.2') // 0.3
```

## 交互演示

### 表达式计算

::: demo core/number-calc-demo.vue
:::

### 数字格式化

::: demo core/number-format-demo.vue
:::
