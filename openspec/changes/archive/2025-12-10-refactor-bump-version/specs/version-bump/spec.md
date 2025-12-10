# Version Bump Capability

## ADDED Requirements

### Requirement: 版本号更新配置

系统 SHALL 提供 `BumpOptions` 配置接口，支持以下可选参数：

- `type?: BumpType` - 更新类型（major, minor, patch, premajor, preminor, prepatch, prerelease）。当未指定时，系统根据当前版本智能推断。
- `version?: string` - 直接指定目标版本号。如果指定则忽略 `type`。
- `preid?: string` - 预发布标识，默认为 `'alpha'`。

#### Scenario: 显式指定更新类型
- **WHEN** 调用 `bumpVersion` 时传入 `type: 'minor'`
- **THEN** 系统按照指定的类型递增版本号

#### Scenario: 省略 type 参数时自动推断（预发布版本）
- **WHEN** 当前版本是预发布版本（如 `1.0.0-alpha.0`）且未指定 `type`
- **THEN** 系统自动使用 `prerelease` 类型递增预发布号（变为 `1.0.0-alpha.1`）

#### Scenario: 省略 type 参数时自动推断（稳定版本）
- **WHEN** 当前版本是稳定版本（如 `1.2.3`）且未指定 `type`
- **THEN** 系统自动使用 `patch` 类型递增版本号（变为 `1.2.4`）

#### Scenario: 直接指定目标版本号
- **WHEN** 调用时传入 `version: '2.0.0'`
- **THEN** 系统直接设置为指定版本，忽略 `type` 参数

### Requirement: 预发布标识默认值

系统 SHALL 在创建预发布版本时，使用 `'alpha'` 作为默认的 `preid`。

#### Scenario: 未指定 preid 时使用默认值
- **WHEN** 调用 `incrementVersion('1.0.0', 'prerelease')` 且未指定 preid
- **THEN** 生成的版本号为 `1.0.0-alpha.0`

#### Scenario: 显式指定 preid
- **WHEN** 调用 `incrementVersion('1.0.0', 'prerelease', 'beta')` 指定 preid 为 `'beta'`
- **THEN** 生成的版本号为 `1.0.0-beta.0`

### Requirement: 智能版本类型推断

系统 SHALL 提供 `inferBumpType` 内部逻辑，根据当前版本号智能推断默认的递增类型：

- 如果当前版本包含预发布标识（prerelease），则推断为 `prerelease` 类型
- 如果当前版本是稳定版本，则推断为 `patch` 类型

#### Scenario: 推断预发布版本的更新类型
- **GIVEN** 当前版本为 `2.0.0-beta.5`
- **WHEN** 系统推断默认更新类型
- **THEN** 返回 `prerelease`

#### Scenario: 推断稳定版本的更新类型
- **GIVEN** 当前版本为 `1.5.3`
- **WHEN** 系统推断默认更新类型
- **THEN** 返回 `patch`
