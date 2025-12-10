# release-rollback Specification

## Purpose

提供发布失败时的回滚机制，允许用户恢复版本号和 Git 提交。

## ADDED Requirements

### Requirement: 回滚上下文保存

系统 SHALL 在执行版本更新前创建 `RollbackContext`，保存：

- 原始版本号
- 需要回滚的包目录列表
- Git 提交哈希（提交后保存）

#### Scenario: 创建回滚上下文

- **GIVEN** main 组当前版本为 `1.2.3`
- **WHEN** 调用 `createRollbackContext(main)`
- **THEN** 返回包含 `originalVersion: '1.2.3'` 的上下文对象
- **AND** 包含所有包目录的列表

### Requirement: 版本号回滚

系统 SHALL 提供 `rollbackVersion(context: RollbackContext)` 函数，将所有包的 `package.json` 中的 version 字段恢复为原始版本。

#### Scenario: 回滚版本号

- **GIVEN** 版本已从 `1.2.3` 更新到 `1.2.4`
- **WHEN** 调用 `rollbackVersion(context)`
- **THEN** 所有包的 `package.json` 版本恢复为 `1.2.3`

### Requirement: Git 提交回滚

系统 SHALL 提供交互式确认后执行 `git reset --hard <commitHash>^` 回滚 Git 提交。

#### Scenario: 用户确认回滚 Git

- **GIVEN** 发布失败且用户选择回滚
- **WHEN** 系统提示是否回滚 Git
- **AND** 用户确认
- **THEN** 执行 `git reset --hard` 回滚到版本更新前的状态

#### Scenario: 用户拒绝回滚 Git

- **GIVEN** 发布失败且用户选择回滚
- **WHEN** 系统提示是否回滚 Git
- **AND** 用户拒绝
- **THEN** 仅回滚版本号，保留 Git 提交

### Requirement: 失败后回滚提示

系统 SHALL 在发布失败后提示用户是否执行回滚，选项包括：

- "是 - 回滚版本号并重置 Git 提交"
- "否 - 保留当前状态，稍后手动处理"

#### Scenario: 发布失败提示回滚

- **GIVEN** 发布过程中有包失败
- **WHEN** 发布流程完成
- **THEN** 显示失败的包列表
- **AND** 提示用户选择是否回滚
