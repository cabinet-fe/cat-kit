# release-workflow Specification

## Purpose

定义发布流程的编排逻辑，包括验证、测试、构建、版本更新、Git 提交和发布的完整流程。

## ADDED Requirements

### Requirement: 完整发布流程

系统 SHALL 提供 `releaseGroup(group: WorkspaceGroup)` 函数，按以下顺序执行发布流程：

1. 构建（build）
2. 交互式选择版本（chooseVersion）
3. 更新版本号（bumpVersion）
4. Git 提交（gitCommit）
5. 并行发布（publish）

#### Scenario: 成功完成发布流程

- **GIVEN** 用户选择了 main 组
- **WHEN** 执行 `releaseGroup(main)`
- **THEN** 系统依次执行构建、版本选择、版本更新、Git 提交和发布
- **AND** 所有步骤成功后显示完成消息

#### Scenario: 构建失败时终止流程

- **GIVEN** 用户选择了 main 组
- **WHEN** 构建过程中某个包失败
- **THEN** 系统终止流程并显示错误信息
- **AND** 不执行后续的版本更新和发布

### Requirement: 主入口流程控制

系统 SHALL 在 `release()` 主函数中：

1. 执行 monorepo 验证
2. 运行测试
3. 提示用户选择发布组
4. 根据选择的组调用 `releaseGroup()`

#### Scenario: 选择不同的组执行对应发布

- **GIVEN** 用户启动发布脚本
- **WHEN** 用户选择 "maintenance" 组
- **THEN** 系统使用 maintenance 分组执行发布流程
