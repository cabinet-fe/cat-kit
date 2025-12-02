# @cat-kit/maintenance 工作空间指导

## 包概述

`@cat-kit/maintenance` 是 Cat-Kit monorepo 的维护工具包，提供依赖管理、版本管理、配置验证和统计报告等功能。

## 模块说明

### deps（依赖管理）
- `checkCircularDependencies()` - 检测循环依赖（使用 Tarjan 算法）
- `checkVersionConsistency()` - 检查版本一致性
- `buildDependencyGraph()` - 构建依赖关系图
- `visualizeDependencyGraph()` - 生成 Mermaid 格式的依赖图

### version（版本管理）
- `parseSemver()` - 解析 semver 版本号
- `compareSemver()` - 比较版本号
- `incrementVersion()` - 递增版本号
- `bumpVersion()` - 批量更新包版本（复用 build/release.ts 逻辑）
- `syncPeerDependencies()` - 同步 peerDependencies 版本约束

## 编码规范

### 通用规范
- **所有函数必须有 JSDoc 注释**（包括 @param、@returns、@example）
- **使用具名导出**（不使用 default export）
- **完整的 TypeScript 类型签名**
- **无副作用**（纯函数）

### 错误处理
- 使用自定义错误类（MaintenanceError、SemverError、ConfigError 等）
- 错误消息应清晰描述问题
- 保留原始错误信息（originalError 参数）

### 示例代码
```typescript
/**
 * 示例函数
 * @param value - 输入值
 * @returns 处理结果
 * @throws {SemverError} 当版本格式无效时
 * @example
 * ```ts
 * const result = exampleFunction('1.0.0')
 * ```
 */
export function exampleFunction(value: string): string {
  // 实现
}
```

## 测试规范

- 测试文件位于 `packages/tests/maintenance/` 目录
- 使用 AAA 模式（Arrange-Act-Assert）
- 每个模块都应有对应的测试文件
- 目标覆盖率：≥ 85%

## 复用的代码

### 从 build/repo.ts 复用
- 拓扑排序算法（getPkgsToBuild，L43-49）
- 并行处理模式（Promise.all）

### 从 build/release.ts 复用
- 版本更新逻辑（updateVersion，L43-57）
- peerDependencies 同步逻辑（L48-54）

## 依赖关系

### 运行时依赖
- `@cat-kit/core`: peerDependency（可选）

### 开发依赖
- `typescript`: 用于 Compiler API（未来的 validate 模块）
- `@types/node`: Node.js 类型定义

## 使用示例

```typescript
import {
  checkCircularDependencies,
  bumpVersion,
  checkVersionConsistency
} from '@cat-kit/maintenance'

const config = { rootDir: '/path/to/cat-kit' }

// 检查循环依赖
const circular = await checkCircularDependencies(config)
if (circular.hasCircular) {
  console.log('发现循环依赖:', circular.cycles)
}

// 批量更新版本
await bumpVersion(config, {
  type: 'minor',
  syncPeer: true
})

// 检查版本一致性
const consistency = await checkVersionConsistency(config)
if (!consistency.consistent) {
  console.log('发现版本不一致:', consistency.inconsistent)
}
```

## 开发流程

1. **添加新功能时**：
   - 先在对应模块的 `types.ts` 中定义类型
   - 实现功能函数（带完整 JSDoc）
   - 在模块的 `index.ts` 中导出
   - 编写测试用例

2. **修改现有功能时**：
   - 确保类型定义更新
   - 更新 JSDoc 注释
   - 更新相关测试用例
   - 确保测试通过

## 注意事项

- 所有路径必须使用绝对路径（不使用相对路径）
- 使用 Bun API 时注意平台兼容性
- 错误消息应该是中文（符合项目风格）
- 遵循项目的 tree-shaking 友好原则
