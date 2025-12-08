# Change: 重写 @cat-kit/maintenance 文档

## Why

`@cat-kit/maintenance` 包的源代码已经过重大重构，现有文档与实际 API 严重不符。文档仍使用已废弃的 `MonoRepoBundler` 类，而实际代码已采用全新的 `Monorepo` + `WorkspaceGroup` 架构。用户无法根据当前文档正确使用该包。

## What Changes

### 文档结构重组

- **MODIFIED** `index.md` - 更新概览和快速示例，使用新的 `Monorepo` 类 API
- **MODIFIED** `deps.md` - 更新依赖管理模块的 API 文档（函数签名已变更）
- **MODIFIED** `version.md` - 更新版本管理模块的 API 文档（函数签名已变更）
- **MODIFIED** `bundler.md` → 重命名为 `monorepo.md` - 完全重写，记录新的 `Monorepo` 和 `WorkspaceGroup` 类
- **MODIFIED** `release.md` - 验证并保持与源代码一致

### 主要 API 变更说明

1. **废弃 `MonoRepoBundler`**，改用 `Monorepo.group().build()` 模式
2. **依赖检测函数签名变更**：
   - `checkCircularDependencies(config: MonorepoConfig)` → `checkCircularDependencies(packages: PackageInfo[])`
   - `checkVersionConsistency(config, options)` → `checkVersionConsistency(packages: PackageInfo[])`
3. **新增 `Monorepo` 类**：
   - `root` - 根目录信息
   - `workspaces` - 工作区列表
   - `group(names)` - 创建工作区分组
   - `validate()` - 验证 monorepo
   - `buildDependencyGraph()` - 构建依赖图
4. **新增 `WorkspaceGroup` 类**：
   - `build(configs)` - 按依赖关系分批并行构建
   - `bumpVersion(options)` - 批量更新版本
   - `publish(options)` - 批量发布

## Impact

- **受影响的文档**:
  - `docs/content/packages/maintenance/index.md`
  - `docs/content/packages/maintenance/deps.md`
  - `docs/content/packages/maintenance/version.md`
  - `docs/content/packages/maintenance/bundler.md` (重命名为 monorepo.md)
  - `docs/content/packages/maintenance/release.md`

- **受影响的用户**: 所有使用 `@cat-kit/maintenance` 包的开发者

- **风险**: 低 - 仅文档变更，不涉及代码修改
