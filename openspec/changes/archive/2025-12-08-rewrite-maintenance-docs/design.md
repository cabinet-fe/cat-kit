# 设计文档: 重写 @cat-kit/maintenance 文档

## Context

`@cat-kit/maintenance` 是 Cat-Kit monorepo 的核心维护工具包，提供依赖管理、版本管理、构建和发布功能。该包经历了重大重构：

1. 原有的 `MonoRepoBundler` 类被替换为更现代的 `Monorepo` + `WorkspaceGroup` 架构
2. 依赖检测函数从接受配置对象改为直接接受包信息数组
3. 版本管理函数签名也有相应调整

然而，文档未同步更新，导致用户无法正确使用该包。

## Goals / Non-Goals

### Goals

- 确保文档与源代码 100% 一致
- 提供清晰、可执行的代码示例
- 保持文档的易读性和结构性
- 记录新的 `Monorepo` 和 `WorkspaceGroup` API

### Non-Goals

- 不修改任何源代码
- 不增加新功能
- 不重构文档的整体结构（仅更新内容）

## Decisions

### 1. 文档结构调整

**决策**: 将 `bundler.md` 重命名为 `monorepo.md`

**原因**:
- 原文件名 `bundler.md` 暗示着 `MonoRepoBundler` 类，但该类已不存在
- 新名称 `monorepo.md` 更好地反映 `Monorepo` 类的统一管理理念
- 打包构建功能现在是 `Monorepo` 类的一部分，而非独立模块

**替代方案**:
- 保留 `bundler.md` 文件名但更新内容 → 命名不直观，容易造成混淆

### 2. API 文档组织方式

**决策**: 按类/模块组织，每个公开 API 包含签名、参数表格、返回值类型和示例代码

**原因**:
- 与现有文档风格一致
- 便于用户快速查找所需 API
- 示例代码帮助用户理解实际使用方式

### 3. 代码示例原则

**决策**: 所有代码示例必须可以直接复制运行，使用真实的类型导入

**原因**:
- 提高文档可用性
- 减少用户试错时间
- 代码示例本身即为测试

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 文档与代码再次不同步 | 在 `AGENTS.md` 中添加提醒，代码变更时同步更新文档 |
| 现有用户困惑 | 在文档开头添加迁移说明 |

## Migration Plan

1. 创建新文档内容
2. 删除废弃的 `bundler.md`
3. 验证文档构建无错误
4. 确保所有内部链接正常

## Open Questions

- 是否需要在 `index.md` 添加从旧 API 迁移到新 API 的指南？
- 是否需要保留对旧 `MonoRepoBundler` 的简短说明（标记为已废弃）？
