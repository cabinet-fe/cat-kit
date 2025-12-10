# Tasks: 重构 bumpVersion 方法

## 1. 类型定义修改

- [x] 1.1 修改 `packages/maintenance/src/version/types.ts` 中的 `BumpOptions` 接口，将 `type` 字段改为可选
- [x] 1.2 为 `BumpOptions.type` 添加 JSDoc 注释说明默认行为

## 2. 核心逻辑实现

- [x] 2.1 修改 `packages/maintenance/src/version/semver.ts` 中 `incrementVersion` 函数的 `preid` 默认值为 `'alpha'`
- [x] 2.2 修改 `packages/maintenance/src/version/bump.ts` 中 `bumpVersion` 函数：
  - 实现智能默认类型推断逻辑
  - 预发布版本 → 默认 `prerelease`
  - 稳定版本 → 默认 `patch`

## 3. 调用方适配

- [x] 3.1 检查 `packages/maintenance/src/monorepo/monorepo.ts` 中 `WorkspaceGroup.bumpVersion` 方法的调用，确保兼容

## 4. 文档更新

- [x] 4.1 更新 `bumpVersion` 函数的 JSDoc 示例，展示无 type 参数的用法
- [x] 4.2 更新 `incrementVersion` 函数的 JSDoc 示例，反映新的默认 preid

## 5. 验证

- [x] 5.1 构建包确保无编译错误
- [x] 5.2 手动测试验证智能递增行为正确

## Dependencies

- 任务 2.1 和 2.2 可并行执行
- 任务 3.1 依赖任务 1.1 完成
- 任务 4.x 可在任务 2.x 完成后并行执行
- 任务 5.x 依赖所有实现任务完成
