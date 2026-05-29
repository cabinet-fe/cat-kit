# 优化 get 方法支持字符串数组参数

> 状态: 已执行

## 目标

优化 CatObject 类的 get 方法，使其不仅支持字符串形式 of 属性路径，还支持字符串数组形式的属性路径，提升该基础方法的通用性。

## 内容

1. 运行现有测试，验证当前环境正确性。
2. 修改 `packages/core/src/data/object.ts` 中 `CatObject.get` 方法：
   - 更新类型声明为 `get<T extends any = any>(prop: string | string[]): T | undefined`。
   - 实现中，判断 `prop` 是否为数组，如果是数组则拷贝该数组作为路径；如果不是，则通过 `.split('.')` 拆分出路径。
   - 保证日志输出 `console.warn` 的时候，对于数组能正确拼接或显示属性路径。
3. 在 `packages/core/test/object.test.ts` 的 `get` 测试集中增加字符串数组形式 of 测试用例：
   - 获取简单属性，例如 `['a']`。
   - 链式属性访问，例如 `['a', 'b', 'c']`。
   - 处理缺少路径的场景并发出警告。
4. 运行 `bun --cwd packages/core run test` 确保所有测试通过，并使用 oxlint 和 oxfmt 进行代码风格检查与格式化。

## 影响范围

- `packages/core/src/data/object.ts`
- `packages/core/test/object.test.ts`

## 历史补丁
