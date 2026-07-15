# core — 数值

## 何时使用

- 减少常见十进制加减乘除中的浮点误差，或计算简单四则表达式。
- 格式化数字、人民币和中文大写金额，或限制数值范围。

## 推荐公开 API

- `$n.plus`、`$n.sum`、`$n.minus`、`$n.mul`、`$n.div`：十进制运算。
- `$n.calc`：计算四则表达式。
- `$n.formatter`：创建 `Intl.NumberFormat`。
- `n(value).fixed`、`currency`、`range`、`max`、`min`、`each`：格式化和数值辅助。

## 最小示例

```ts
import { $n, n } from '@cat-kit/core'

const total = $n.plus(0.1, 0.2)
const display = n(total).fixed(2)

console.log(total, display) // 0.3, '0.30'
```

## 约束与边界

- 运算参数可传 `number` 或十进制 `string`；大数使用字符串可避免输入前就丢失精度。
- 运算结果仍是 JavaScript `number`，超过安全整数范围或可表示范围时不能保证无损。
- `$n.calc` 只用于数值四则表达式，不执行 JavaScript，也不接受变量。
- `$n.formatter` 返回原生 `Intl.NumberFormat`，格式结果由其选项决定。
- `n().fixed` 与 `currency` 返回字符串；`range`、`max`、`min` 返回数字；`each` 从 `1` 迭代到传入值。
- `currency('CNY_HAN')` 面向人民币中文大写，绝对值达到 `1e15` 时返回空字符串。

## 精确类型入口

- [数值入口声明](../../generated/core/data/number.d.ts)
- [数值包装声明](../../generated/core/data/number/num.d.ts)
- [货币配置声明](../../generated/core/data/number/format.d.ts)
