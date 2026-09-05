---
title: "数值运算与格式化"
description: "@cat-kit/core 数值：$n 小数运算/表达式求值与 n() 链式格式化、范围遍历"
---

# 数值运算与格式化

`@cat-kit/core` 的数值工具分两部分：`$n` 提供无浮点误差的小数四则运算、求和与表达式求值；`n(value)` 提供链式货币/精度格式化、范围生成与遍历。结果仍是 JS `number`。

## 适用场景

小数运算、表达式求值、货币/精度格式化、范围与遍历。

## 推荐公开 API

- `$n.plus|minus|sum(...numberOrString)`、`$n.mul|div(a, b)`、`$n.calc(expression)`、`$n.formatter(options)`
- `n(value)`：`.currency`、`.fixed`、`.each`、`.range`、`.max`、`.min`

```ts
import { $n, n } from '@cat-kit/core'

$n.plus(0.1, 0.2) // 0.3
$n.calc('(1+2)*3')
n(1234.56).currency('CNY')
```

## 约束

- 结果仍是 JS `number`；大数字符串可减少中间精度损失
- `$n.calc` 仅支持数字字面量、科学计数、`+ - * /`、括号与一元正负，无变量
- `currency`/`fixed` 返回字符串；`range` 会规范化反转边界

## 类型声明

- [packages/core/dist/data/number.d.ts](../../../../packages/core/dist/data/number.d.ts)
- [packages/core/dist/data/number/num.d.ts](../../../../packages/core/dist/data/number/num.d.ts)
- [packages/core/dist/data/number/format.d.ts](../../../../packages/core/dist/data/number/format.d.ts)

## 更多

- API：[数值运算与格式化 API](apis.md)
