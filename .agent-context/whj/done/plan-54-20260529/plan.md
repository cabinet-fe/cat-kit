# 微调 get 方法以实现不拷贝的数组逻辑

> 状态: 已执行

## 目标

根据进一步的用户要求，精简并微调 CatObject.get 的实现，避免使用展开运算符 `...` 拷贝数组，并在空数组路径时返回原始对象值。

## 内容

1. 修改 `packages/core/src/data/object.ts` 中 `CatObject.get` 方法：
   - 移除 `const propPath = Array.isArray(prop) ? [...prop] : prop.split('.')`，改为直接引用或转换：`const propPath = Array.isArray(prop) ? prop : prop.split('.')`。
   - 当 `propPath.length === 0` 时，直接返回 `this.raw`（而不是原有的 `undefined`）。
   - 不再使用 `pop()` 修改路径数组，改用普通的 for 循环到倒数第二个元素 `propPath.length - 1`，然后在循环内使用 `prop` 变量渲染模板字符串。
2. 在 `packages/core/test/object.test.ts` 中增加针对空路径数组 `[]` 返回对象值本身的测试用例。
3. 运行测试 `bun --cwd packages/core test` 验证是否全部通过。

## 影响范围

- `packages/core/src/data/object.ts`
- `packages/core/test/object.test.ts`

## 历史补丁
