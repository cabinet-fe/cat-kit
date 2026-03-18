# 同步 maintenance 构建配置文档

> 状态: 已执行

## 目标

将 `@cat-kit/maintenance` 构建相关文档更新为当前 `BuildConfig` 实现，确保配置项名称、类型与示例一致。

## 内容

1. 对照 `packages/maintenance/src/build/types.ts` 与 `packages/maintenance/src/build/build.ts`，确认当前构建配置项与默认行为。
2. 更新 `docs/content/packages/maintenance/build.md` 中参数表、示例与类型定义，替换过时配置并补充最新说明。
3. 更新 `docs/content/packages/maintenance/monorepo.md` 与 `docs/content/packages/maintenance/guide.md` 中涉及构建配置的示例与类型说明，保持术语一致。
4. 自检文档结构与表述，确保符合文档规范且无相互矛盾描述。

## 影响范围

- `docs/content/packages/maintenance/build.md`
- `docs/content/packages/maintenance/monorepo.md`
- `docs/content/packages/maintenance/guide.md`
- `.agent-context/plan-4/plan.md`

## 历史补丁
