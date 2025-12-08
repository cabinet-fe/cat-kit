# Maintenance 文档规范

## MODIFIED Requirements

### Requirement: 概览文档 (index.md)

概览文档 SHALL 准确描述 `@cat-kit/maintenance` 包的功能和 API。

文档 SHALL 包含以下章节：
1. 功能特性列表
2. 安装说明
3. 前置知识（依赖类型、库构建概念）
4. 功能模块链接
5. 快速示例代码

快速示例 SHALL 使用当前的 `Monorepo` 类 API 而非废弃的 `MonoRepoBundler`。

#### Scenario: 用户查看概览

- **WHEN** 用户访问 index.md
- **THEN** 应看到使用 `Monorepo` 类的快速示例
- **AND** 应看到所有功能模块的链接

#### Scenario: 示例代码可执行

- **WHEN** 用户复制快速示例代码
- **THEN** 代码应能通过 TypeScript 编译
- **AND** 代码应正确导入所有必要的类型

---

### Requirement: 依赖管理文档 (deps.md)

依赖管理文档 SHALL 准确记录 `deps` 模块的所有公开 API。

`checkCircularDependencies` 函数签名 SHALL 为：
```typescript
function checkCircularDependencies(packages: PackageInfo[]): CircularDependencyResult
```

`checkVersionConsistency` 函数签名 SHALL 为：
```typescript
function checkVersionConsistency(packages: PackageInfo[]): ConsistencyResult
```

`buildDependencyGraph` 函数签名 SHALL 为：
```typescript
function buildDependencyGraph(packages: (PackageInfo & { version: string })[]): DependencyGraph
```

`visualizeDependencyGraph` 函数签名 SHALL 为：
```typescript
function visualizeDependencyGraph(graph: DependencyGraph, options?: {...}): string
```

#### Scenario: API 签名与源代码一致

- **WHEN** 用户查看 deps.md 中的函数签名
- **THEN** 所有签名应与 `packages/maintenance/src/deps/` 中的源代码完全一致

#### Scenario: 类型定义完整

- **WHEN** 用户查看类型定义章节
- **THEN** 应包含 `PackageInfo`、`CircularDependencyResult`、`ConsistencyResult`、`DependencyGraph` 等所有相关类型

---

### Requirement: 版本管理文档 (version.md)

版本管理文档 SHALL 准确记录 `version` 模块的所有公开 API。

`bumpVersion` 函数签名 SHALL 为：
```typescript
function bumpVersion(pkgPath: string, options: BumpOptions): Promise<BumpResult>
```

`syncPeerDependencies` 和 `syncDependencies` 函数签名 SHALL 接受包列表数组和版本号。

#### Scenario: bumpVersion 示例正确

- **WHEN** 用户查看 bumpVersion 用法示例
- **THEN** 示例应使用字符串路径作为第一个参数
- **AND** 示例应使用正确的选项对象结构

---

### Requirement: Monorepo 统一管理文档 (monorepo.md)

Monorepo 文档 SHALL 记录 `Monorepo` 类和 `WorkspaceGroup` 类的完整 API。

文档 SHALL 包含以下内容：

1. **Monorepo 类**
   - 构造函数 `constructor(rootDir?: string)`
   - `root` 属性 - 根目录信息
   - `workspaces` 属性 - 工作区列表
   - `group(names)` 方法 - 创建分组
   - `validate()` 方法 - 验证循环依赖和版本一致性
   - `buildDependencyGraph(options)` 方法

2. **WorkspaceGroup 类**
   - `build(configs)` - 按依赖顺序批量构建
   - `bumpVersion(options)` - 批量版本更新
   - `publish(options)` - 批量发布

文档 SHALL 提供完整的使用示例，展示推荐的工作流程。

#### Scenario: Monorepo 类 API 完整

- **WHEN** 用户查看 monorepo.md
- **THEN** 应能找到 `Monorepo` 类的所有公开属性和方法
- **AND** 每个 API 应包含签名、参数说明和示例

#### Scenario: WorkspaceGroup 使用流程清晰

- **WHEN** 用户想要构建一组包
- **THEN** 应能从文档中理解如何使用 `repo.group(['pkg1', 'pkg2']).build()` 模式

#### Scenario: 完整工作流示例

- **WHEN** 用户查看文档
- **THEN** 应能找到从初始化到构建再到发布的完整流程示例

---

### Requirement: 发布与 Git 辅助文档 (release.md)

发布文档 SHALL 准确记录 `release` 模块的所有公开 API。

文档 SHALL 包含：
- `createGitTag` 函数
- `commitAndPush` 函数
- `publishPackage` 函数

每个函数 SHALL 有正确的签名、参数表格和示例代码。

#### Scenario: 发布流水线示例

- **WHEN** 用户想要了解发布流程
- **THEN** 应能找到推荐的 commit → tag → publish 流水线示例

## REMOVED Requirements

### Requirement: MonoRepoBundler 文档

`MonoRepoBundler` 类已被废弃，相关文档 SHALL 被移除。

**Reason**: `MonoRepoBundler` 类已被 `Monorepo` + `WorkspaceGroup` 架构取代

**Migration**:
- 用户应使用 `new Monorepo(rootDir).group(['pkg1', 'pkg2']).build()` 模式
- 旧的直接传递包列表方式已不再支持
