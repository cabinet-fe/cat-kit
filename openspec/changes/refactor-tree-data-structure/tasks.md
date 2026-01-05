## 1. 修复导出问题

- [x] 1.1 修复 `index.ts`，将导出的 `Tree` 改为 `TreeManager`

## 2. 完善 TreeNode 类

- [x] 2.1 添加 `insert(node, index?)` 方法用于插入子节点

## 3. 完善 TreeManager 类

- [x] 3.1 添加 `find(predicate)` 方法用于查找单个节点
- [x] 3.2 添加 `findAll(predicate)` 方法用于查找所有符合条件的节点

## 4. 完善 Forest 模块

- [x] 4.1 实现 `Forest` 类的递归节点构建逻辑（使用 `createNode` 回调模式）

## 5. 更新测试

- [x] 5.1 更新 `tree.test.ts` 中的导入（`Tree` → `TreeManager`）
- [x] 5.2 确保所有测试通过
