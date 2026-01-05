# Change: 修复并完善树形数据结构模块

## Why

当前 `@cat-kit/core` 的 `data-structure` 模块存在代码错误和 API 不完善问题：

1. `index.ts` 错误导出 `Tree`，但 `tree.ts` 定义的是 `TreeManager` - 导出失败
2. `forest.ts` 中 `Forest` 构建逻辑不完整 - 需要实现递归构建节点
3. API 设计不完善，缺少 `find`/`findAll` 等常用查找方法

## What Changes

- 修复 `index.ts` 导出，将 `Tree` 改为 `TreeManager`
- 完善 `TreeNode` 类，增加 `insert` 方法以便节点插入
- 完善 `TreeManager` 类：
  - 保持当前构造函数签名：`(data, options?)`
  - `options.createNode` 回调用于自定义节点创建，更灵活易扩展
  - 添加 `find` / `findAll` 方法用于节点查找
- 完善 `Forest` 类：
  - 采用与 `TreeManager` 一致的 `createNode` 回调模式
  - 实现递归构建节点逻辑
- 更新测试文件以匹配新 API

## Impact

- **Affected specs**: 无现有 spec（新建 `tree-data-structure`）
- **Affected code**:
  - `packages/core/src/data-structure/tree.ts`
  - `packages/core/src/data-structure/forest.ts`
  - `packages/core/src/data-structure/index.ts`
  - `packages/tests/core/tree.test.ts`
