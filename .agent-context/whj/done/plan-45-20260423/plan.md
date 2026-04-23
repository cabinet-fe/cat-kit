# 重构 @cat-kit/core number 模块

> 状态: 已执行

## 目标

移除未使用的 big.ts，将臃肿的 number.ts 按功能拆分为多个子模块，改善命名和可读性。

## 内容

1. 删除 `packages/core/src/data/number/big.ts`
2. 将 `packages/core/src/data/number.ts` 拆分为：
   - `packages/core/src/data/number/decimal.ts`：Decimal 高精度计算内部类（基于 BigInt 解决浮点精度问题）
   - `packages/core/src/data/number/calc.ts`：表达式计算引擎（tokenize + parse + PRECEDENCE）
   - `packages/core/src/data/number/format.ts`：数字格式化工具（toFixed、货币格式化 CNY/CNY_HAN）
   - `packages/core/src/data/number/num.ts`：Num 链式包装类
   - `packages/core/src/data/number.ts`：保留为统一入口，重新导出 $n 和 n
3. 优化命名：
   - `getDecimalPartByPrecision` → `roundDecimalPart`
   - `getDecimalPartByMinMaxPrecision` → `trimDecimalPart`
   - `getDecimalPart` → `resolveDecimalPart`
   - `CurrencyFormatters` → `currencyFormatters`
   - `CN_UPPER_NUM` → `CN_UPPER_DIGITS`
   - `CN_INT_RADICE` → `CN_INT_RADICES`
   - `NumberFormatterOptions` → `NumberFormatOptions`
4. 确保所有现有导出不变（向后兼容）
5. 运行 `@cat-kit/core` 测试确保功能未损坏
6. 同步更新 `docs/content/packages/core/data/number.md` 和 `skills/cat-kit-core/` 中的相关引用

## 影响范围

- 删除文件: `packages/core/src/data/number/big.ts`
- 删除文件: `packages/core/test/big.test.ts`
- 删除文件: `skills/cat-kit-core/generated/data/number/big.d.ts`
- 修改文件: `packages/core/src/data/index.ts`（移除 big.ts 导出）
- 修改文件: `packages/core/src/data/number.ts`（重构为入口文件）
- 修改文件: `packages/core/AGENTS.md`（更新目录结构）
- 修改文件: `skills/cat-kit-core/generated/index.d.ts`（移除 Big 相关类型）
- 新增文件: `packages/core/src/data/number/decimal.ts`
- 新增文件: `packages/core/src/data/number/calc.ts`
- 新增文件: `packages/core/src/data/number/format.ts`
- 新增文件: `packages/core/src/data/number/num.ts`
- 修改文件: `packages/core/test/number.test.ts`（patch-1 修复缩进）

## 历史补丁

- patch-1: 修复 number.test.ts 缩进
