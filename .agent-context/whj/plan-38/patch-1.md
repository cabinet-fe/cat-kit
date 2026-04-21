# 发布 workflow 由 `gh workflow run` 切换为 push 路径触发

## 补丁内容

原计划阶段 8 通过 `gh workflow run release.yml -f packages=...` 显式触发远端 Actions；改为由 `packages/*/CHANGELOG.md` 的路径变更自动触发（canonical changesets 模式）。

**动机**

- `gh workflow run` 依赖本地 `gh` CLI 同时拥有 `repo` 与 `workflow_dispatch` 权限，额外增加账号权限管理负担。
- `changeset version` 必然改写 `packages/*/CHANGELOG.md`，这是 release commit 的唯一可靠信号；普通开发提交不会命中此路径。
- `changesets/action@v1` 的 publish 模式对「无可发布版本」幂等（`No unreleased changesets found, creating nothing`），即便误触发也安全。
- 去掉显式 `workflow_dispatch` 后，发布流程从 8 步压缩为 7 步，push 即发布，更符合官方推荐模式。

**关键变更**

1. `.github/workflows/release.yml`
   - `on` 从 `workflow_dispatch` + `inputs.packages` 改为 `push: branches: [main], paths: ['packages/*/CHANGELOG.md']`。
   - 移除「打印本次发布范围」步骤（不再有 `inputs.packages` 参数）。
   - 其余 step（checkout/setup-bun/setup-node/cache/install/test/build/publish）保持不变。

2. `scripts/release.ts`
   - 移除阶段 8（`gh workflow run release.yml -f packages=...`）。
   - 阶段数从 8 改为 7：阶段 7 为「推送（push 后远端 Actions 自动触发）」。
   - 更新 CLI `--help`、脚本头注释、`ROLLBACK_HELP` 文案。
   - 仍保留 `resolveGhToken()` 并在阶段 1 要求 `gh auth token` 可用，因为 `changeset version` 需要 `GITHUB_TOKEN` 供 `@changesets/changelog-github` 写入 PR/commit 链接。

3. 文档同步
   - `docs/content/guide/publishing.md`：流程说明从 8 阶段改 7 阶段；「远端执行链路」头部补充触发条件；「场景 B」标题由「`gh workflow run` 成功但 CI publish 失败」改为「push 成功但 CI publish 失败」；新增一段 callout 解释为何采用 paths 过滤。
   - `AGENTS.md` / `CLAUDE.md`：第 98 行「`gh workflow run` 触发远端 Actions」改为「远端 Actions 由 `packages/*/CHANGELOG.md` 路径变更自动触发」。

**验证**

- `bunx oxfmt --check scripts/release.ts` 通过。
- `bunx oxlint scripts/release.ts` 0 警告 0 错误。
- `bun run scripts/release.ts --help` 输出正确（flags 文案、7 阶段回滚指引）。
- `.github/workflows/release.yml` YAML 语法合法（通过 VS Code YAML 插件视觉校验；`concurrency: release` 仍保证串行）。

**未覆盖**

- 真实端到端发布（需真实 npm/GitHub 凭证）未执行：包括「push 后 workflow 自动触发」与「path filter 精确度」两项，需下次实际发布时观测。

## 影响范围

- 修改文件: `.github/workflows/release.yml`
- 修改文件: `scripts/release.ts`
- 修改文件: `docs/content/guide/publishing.md`
- 修改文件: `AGENTS.md`
- 修改文件: `CLAUDE.md`
