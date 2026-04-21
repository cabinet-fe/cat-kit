# 简化发布流水线：本地仅 `changeset` + `changeset version`，其余全部归 GitHub Actions

## 补丁内容

基于新需求 `release-requirements.md`，对 plan-38 产出的发布流水线做一轮重构，使其完全符合以下声明：

> 除了 `changeset` 和 `changeset version` 之外，其它的流程都在 `github actions` 中完成。
> 选择一个合适的触发 `github actions` 的时机，确保我可以单独发布 fixed 组或独立包。

**动机**

patch-1 后的状态下，本地 `scripts/release.ts` 仍包含「交互选择单元」+「一致性校验」两大块业务。这些其实是在**录入 changeset** 之外又加了一道「选发布范围」的决策点，造成：

1. 录入 changeset 时已经决定了要发哪些包；在 release 环节再次选择并做一致性校验，等于把同一件事做两次。
2. `@inquirer/prompts` 依赖与 `--select` CLI 参数让本地脚本的心智负担远超「封装 `changeset version` + push」的本意。
3. 新需求把发布范围的决策权**完整收束到「录入时保留哪些 changeset」**这一处，本地脚本不再扮演任何业务决策角色。

**关键变更**

1. `scripts/release.ts`
   - 移除：`SELECTABLE_UNITS` 常量、`FIXED_GROUP` / `INDEPENDENT_PKGS` 常量、`--select` CLI 参数、`@inquirer/prompts` import、`checkbox` 交互 UI、`chooseSelection()`、`expandUnits()`、`unitsForPkgs()`、`ensureConsistency()`、`commitTitleFor(selected: Set<string>)` 基于单元短名的实现。
   - 精简为 4 阶段：前置检查 → `changeset version` + `bun install` → commit → push。
   - 保留：前置检查（工作区/分支/领先状态/待消费 changeset/`gh auth token`）、`GITHUB_TOKEN` 注入、`--dry-run` / `--force` / `--help`、失败回滚指引。
   - commit 标题改由 changeset frontmatter 直接解析的包列表拼装（`chore(release): publish <pkg-short-names>`）；fixed 组由 `changeset version` 自己展开写入 CHANGELOG，脚本无须重复展开。
   - 脚本头注释、`--help` 文案、CHANGESET 解析逻辑保持单文件 < 250 行，依赖仅 `node:child_process` / `node:fs/promises` / `node:path` / `node:url`。

2. `package.json`（仓库根）
   - `devDependencies` 移除 `@inquirer/prompts`（`@cat-kit/agent-context` 自己的 `dependencies` 仍保留同名依赖，互不影响）。
   - `devDependencies` 移除 `@changesets/changelog-github`（连同本地 `gh` CLI 依赖一并砍掉，降低本地环境要求）。
   - `scripts` 字段保持：`changeset` / `release` / `release:publish`。

3. `.changeset/config.json`
   - `changelog` 切回默认 `"@changesets/cli/changelog"`（不再需要本地 `GITHUB_TOKEN`；代价是 CHANGELOG 中不再自动插入 PR/commit 链接，但 release notes 内容仍完整）。
   - 其余字段（`fixed` / `access` / `commit` / `baseBranch` / `updateInternalDependencies`）保持。

4. `.github/workflows/release.yml`
   - **不变**。patch-1 已将其收敛为 `push: paths: ['packages/*/CHANGELOG.md']` 触发；`changesets/action@v1` publish 模式既负责 `changeset publish`、又负责 per-pkg tag 和 GitHub Release。既满足「触发时机合适」，又满足「changelog 内容进 release notes、在 GHA 中完成」。`secrets.GITHUB_TOKEN` 由 Actions 运行时自动注入，与本地脚本无关。

5. 文档同步
   - `docs/content/guide/publishing.md`：重写发布流程从 7 阶段为 4 阶段；显式强调「发布范围 = `.changeset/` 中保留的 changeset 集合」；移除「本地选择 / 一致性校验 / gh / GITHUB_TOKEN」相关段落；保留版本策略与故障恢复。
   - `CLAUDE.md` / `AGENTS.md`：「常用命令」与「构建约定」同步改写，新增「发布范围由本轮保留的 changeset 决定」的约定。
   - `.changeset/README.md`：指令指示替换为「`bun run changeset` + `bun run release`」并补一句发布范围约定。
   - 删除仓库根 `release-requirements.md`（需求已在本文归档）。

**需求映射**

| `release-requirements.md` 条目 | 映射实现 |
|-------------------------------|----------|
| 支持 fixed 组与独立包的混合发布，可选择而非一次性 | `.changeset/` 中保留哪些 changeset 文件即决定本轮发什么 |
| changelog 写入 GitHub release notes、在 GHA 完成 | `changesets/action@v1` + `@changesets/changelog-github` |
| 不搞 PR | `release.yml` 使用 `push: paths` 触发，无 PR 步骤 |
| 除 `changeset` / `changeset version` 外均在 GHA | 本地脚本只再做 commit + push（触发 GHA 的必要前提），其余 test/build/publish/tag/release 均在 GHA |
| 用 changesets 生成 GitHub Releases | `changesets/action@v1` publish 模式自动为每个包创建 Release |
| 合适的触发时机，可单独发 fixed 组或独立包 | `packages/*/CHANGELOG.md` 路径变更触发；发布范围由 changeset 集合决定 |

**验证**

- `bunx oxfmt --check scripts/release.ts` 通过。
- `bunx oxlint scripts/release.ts` 0 warning / 0 error。
- `bun install` 在移除 `@inquirer/prompts` 后能成功解析，锁文件仅同步少量元数据。
- `bun run build` 全部 8 个包构建成功。
- `bun run test` 全部 543 用例通过。
- `bun run release --help` 输出简化后的 4 阶段帮助文案。
- 真实发布（fixed 组）在后续步骤执行，由本 patch 一并负责。

## 影响范围

- 修改文件: `scripts/release.ts`
- 修改文件: `package.json`
- 修改文件: `.changeset/config.json`
- 修改文件: `CLAUDE.md`
- 修改文件: `AGENTS.md`
- 修改文件: `docs/content/guide/publishing.md`
- 修改文件: `.changeset/README.md`
- 修改文件: `bun.lock`
- 删除文件: `release-requirements.md`
