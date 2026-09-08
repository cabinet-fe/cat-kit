---
title: "数值计算与格式化模块（n / $n）"
description: "@cat-kit/core 的 number 模块：$n 基于 Decimal 的高精度四则运算、求和与表达式求值，n() 链式的货币格式化（含人民币中文大写）、精度控制、范围限制与遍历。"
aliases: [数字模块, 数值模块, 高精度计算模块]
keywords: [n, $n, Num, plus, minus, mul, div, sum, calc, currency, fixed, range, 浮点精度, 高精度计算, 货币格式化, 人民币大写]
---

# 数值计算与格式化模块（n / $n）

`number` 模块从 `@cat-kit/core` 导出 `$n` 与 `n()`：`$n` 提供解决浮点精度问题的高精度四则运算（`plus` / `minus` / `mul` / `div`）、求和 `sum`、表达式求值 `calc` 与 `Intl` 格式化器工厂 `formatter`；`n()` 把数字包装为 `Num` 实例，链式完成货币格式化（`CNY` 千分位、`CNY_HAN` 人民币中文大写）、精度截取（`fixed`）、范围限制（`range` / `max` / `min`）与遍历（`each`）。内部使用自实现 `Decimal`，结果仍为 JS `number`。

## 安装

```bash
bun add @cat-kit/core
```

```bash
npm install @cat-kit/core
```

```ts
import { $n, n } from '@cat-kit/core'
```

## 模块速查

| 导出 | 说明 | 文档 |
| --- | --- | --- |
| `n` | 包装数字为 `Num`：`currency`、`fixed`、`each`、`range`、`max`、`min` | `packages/core/number/apis.md` |
| `$n` | 数字工具集：`plus`、`minus`、`mul`、`div`、`sum`、`calc`、`formatter` | `packages/core/number/apis.md` |

类型导出：`Num`（类类型）、`CurrencyConfig`（货币格式化配置）、`NumberFormatOptions`（`formatter` 选项）。内部 `Decimal` 实现与 `toFixed` / `formatCurrency` 未导出，只能通过 `n()` / `$n` 使用。
