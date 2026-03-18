# 新增 CLI 包文档并接入导航

> 状态: 已执行

## 目标

为 `@cat-kit/cli` 新增文档入口页与命令说明页，并接入文档站顶部导航与侧边栏导航，保证可发现性与可访问性。

## 内容

1. 基于 `packages/cli/src` 的真实实现编写 `docs/content/packages/cli/index.md` 与功能页，保持结构符合文档规范。
2. 更新 `docs/.vitepress/config.ts` 的顶部「包」菜单，新增 CLI 导航入口。
3. 更新 `docs/.vitepress/sidebar.ts` 的包分组映射，接入 `/packages/cli/` 侧边栏分组。

## 影响范围

- `.agent-context/plan-5/plan.md`
- `docs/.vitepress/config.ts`
- `docs/.vitepress/sidebar.ts`
- `docs/content/packages/cli/index.md`
- `docs/content/packages/cli/verify-commit.md`

## 历史补丁
