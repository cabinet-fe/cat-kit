# 提案：完善分组发布流程

## 变更 ID
`enhance-release-workflow`

## 概述

完善 `release/` 目录的发布功能，实现完整的交互式分组发布流程，包括版本选择、并行发布、Git 集成以及失败回滚机制。

## 动机

当前 `release/release.ts` 只实现了部分发布逻辑：
- `chooseGroup()` 和 `validate()` 已完成
- `releaseMain()` 只有构建逻辑，缺少版本选择和发布
- 缺少 Git 提交集成
- 缺少发布失败的回滚机制
- 发布是串行的，效率较低

## 目标

1. **交互式版本选择**：用户可选择版本递增类型（patch、minor、major、prerelease 等）
2. **并行发布**：同组内的包并行发布以提高效率
3. **Git 集成**：发布前自动提交版本变更
4. **失败回滚**：发布失败时提示用户选择是否回滚版本号和 Git 提交
5. **统一发布入口**：根据选择的组执行对应的完整发布流程

## 非目标

- 不支持一次发布多个组
- 不支持自动推送到远程仓库（保留手动控制）
- 不涉及 changelog 自动生成

## 涉及的能力

1. **release-workflow**：发布流程编排
2. **version-selection**：交互式版本选择
3. **parallel-publish**：并行发布支持
4. **release-rollback**：发布失败回滚

## 实现范围

### 修改的文件
- `release/release.ts` - 重构发布流程
- `packages/maintenance/src/monorepo/monorepo.ts` - `WorkspaceGroup.publish` 改为并行
- `packages/maintenance/src/monorepo/types.ts` - 新增回滚相关类型

### 新增的文件
- 无

## 风险与注意事项

- 并行发布时需要处理网络错误和 npm registry 限流
- 回滚时需要确保 package.json 文件正确恢复
- Git reset 操作需要用户确认，避免误操作
