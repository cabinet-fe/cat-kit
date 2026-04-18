# 仓库瘦身与前端基础能力重构

> 状态: 已执行

## 目标

完成 cat-kit 在 2026-04-18 这一轮仓库结构重构：清理已删除的 `excel`、`maintenance` 包残留；用 `turborepo + changesets + tsdown` 替换旧 `release` 构建链路；废弃集中式 `packages/tests` 并迁移为各包内测试；在 `@cat-kit/fe` 中补齐可直接使用的 `Tween` 能力；重写 `virtualizer` 为更简约、更适合在 Vue composable 外层封装的 API，同时保证仓库配置、文档与测试体系保持一致。

## 内容

1. 盘点并清理仓库中对已删除包和旧结构的残留引用，更新根目录 `AGENTS.md`、`CLAUDE.md`、`README.md`、docs 导航与内容、相关 package 配置和仓库说明；按用户选择直接删除 `excel`、`maintenance` 对应的文档页、示例、导航入口，以及 `packages/tests`、`release` 的说明与依赖痕迹。
2. 设计并落地新的 monorepo 构建发布体系：更新根 `package.json` workspaces 与 scripts，引入 `turbo.json`、`.changeset` 配置和必要脚本；为现存可发布包补齐统一的 `build`、`dev`、`lint`、`test`、`typecheck` 等任务约定，采用 `tsdown` 作为每个包的构建入口；移除旧 `release` 目录在工作区和文档中的职责，并处理与 docs、skills 同步脚本之间的衔接。
3. 将 `packages/tests` 中仍然有效的测试迁移到各自包目录下的测试文件夹中，按包拆分 Vitest 配置或共享根配置，修正测试引用路径、运行命令、环境差异和覆盖率输出；删除针对已移除包的测试与集中测试包本身，并让 turbo 任务可以按包执行测试。
4. 在 `packages/fe` 中新增 `Tween` 类并通过包入口导出，提供面向浏览器动画补间的简洁 API，至少覆盖开始、停止、重置、进度驱动、easing、自定义时长与帧回调；为其补充针对时间推进和边界行为的测试，并同步更新 `fe` 文档或说明入口。
5. 参考 TanStack Virtual 的 `virtual-core` 核心思想重构 `packages/fe/src/virtualizer/index.ts`，但收敛为适合 Vue 封装的简约 API：聚焦列表虚拟化并支持 horizontal 能力，拆分出尺寸估算、滚动状态、动态测量、可视范围计算、总尺寸、`scrollToIndex`/`scrollToOffset`、快照订阅与 DOM 适配接口；删除旧 `VirtualContainer` 的强耦合设计或将其替换为更薄的滚动容器绑定层，并补充测试与文档，确保 API 可直接被 Vue composable 包装。
6. 对所有改动执行必要验证，包括格式检查、受影响测试、类型检查或构建命令；修正发现的问题后，更新计划状态与 `## 影响范围`，准确记录本次实际变动文件。

## 影响范围

- `package.json`
- `bun.lock`
- `tsconfig.json`
- `turbo.json`
- `.changeset/config.json`
- `.changeset/README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `docs/package.json`
- `docs/AGENTS.md`
- `docs/.vitepress/sidebar.ts`
- `docs/content/index.md`
- `docs/content/guide/getting-started.md`
- `docs/content/guide/installation.md`
- `docs/content/raw-imports.d.ts`
- `docs/content/packages/fe/index.md`
- `docs/content/packages/fe/tween.md`
- `docs/content/packages/fe/virtualizer.md`
- `docs/examples/http/confirm.vue`
- `docs/examples/http/loading.vue`
- `docs/examples/http/plugin-browser-debug.vue`
- `docs/content/packages/excel/index.md`（删除）
- `docs/content/packages/excel/read-write.md`（删除）
- `docs/content/packages/excel/tools.md`（删除）
- `docs/content/packages/excel/workbook.md`（删除）
- `docs/content/packages/maintenance/build.md`（删除）
- `docs/content/packages/maintenance/deps.md`（删除）
- `docs/content/packages/maintenance/guide.md`（删除）
- `docs/content/packages/maintenance/index.md`（删除）
- `docs/content/packages/maintenance/monorepo.md`（删除）
- `docs/content/packages/maintenance/release.md`（删除）
- `docs/content/packages/maintenance/version.md`（删除）
- `docs/examples/excel/address-date-tools.vue`（删除）
- `docs/examples/excel/create-and-download.vue`（删除）
- `docs/examples/excel/stream-read.vue`（删除）
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/tsdown.config.ts`
- `packages/core/test/*.test.ts`
- `packages/fe/AGENTS.md`
- `packages/fe/package.json`
- `packages/fe/src/index.ts`
- `packages/fe/src/tween.ts`
- `packages/fe/src/virtualizer/index.ts`
- `packages/fe/tsdown.config.ts`
- `packages/fe/test/*.test.ts`
- `packages/be/package.json`
- `packages/be/src/cache/lru-cache.ts`
- `packages/be/src/cache/memoize.ts`
- `packages/be/src/scheduler/cron.ts`
- `packages/be/tsdown.config.ts`
- `packages/be/test/*.test.ts`
- `packages/http/package.json`
- `packages/http/src/plugins/method-override.ts`
- `packages/http/src/plugins/token.ts`
- `packages/http/src/types.ts`
- `packages/http/tsdown.config.ts`
- `packages/http/test/*.test.ts`
- `packages/cli/package.json`
- `packages/cli/tsdown.config.ts`
- `packages/cli/test/*.test.ts`
- `packages/agent-context/package.json`
- `packages/agent-context/tsdown.config.ts`
- `packages/vitepress-theme/package.json`
- `packages/vitepress-theme/tsconfig.build.json`
- `packages/vitepress-theme/src/composables/index.ts`
- `packages/vitepress-theme/src/config.ts`
- `packages/vitepress-theme/src/env.d.ts`
- `packages/vitepress-theme/src/index.ts`
- `packages/vitepress-theme/scripts/build.mjs`
- `packages/tests/**/*`（迁移后删除）
- `release/**/*`（删除）
- `scripts/sync-cat-kit-skills-api.ts`
- `skills/use-cat-kit/SKILL.md`
- `skills/cat-kit-core/generated/**/*`
- `skills/cat-kit-http/generated/**/*`
- `skills/cat-kit-fe/generated/**/*`
- `skills/cat-kit-be/generated/**/*`
- `skills/cat-kit-cli/generated/**/*`
- `skills/cat-kit-agent-context/generated/**/*`
- `skills/cat-kit-vitepress-theme/generated/**/*`
- `skills/cat-kit-tsconfig/generated/**/*`
- `skills/cat-kit-excel/**/*`（删除）
- `skills/cat-kit-maintenance/**/*`（删除）

## 历史补丁
