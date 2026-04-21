# 收敛测试 tsconfig 配置

> 状态: 已执行

## 目标

将各包 `test/` 目录下分散的测试类型检查配置收敛到包根 `tsconfig.test.json` 与仓库根统一入口里，减少 `test/` 目录内的配置文件噪音，同时保留各包原有的依赖解析上下文，并让仓库根 `tsconfig.json` 能显式引用测试项目。

## 内容

1. 将原本位于 `packages/*/test/tsconfig.json` 的测试项目配置迁移到各包根目录下的 `tsconfig.test.json`，让测试工程与包本身的 `tsconfig.json` 放在同一层级。
2. 在每个 `tsconfig.test.json` 中继续继承包级 `tsconfig.json`，仅补充测试项目需要的 `types`、`tsBuildInfoFile` 与 `include`，并为 `cli` 单独处理 `rootDir` 差异。
3. 在仓库根新增聚合测试项目引用的 `tsconfig.test.json`，集中引用所有包级测试工程。
4. 在仓库根 `tsconfig.json` 中引用新的 `tsconfig.test.json`，让编辑器和 `tsc -b` 能统一发现测试工程。
5. 运行针对性的 TypeScript 校验，确认新的引用结构可用且不会破坏现有包级类型检查。

## 影响范围

- `tsconfig.json`
- `tsconfig.test.json`
- `packages/be/tsconfig.test.json`
- `packages/cli/tsconfig.test.json`
- `packages/core/tsconfig.test.json`
- `packages/fe/tsconfig.test.json`
- `packages/http/tsconfig.test.json`
- `packages/vitepress-theme/tsconfig.test.json`

## 历史补丁
