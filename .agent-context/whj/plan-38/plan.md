# 基于 Changesets 的按包选择式半自动发布流水线

> 状态: 已执行

## 目标

建立一条「本地选择要发的包 + 本地完成版本升级 + 远端 GitHub Actions 完成构建与 npm publish」的半自动发布流水线，解决以下实际问题：

1. 仓库内各包发布节奏不一致：`core / fe / be / http` 为 fixed 组必须同批发布，`cli / agent-context / vitepress-theme / tsconfig` 则各自独立发布。目前的 `bun run release` 直接调用 `changeset publish`，对「按分组/按包选择发布范围」完全不支持。
2. 忘记更新内部依赖版本号、导致已发布产物运行时依赖解析失败。
3. tag 与 GitHub Release 手动编写容易遗漏、延迟或格式不一致。
4. 本地手动 `npm publish` 遗漏包、顺序错误、权限配置不一致。

设计原则：

- **按需发布 + 强一致校验**：本地脚本要求「待消费 changeset 所影响的包集合」必须**严格等于**用户本轮选择的包集合（fixed 组按整体计算）。不满足即报错退出，禁止默默升无关包。版本号仍由 `changeset version` 自主决定。
- **版本本地升，构建/发布远端做**：本地脚本完成 `changeset version` + commit + push，随后调用 `gh workflow run release.yml -f packages=...` 显式触发远端发布；远端负责 `bun install` / test / build / `changeset publish` / per-pkg tag / GitHub Release。
- **单一真相源**：所有 `@cat-kit/*` 的版本号升级由 changesets 驱动，开发者只需录入 `changeset`，不直接改 `package.json` 的 `version` 字段。内部依赖统一使用 `workspace:^`，由 `changeset version` 在发布时替换为具体版本号。
- **失败即可回滚**：本地脚本每一步具备明确回滚指引；CI 阶段失败时聚合触发参数可直接在 Actions UI 重跑，不需要重新打 tag。

## 前置条件

下列环境状态是本计划实施和首次试跑的前置，本计划不负责创建，但每步都假设其已成立：

1. **NPM_TOKEN 类型为 Automation**：npm 官网 Access Tokens 页面创建时 Type 选 Automation（非 Classic），以绕过 `@cat-kit` 组织的 2FA challenge。token 写入 GitHub 仓库 `Settings → Secrets and variables → Actions` 下的 `NPM_TOKEN`。
2. **`@cat-kit` npm 组织存在且该 token 对应账户有 publish 权限**：`npm access ls-packages` 能列出 `@cat-kit/*`。
3. **本地开发者已安装 GitHub CLI 并登录**：`gh auth status` 应返回 `Logged in to github.com`。本计划的本地 release 脚本依赖 `gh auth token` 为 `@changesets/changelog-github` 提供 GITHUB_TOKEN（供 CHANGELOG 写入 PR 链接），并依赖 `gh workflow run` 触发远端。`gh` 账户需具备对 `cabinet-fe/cat-kit` 仓库的 `repo` 权限以触发 workflow_dispatch。
4. 分支 `main` 为默认分支，允许维护者本地直接 push；若开启保护规则，需允许「本地 release 脚本所用账号的直接 push」或走 PR（本计划默认直推）。

## 包与分组约定

实施和文档全程采用以下分组：

| 组别 | 语义 | 成员 |
|------|------|------|
| **fixed 组** | 版本号绑定、必须同批发布 | `@cat-kit/core`、`@cat-kit/http`、`@cat-kit/fe`、`@cat-kit/be` |
| **独立包** | 各自独立版本号、可单独发布 | `@cat-kit/cli`、`@cat-kit/agent-context`、`@cat-kit/vitepress-theme`、`@cat-kit/tsconfig` |

> 发布时「选择粒度」= 1 个 fixed 组（整体）+ 4 个独立包 = 5 个可选项。用户可任意组合（至少选 1 项）。

## 内容

### 步骤 1：配置 changesets（fixed 组 + GitHub changelog）

1.1 修改 `.changeset/config.json`：

- `changelog` 从 `"@changesets/cli/changelog"` 改为：
  ```json
  ["@changesets/changelog-github", { "repo": "cabinet-fe/cat-kit" }]
  ```
- `fixed` 设置为：
  ```json
  [["@cat-kit/core", "@cat-kit/http", "@cat-kit/fe", "@cat-kit/be"]]
  ```
- 其它字段保持：`commit: false`、`access: "public"`、`baseBranch: "main"`、`updateInternalDependencies: "patch"`、`linked: []`、`ignore: []`。

1.2 在根 `package.json` `devDependencies` 中添加 `@changesets/changelog-github`：

```sh
bun add -D -w @changesets/changelog-github
```

完成标准：

- `.changeset/config.json` 字段匹配上述约定（JSON 合法、key 顺序不强制）。
- 根 `package.json` `devDependencies` 存在 `@changesets/changelog-github`。
- `bun install` 退出码 0。
- `bunx changeset status --output=/tmp/changeset-status.json` 运行无错（不要求有内容）。

### 步骤 2：内部依赖迁移到 workspace 协议

2.1 修改清单（基于当前仓库快照，实施时以实际文件为准）：

| 文件 | 依赖字段 | 包名 | 当前值 | 目标值 |
|------|-----------|------|--------|--------|
| `packages/be/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/fe/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/http/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/vitepress-theme/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/vitepress-theme/package.json` | dependencies | `@cat-kit/fe` | `^1.0.2` | `workspace:^` |

已是 `workspace:*` 的 `@cat-kit/tsconfig`（devDependencies）保持不变。

选用 `workspace:^` 的理由：publish 后 `changeset version` 会将其替换为 `^<具体版本号>`（与通用 npm 消费语义一致）；dev 依赖继续用 `workspace:*` 反映「开发期精确匹配」。

2.2 修改后运行 `bun install` 让 `bun.lock` 自动同步，然后运行 `bun run build` 与 `bun run test` 确认未破坏现有构建/测试。

2.3 **可选 dry-run 验证（推荐，在隔离 branch 执行避免污染）**：

1. `git checkout -b tmp/verify-workspace-replace`
2. 手写一个临时 changeset（patch 级，针对 `@cat-kit/be`）置于 `.changeset/_verify.md`，格式参照 `.changeset/README.md`。
3. 运行 `GITHUB_TOKEN=$(gh auth token) bunx changeset version`。
4. 查看 `packages/be/package.json` 中 `@cat-kit/core` 依赖值应被替换为具体 `^<语义版本号>`（例：`^1.0.3`）。
5. 验证完立刻回滚：`git checkout -- . && git clean -fd && git checkout main && git branch -D tmp/verify-workspace-replace`。

完成标准：

- `packages/*/package.json` 中不再出现 `"@cat-kit/<pkg>": "^..."` 形式的内部 dependencies（`@cat-kit/tsconfig` 的 `workspace:*` 例外）。
- `bun install` / `bun run build` / `bun run test` 退出码 0。
- 若执行了 2.3 dry-run，其替换结果符合预期且本地 branch 已完全回滚（`git status` 干净）。

### 步骤 3：新建本地发布脚本 `scripts/release.ts`

3.1 脚本基础约束：

- 路径：`scripts/release.ts`。
- 运行时：Bun（与 `scripts/sync-cat-kit-skills-api.ts` 保持一致），首行 shebang `#!/usr/bin/env bun`。
- 代码风格遵循 `CLAUDE.md`：无分号 / 单引号 / 无尾逗号 / 括号间有空格；命名 camelCase；Node 内置模块用 `node:` 协议；禁止在顶层引入任何外部运行时依赖（仅使用 Bun 内置 API、Node 内置模块）。
- 交互式选择使用 `@inquirer/prompts`（仓库内已由 `@cat-kit/agent-context` 引入，脚本通过 `bun add -D -w @inquirer/prompts` 将其升级为仓库 root 的开发依赖以避免走 workspace hoisting 的不确定性）。
- 所有子进程调用通过 `Bun.$` 模板或 `node:child_process` 的 `spawnSync`，stdin/stdout/stderr 透传。

3.2 脚本内部常量定义（需与实际代码一致）：

```ts
const FIXED_GROUP = ['@cat-kit/core', '@cat-kit/http', '@cat-kit/fe', '@cat-kit/be'] as const
const INDEPENDENT_PKGS = [
  '@cat-kit/cli',
  '@cat-kit/agent-context',
  '@cat-kit/vitepress-theme',
  '@cat-kit/tsconfig'
] as const
const SELECTABLE_UNITS = [
  { id: 'fixed', label: 'core / http / fe / be（fixed 组）', packages: FIXED_GROUP },
  { id: 'cli', label: '@cat-kit/cli', packages: ['@cat-kit/cli'] },
  { id: 'agent-context', label: '@cat-kit/agent-context', packages: ['@cat-kit/agent-context'] },
  { id: 'vitepress-theme', label: '@cat-kit/vitepress-theme', packages: ['@cat-kit/vitepress-theme'] },
  { id: 'tsconfig', label: '@cat-kit/tsconfig', packages: ['@cat-kit/tsconfig'] }
]
```

3.3 脚本执行阶段（顺序串行，任意阶段非零退出立即终止并打印回滚指引）：

1. **前置检查**
   - `git status --porcelain` 确认工作区干净；非空则报错退出。
   - `git rev-parse --abbrev-ref HEAD` 确认当前分支为 `main`；非 main 时：若 `--force` 未指定则报错退出，指定则打印 warn 继续。
   - `git fetch origin main --quiet` 后比较 `git rev-list --count HEAD..origin/main`；非 0 则报错「本地落后于远端，请先 pull」。
   - 列出未消费的 changeset（`.changeset/` 下除 `README.md`、`config.json` 外所有 `.md`）。为空则报错退出（无可发布的变更）。
   - **获取 GITHUB_TOKEN**：通过 `gh auth token` 子进程读取 token，存入当前进程环境的 `GITHUB_TOKEN`。`gh` 不存在或未登录时，打印「请安装 GitHub CLI 并执行 `gh auth login` 后重试」并退出。

2. **解析 changeset 影响包集合**
   - 用 `@changesets/read` 或直接正则解析每个 `.changeset/*.md` 的 frontmatter，提取 `"@cat-kit/xxx": patch|minor|major` 键集合；合并为 `affectedPkgs: Set<string>`。
   - fixed 组整体展开：若 `affectedPkgs` 与 fixed 组有**任一**交集，则展开为全部 4 个成员加入 `effectivePkgs`；其余独立包原样加入 `effectivePkgs`。
   - （选用 `@changesets/read` 可避免自写解析；若作为 npm 包引入会增加依赖体积，本计划建议用 40 行左右的自写 frontmatter 解析器，仅依赖 `node:fs/promises` 与 `node:path`。）

3. **选择发布范围**
   - 若指定了 `--select <csv>`：csv 每项必须属于 `SELECTABLE_UNITS` 中的 id，否则报错列出合法值。
   - 否则交互式 checkbox：展示 5 个可选项（fixed 组 + 4 个独立包），至少勾选 1 项。
   - 将用户选择转换为 `selectedPkgs: Set<string>`（fixed 组单元展开为 4 个成员）。

4. **一致性校验**
   - 计算 `diffA = effectivePkgs - selectedPkgs`（changeset 涉及但未选）与 `diffB = selectedPkgs - effectivePkgs`（选了但无 changeset）。
   - 只要任一非空即报错退出，打印 diff 清单和建议：
     ```
     以下包有待消费 changeset 但未被选中（违反「纪律」）：<diffA>
     以下包被选中但没有待消费 changeset：<diffB>
     请：1) 补录/移除 changeset 或 2) 调整本轮选择。
     ```

5. **执行 changeset version**
   - 以 `GITHUB_TOKEN=<token>` 环境执行 `bunx changeset version`。
   - 执行 `bun install` 让 `bun.lock` 与新版本号同步。

6. **提交产物**
   - 收集 selectedPkgs 中的主版本单元短名（如 `core/http/fe/be` 合并写作 `fixed`；独立包用其短名）生成 commit 标题：
     - `chore(release): publish <short-names-joined-by-comma>`，例如 `chore(release): publish fixed, cli`。
   - `git add .changeset packages/*/package.json packages/*/CHANGELOG.md package.json bun.lock`。
   - `git commit -m "<title>"`；若 `git diff --cached --quiet` 无变更则脚本报错退出（理论不应发生）。

7. **推送**
   - `git push origin HEAD`。

8. **触发远端 workflow**
   - 计算 `packagesArg = [...selectedPkgs].sort().join(',')`（例如 `@cat-kit/be,@cat-kit/core,@cat-kit/fe,@cat-kit/http`）。
   - 调用 `gh workflow run release.yml --ref main -f packages="$packagesArg"`。
   - 打印：
     ```
     ✓ 已触发发布流水线
       分支:   main
       提交:   <HEAD short hash>
       包:     <packagesArg>
       查看:   https://github.com/cabinet-fe/cat-kit/actions/workflows/release.yml
     ```

9. **失败回滚指引（打印在脚本帮助文本 / 触发失败分支日志中）**：
   ```
   # 若触发后 CI 发布失败：
   # 1. 在 GitHub Actions 页面重跑该次 workflow run（参数已记录）。
   # 2. 若需完全回滚本次本地 commit（CI 尚未 publish）：
   git reset --hard HEAD~1
   git push --force-with-lease origin main
   ```

3.4 CLI 参数（最小集合）：

- `--dry-run`：执行阶段 1-5，打印将要 commit 的 diff 后 `git restore .` 回退，不产生 commit/push/触发。
- `--select <csv>`：非交互式传入可选单元 id（如 `fixed,cli`）。
- `--force`：跳过非 main 分支检查。
- `--help`：打印用法说明（含 3.3 的回滚指引）。

完成标准：

- `scripts/release.ts` 存在且可运行（`bun run scripts/release.ts --help` 打印可读帮助）。
- `bunx oxfmt --check scripts/release.ts` 通过。
- `bunx oxlint scripts/release.ts` 无 error（warning 可接受）。
- 在临时分支上运行 `bun run release --dry-run --select fixed`，行为满足：当 `.changeset/` 有且仅有 fixed 组相关 changeset 时正常走完 1-5 阶段并回滚，`git status` 干净；当存在独立包相关 changeset 时报错退出并打印 diff。
- 缺失 `gh` 或未登录时，脚本以可读错误信息退出，退出码非 0。

### 步骤 4：修改根 `package.json` scripts

4.1 将 `scripts` 字段调整为：

```json
{
  "changeset": "changeset",
  "release": "bun run scripts/release.ts",
  "release:publish": "changeset publish"
}
```

- 删除原 `"version": "changeset version"`（封装进 release 脚本，不再暴露）。
- 覆盖原 `"release": "changeset publish"`（改为本地流水线入口）。
- 新增 `"release:publish"` 供 CI workflow 调用（等价于原 `release` 命令的语义）。

其它脚本（`build` / `build:packages` / `dev` / `dev:docs` / `lint` / `test` / `typecheck` / `format` / `update` / `sync-cat-kit-skills-api*` / `sync-use-cat-kit-api*`）保持不变。

完成标准：

- `package.json` 中 `scripts` 字段仅新增/修改上述三个键；其它键位不变。
- `bun run release --help` 正常输出脚本帮助文本。
- `bun run release:publish --help` 输出 changeset publish 帮助文本。

### 步骤 5：新增 GitHub Actions 发布 workflow

5.1 在 `.github/workflows/release.yml` 创建发布工作流，完整 YAML 如下：

```yaml
name: 发布到 npm

on:
  workflow_dispatch:
    inputs:
      packages:
        description: '本次发布范围（csv，来自本地 release 脚本；仅用于审计与日志，实际 publish 由 changeset publish 根据 registry 差异决定）'
        required: true
        type: string

permissions:
  contents: write
  id-token: write

concurrency:
  group: release
  cancel-in-progress: false

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: 打印本次发布范围
        run: echo "packages=${{ inputs.packages }}"

      - name: 安装 Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: 安装 Node.js（供 npm publish 使用）
        uses: actions/setup-node@v5
        with:
          node-version: 22
          registry-url: 'https://registry.npmjs.org'

      - name: 缓存 Bun 依赖
        uses: actions/cache@v5
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: 安装依赖
        run: bun install --frozen-lockfile

      - name: 运行测试
        run: bun run test

      - name: 构建所有包
        run: bun run build:packages

      - name: 发布到 npm 并创建 GitHub Release
        uses: changesets/action@v1
        with:
          publish: bun run release:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

关键说明：

- `on: workflow_dispatch` + `inputs.packages`：由本地 `gh workflow run` 显式触发，`packages` 仅作日志/审计，不影响 `changeset publish` 行为。publish 范围的正确性已由本地脚本在步骤 3 的一致性校验保证。
- `changesets/action@v1` 在 publish 模式（仅传 `publish` 未传 `version`）下：
  - 直接调用 `bun run release:publish` 执行 `changeset publish`。
  - 自动解析 publish stdout 中 `New tag: @cat-kit/xxx@x.y.z` 信息，为每个成功发布的包创建 **per-pkg git tag** 并推送，同时通过 `@changesets/changelog-github` 产出的 changelog 内容创建 **GitHub Release**。
- `publish: bun run release:publish` 展开为 `bun run changeset publish`。`changeset publish` 内部调用 `npm publish`，通过 `actions/setup-node@v5` 的 `registry-url` 生成的临时 `.npmrc` 与 `NODE_AUTH_TOKEN` 完成 registry 认证。
- `NPM_TOKEN` 与 `NODE_AUTH_TOKEN` 同时保留，兜底 changesets/action 与 bun 内部 publish 检测逻辑对 token 命名的不同预期。

5.2 兼容性验证要点（在 5.3 实施验证中明确执行）：

- 手工在 Actions 页面以 `packages=@cat-kit/cli` 为参数触发一次 workflow run；在 `.changeset/` 无未消费 changeset 时预期 `changesets/action` 打印 `No unreleased changesets found, creating nothing` 并以成功结束。
- 若报「no package manager detected」，降级方案：把 publish 步骤替换为手写版（`run: bun run release:publish` 直接跑；并另加一个 step 自行解析 `changeset publish` 的输出创建 per-pkg tag 与 `gh release create`）。此降级方案仅在 primary 方案确认失败时启用，不在主实施路径执行。

5.3 部署后清理：删除 5.2 中可能产生的任何临时 tag 或 release 条目（若 primary 方案下 changesets/action 因「无变更」跳过，则无需清理）。

完成标准：

- `.github/workflows/release.yml` 通过 YAML 语法检查（VS Code YAML 插件 / `actionlint`）。
- GitHub 仓库 `Actions` 列表中出现「发布到 npm」工作流卡片，点击可见 `Run workflow` 按钮与 `packages` 输入框。
- 一次真实发布（端到端验证步骤 7）后：npm registry 上对应包出现新版本；GitHub 仓库 Releases 页面出现 `@cat-kit/<pkg>@<version>` 条目，release note 包含 changelog 与 PR 链接（`changelog-github` 行为）；对应 per-pkg git tag 已推送。

### 步骤 6：文档与规则更新

6.1 同步更新根 `CLAUDE.md` 与 `AGENTS.md`（两份文件内容保持完全一致，都需修改）：

- 「常用命令」章节中将：
  ```
  # 版本与发布
  bun run changeset
  bun run version
  ```
  替换为：
  ```
  # 录入变更（开发者每次完成功能后执行）
  bun run changeset

  # 发布（维护者执行，交互选择本轮要发的包，触发 GitHub Actions）
  bun run release
  ```

- 「构建约定」章节将「版本与发布：Changesets」一条扩写为两行：
  - 版本管理：Changesets（`fixed` 组：core/http/fe/be 共版本；其它包独立版本）。
  - 发布流程：本地 `bun run release`（选包 + `changeset version` + push）→ `gh workflow run` 触发远端 Actions 执行构建与 publish。

6.2 新增文档页面 `docs/content/guide/publishing.md`（VitePress 自动扫描 sidebar，无需改动 `docs/.vitepress/config.ts` 或 `sidebar.ts`）。页面结构包含以下 4 个 H2 小节：

1. **## 录入变更** — 开发者完成功能后执行 `bun run changeset` 的规范：patch/minor/major 选择原则；摘要格式要求；fixed 组的自动传染行为；**重要纪律：每次 `changeset` 只为本轮要发的包录入**（便于发布时一致性校验通过）。
2. **## 发布流程** — 按 `scripts/release.ts` 实际行为分 8 个阶段逐步说明（前置检查 → 解析 changeset → 选择范围 → 一致性校验 → version → commit → push → 触发 workflow），附最终 GitHub Actions 执行链路图（用 mermaid 或文字描述均可）。
3. **## 版本策略** — 列出 fixed 组（core/http/fe/be）与独立版本包（cli/agent-context/vitepress-theme/tsconfig）分界，以及 `workspace:^` 在 publish 时的替换语义示例（发布前 `"@cat-kit/core": "workspace:^"` → 发布后 `"@cat-kit/core": "^1.0.3"`）。
4. **## 故障恢复** — 给出以下 3 种具体故障场景的处置清单：
   - 场景 A：本地脚本在 push 前失败 → `git restore .`、`git reset --hard` 回滚工作区/提交。
   - 场景 B：`gh workflow run` 成功但 CI publish 失败 → 先在 Actions UI 查看错误；多数情况可直接 `Re-run failed jobs`；若因代码问题需修复，则在 main 继续提 commit 并再次触发 workflow（同一批版本号的 changeset 已被消费，不需重跑 version）。
   - 场景 C：部分包已 publish 到 npm 但失败包未发 → 72 小时内用 `npm unpublish @cat-kit/<pkg>@<version>` 撤回（npm 内部限制：24h 内可无条件撤回，72h 内需联系支持），超时则只能 bump 到下一个 patch 重发。

页面 frontmatter 使用：

```yaml
---
sidebarOrder: 90
title: 发布流程
---
```

`sidebarOrder: 90` 将其排在「开始」sidebar 靠后位置；实施时若与现有 guide 文档冲突，调整为不冲突的大数值。

6.3 无需改动 `docs/.vitepress/config.ts` 或 `docs/.vitepress/sidebar.ts`：按文件系统自动扫描 `docs/content/**/*.md`，新增文件会自动出现在对应 sidebar 路径下。

完成标准：

- `CLAUDE.md` 与 `AGENTS.md` 中均不再出现 `bun run version` 指令；两份文件的「常用命令」段落文本完全一致，「构建约定」段落的「版本与发布」两条也一致。
- `docs/content/guide/publishing.md` 存在，4 个 H2 小节齐备，每个小节至少包含 1 个可执行命令或 1 个具体场景的处置步骤。
- `bun --cwd docs run dev` 启动后，在「开始」sidebar 中能看到「发布流程」入口，点击能打开该页面。

### 步骤 7：端到端验证

7.1 在一个临时分支或 main 分支上执行以下 checklist，逐项确认。**除非明确标注，每项通过需要退出码 0**：

- [ ] 仓库根执行 `bun install`、`bun run build`、`bun run test` 全部通过。
- [ ] `bun run changeset` 能正确枚举所有 8 个可发布包。
- [ ] 录入一条测试 changeset（仅针对 `@cat-kit/cli`，patch 级）。
- [ ] `bun run release --dry-run --select cli` 打印预期 version 变更且不产生副作用（运行后 `git status` 干净）。
- [ ] `bun run release --dry-run --select fixed`（在仅有 cli 的 changeset 场景下）**应当报错退出**并打印「`@cat-kit/cli` 有 changeset 但未被选中」。
- [ ] `bun run release --select cli`（非交互）完整走完 1-8 阶段；远端出现 workflow_dispatch 触发的 run；CI 成功 publish `@cat-kit/cli`；npm registry 上 `@cat-kit/cli` 新版本可见；GitHub Releases 页面出现 `@cat-kit/cli@<版本>` 条目，正文含 changelog + PR 链接；`@cat-kit/cli@<版本>` 的 per-pkg git tag 已推送。
- [ ] 验证 fixed 组行为：录入一条针对 `@cat-kit/core` 的 patch 级 changeset，`bun run release --select fixed` 走完发布，确认 `core / http / fe / be` 四个包同步升 patch、版本号一致，四条 GitHub Release 均已生成。
- [ ] 验证错配校验：同时录入 `@cat-kit/cli`（patch）和 `@cat-kit/core`（patch）两条 changeset，运行 `bun run release --select cli` **应当报错退出**（fixed 组有 changeset 但未被选中）；改为 `--select cli,fixed` 后应正常走完。

7.2 全部通过后执行 `agent-context done` 归档本计划。任一步失败走 patch 协议修补。

## 影响范围

- `.changeset/config.json`：`changelog` 切换为 `@changesets/changelog-github`（repo: `cabinet-fe/cat-kit`），`fixed` 配置为 `[["@cat-kit/core","@cat-kit/http","@cat-kit/fe","@cat-kit/be"]]`
- `package.json`（仓库根）：`scripts` 删除 `version`、`release` 改为 `bun run scripts/release.ts`、新增 `release:publish`；`devDependencies` 新增 `@changesets/changelog-github` 与 `@inquirer/prompts`
- `packages/be/package.json`：`@cat-kit/core` 依赖迁移到 `workspace:^`
- `packages/fe/package.json`：`@cat-kit/core` 依赖迁移到 `workspace:^`
- `packages/http/package.json`：`@cat-kit/core` 依赖迁移到 `workspace:^`
- `packages/vitepress-theme/package.json`：`@cat-kit/core` 与 `@cat-kit/fe` 依赖均迁移到 `workspace:^`
- `scripts/release.ts`：新增，实现 8 阶段本地流水线（前置检查 → changeset 解析 → 选择 → 一致性校验 → version → commit → push → 触发 workflow）
- `.github/workflows/release.yml`：新增，`workflow_dispatch` + `inputs.packages` + `changesets/action@v1 publish`
- `CLAUDE.md`：「常用命令」块的「版本与发布」替换为 `bun run changeset` + `bun run release`；「构建约定」中 `版本与发布：Changesets` 扩写为「版本管理」与「发布流程」两条
- `AGENTS.md`：同 `CLAUDE.md` 的两处一致变更
- `docs/content/guide/publishing.md`：新增，包含「录入变更 / 发布流程 / 版本策略 / 故障恢复」四个 H2 小节
- `bun.lock`：因依赖变更自动同步

未执行的验证项（需要真实 npm 凭证与远端 workflow 触发，本地无法安全完成）：计划步骤 7.1 中涉及真实 `bun run changeset`、`bun run release --select cli` 完整 8 阶段、fixed 组整体升版、错配校验两条 changeset 场景等端到端 checklist。本地已验证：依赖安装、完整 build、完整 test、`docs` 构建生成 `publishing.html`、`scripts/release.ts` 的 `--help`、oxfmt、oxlint、非干净工作区前置检查阻断行为。

## 历史补丁

- patch-1: 发布 workflow 由 `gh workflow run` 切换为 push 路径触发
