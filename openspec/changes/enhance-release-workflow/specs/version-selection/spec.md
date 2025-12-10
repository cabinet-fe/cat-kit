# version-selection Specification

## Purpose

提供交互式版本选择功能，让用户在发布前选择版本递增类型。

## ADDED Requirements

### Requirement: 交互式版本类型选择

系统 SHALL 提供 `chooseVersion(currentVersion: string): Promise<BumpType>` 函数，使用交互式界面让用户选择版本递增类型。

选项包括：
- `patch` - 修订版本递增
- `minor` - 次版本递增
- `major` - 主版本递增
- `prepatch` - 预发布修订版本
- `preminor` - 预发布次版本
- `premajor` - 预发布主版本
- `prerelease` - 预发布号递增

#### Scenario: 显示版本选项及预期结果

- **GIVEN** 当前版本为 `1.2.3`
- **WHEN** 调用 `chooseVersion('1.2.3')`
- **THEN** 显示以下选项：
  - `patch      → 1.2.4`
  - `minor      → 1.3.0`
  - `major      → 2.0.0`
  - `prepatch   → 1.2.4-alpha.0`
  - `preminor   → 1.3.0-alpha.0`
  - `premajor   → 2.0.0-alpha.0`
  - `prerelease → 1.2.4-alpha.0`

#### Scenario: 预发布版本的 prerelease 选项

- **GIVEN** 当前版本为 `1.2.3-alpha.5`
- **WHEN** 调用 `chooseVersion('1.2.3-alpha.5')`
- **THEN** prerelease 选项显示为 `prerelease → 1.2.3-alpha.6`

#### Scenario: 用户选择后返回类型

- **GIVEN** 版本选择界面已显示
- **WHEN** 用户选择 `minor`
- **THEN** 函数返回 `'minor'`
