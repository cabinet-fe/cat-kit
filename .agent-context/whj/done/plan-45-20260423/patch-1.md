# 修复 number.test.ts 缩进

## 补丁内容

review 发现 `packages/core/test/number.test.ts` 第 292 行 `it('非法表达式时应抛出错误')` 缩进少了一层，与同级 `it` 块不对齐。修复缩进使其符合代码风格。

## 影响范围

- 修改文件: `packages/core/test/number.test.ts`
