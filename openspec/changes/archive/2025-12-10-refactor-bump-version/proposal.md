# Change: 重构 bumpVersion 方法

## Why

当前 `bumpVersion` 方法要求 `type` 参数为必填，这在大多数情况下增加了不必要的复杂性。实际使用中，最常见的场景是：
- 预发布版本自动递增预发布号（如 `1.0.0-alpha.0` → `1.0.0-alpha.1`）
- 稳定版本默认递增 patch 版本号

通过让 `type` 变为可选并实现智能默认行为，可以显著简化 API 调用。

## What Changes

- **MODIFIED**: `BumpOptions` 接口中的 `type` 字段改为可选
- **MODIFIED**: `bumpVersion` 函数实现智能默认递增逻辑：
  - 如果当前版本是预发布版本，默认使用 `prerelease` 类型
  - 如果当前版本是稳定版本，默认使用 `patch` 类型
- **MODIFIED**: `preid` 默认值从 `'pre'` 改为 `'alpha'`
- **MODIFIED**: `GroupBumpOptions` 继承自修改后的 `BumpOptions`，自动获得可选 `type`

## Impact

- **Affected specs**: version-bump
- **Affected code**:
  - `packages/maintenance/src/version/types.ts` - `BumpOptions` 接口
  - `packages/maintenance/src/version/bump.ts` - `bumpVersion` 函数
  - `packages/maintenance/src/version/semver.ts` - `incrementVersion` 函数默认 preid
  - `packages/maintenance/src/monorepo/types.ts` - `GroupBumpOptions` 接口（间接影响）
  - `packages/maintenance/src/monorepo/monorepo.ts` - `WorkspaceGroup.bumpVersion` 方法（调用处适配）
- **Breaking changes**: 无，此变更完全向后兼容
