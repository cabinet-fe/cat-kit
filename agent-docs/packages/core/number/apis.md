---
title: "数值运算与格式化 API"
description: "@cat-kit/core 数值 API：$n 运算集合、n() 链式包装与 NumberFormatOptions"
keywords:
  - $n
  - n() 链式
  - Num
  - NumberFormatOptions
  - plus
  - mul
  - div
  - sum
  - calc
  - currency 格式化
aliases:
  - 函数签名
  - API 参考
  - 数字运算
  - Intl.NumberFormat
---

# 数值运算与格式化 API

本篇列出数值工具的公开签名：`$n` 运算集合、`n()` 链式包装返回的 `Num` 方法，以及 `NumberFormatOptions` 格式化选项。

```ts
declare function n(n: number): Num

declare const $n: {
  formatter(options: NumberFormatOptions): Intl.NumberFormat
  plus(...numbers: (number | string)[]): number
  minus(...numbers: (number | string)[]): number
  mul(num1: number | string, num2: number | string): number
  div(num1: number | string, num2: number | string): number
  sum(...numbers: (number | string)[]): number
  calc(expression: string): number
}
```

`Num` 实例方法（经 `n()` 获得，一般不作为运行时命名导入）：`currency`、`fixed`、`each`、`range`、`max`、`min` 等。

`NumberFormatOptions`：`style`、`currency`、`precision`、`maximumFractionDigits`、`minimumFractionDigits`、`notation`。
