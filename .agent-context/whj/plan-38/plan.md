# 构建基于 Changesets + GitHub Actions 的自动化发布流水线

> 状态: 未执行

## 目标

建立一条规范、可追溯、自动化的 monorepo 发布流水线，覆盖从开发者本地录入变更到 npm 发布与 GitHub Release 编写的全流程，消除以下人工操作带来的出错风险：

1. 忘记更新内部依赖版本号、导致已发布产物运行时依赖解析失败。
2. `core / http / fe / be` 四个「版本统一组」的包版本号漂移。
3. 本地手动 `npm publish` 遗漏包、顺序错误、权限配置不一致。
4. tag 与 GitHub Release 手动编写容易遗漏、延迟或格式不一致。

设计原则：

- **单一真相源**：包版本升级由 changesets 控制，开发者只需录入 `changeset`，不直接改 `package.json` 版本号。
- **本地触发、远端执行**：开发者在本地发一个聚合触发 tag，CI 完成真正的 publish、per-pkg tag、GitHub Release 创建。
- **失败即回滚**：每个阶段具备失败检测与明确的回滚指引，保证发版是可中断、可恢复的。
- **与 Bun 工具链兼容**：已有 Bun + Turbo 栈保持不变；仅在 CI publish 阶段同时安装 Node.js 以使用 `npm publish` 保证 registry 兼容性。

## 前置条件

在实施与首次试跑前必须满足（非本计划实施内容，但计划的每一步依赖以下状态成立）：

1. **NPM_TOKEN 类型必须是 Automation**：在 npm 官网 Access Tokens 页面，Type 选择 **Automation**（非 Classic），否则开启了 2FA 的 @cat-kit scope 在 CI 场景下会遭遇 2FA challenge 导致发布失败。该 token 以 `NPM_TOKEN` 为名写入 GitHub 仓库 `Settings → Secrets and variables → Actions`。
2. **`@cat-kit` npm 组织存在并已授予 NPM_TOKEN 对应账户 publish 权限**：`npm access ls-packages` 应能列出 `@cat-kit/*` 或显示组织可发布权限。
3. **本地开发者已安装 GitHub CLI 并登录**：执行 `gh auth status` 应返回 `Logged in to github.com`。本计划中的本地 release 脚本依赖 `gh auth token` 为 `@changesets/changelog-github` 提供 GITHUB_TOKEN，否则 `changeset version` 阶段会失败或退化为无 PR 链接输出。
4. 分支 `main` 为默认分支且受保护规则允许 release 脚本推送（或 release 仅在维护者账号本地运行，直接 push 到 main 受允许）。

## 内容

### 步骤 1：配置 changesets（fixed 组 + GitHub changelog）

1.1 修改 `.changeset/config.json`：

- 将 `changelog` 从 `"@changesets/cli/changelog"` 改为：
  ```json
  ["@changesets/changelog-github", { "repo": "cabinet-fe/cat-kit" }]
  ```
- 将 `fixed` 设置为：
  ```json
  [["@cat-kit/core", "@cat-kit/http", "@cat-kit/fe", "@cat-kit/be"]]
  ```
- 其它字段保持：`commit: false`、`access: "public"`、`baseBranch: "main"`、`updateInternalDependencies: "patch"`、`linked: []`、`ignore: []`。

1.2 在根 `package.json` `devDependencies` 中安装 `@changesets/changelog-github`：

```sh
bun add -D -w @changesets/changelog-github
```

完成标准：

- `.changeset/config.json` 字段匹配上述约定。
- 根 `package.json` 的 `devDependencies` 存在 `@changesets/changelog-github`。
- `bun install` 退出码 0。
- `bunx changeset status --output=/tmp/changeset-status.json` 运行无错（不要求有内容）。

### 步骤 2：内部依赖迁移到 workspace 协议

2.1 逐一修改 `packages/*/package.json`，将形如 `"@cat-kit/<x>": "^1.0.2"` 的生产依赖改写为 `"@cat-kit/<x>": "workspace:^"`；devDependencies 中已有的 `"@cat-kit/tsconfig": "workspace:*"` 保持不变。

需要修改的条目清单（基于当前仓库快照，实施时以实际文件为准）：

| 文件 | 依赖字段 | 包名 | 当前值 | 目标值 |
|------|-----------|------|--------|--------|
| `packages/be/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/fe/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/http/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/vitepress-theme/package.json` | dependencies | `@cat-kit/core` | `^1.0.2` | `workspace:^` |
| `packages/vitepress-theme/package.json` | dependencies | `@cat-kit/fe` | `^1.0.2` | `workspace:^` |

选用 `workspace:^` 的理由：对于消费方而言 publish 后得到 `^<version>`，与通用 npm 语义一致；dev 依赖继续用 `workspace:*` 反映「开发期精确匹配」。

2.2 修改完成后运行 `bun install`，确认 `bun.lock` 自动同步且 `bun run build` 仍可通过。

2.3 **可选 dry-run 验证（推荐，在隔离 branch 执行避免污染）**：

1. `git checkout -b tmp/verify-workspace-replace`
2. 手写一个临时 changeset（patch 级，针对 `@cat-kit/be`）置于 `.changeset/_verify.md`。
3. 运行 `GITHUB_TOKEN=$(gh auth token) bunx changeset version`。
4. 查看 `packages/be/package.json` 中 `@cat-kit/core` 依赖值应被替换为具体 `^<语义版本号>`（例：`^1.0.3`）。
5. 验证完立刻回滚：`git checkout -- . && git clean -fd && git checkout main && git branch -D tmp/verify-workspace-replace`。

完成标准：

- `packages/*/package.json` 中不再出现 `"@cat-kit/*": "^..."` 形式的内部依赖（`@cat-kit/tsconfig` 的 `workspace:*` 例外）。
- `bun install` 退出码 0；`bun run build` 退出码 0；`bun run test` 退出码 0。
- 若执行了 2.3 dry-run，其替换结果符合预期且本地 branch 已完全回滚（`git status` 干净）。

### 步骤 3：新建本地发布脚本 `scripts/release.ts`

3.1 脚本基础约束：

- 路径：`scripts/release.ts`。
- 运行时：Bun（与 `scripts/sync-cat-kit-skills-api.ts` 保持一致）。
- 代码风格遵循 `CLAUDE.md` 规范：无分号 / 单引号 / 无尾逗号 / 括号间有空格；命名 camelCase；Node 内置模块用 `node:` 协议导入。
- 所有子进程调用通过 `Bun.$` 模板或 `node:child_process` 的 `spawnSync`，stdin/stdout/stderr 透传。

3.2 脚本执行阶段（顺序串行，任意阶段非零退出立即终止并打印回滚指引）：

1. **前置检查**
   - `git status --porcelain` 确认工作区干净；非空则报错退出。
   - `git rev-parse --abbrev-ref HEAD` 确认当前分支为 `main`；非 main 时打印 warn 并要求 `--force` 继续（默认 false）。
   - 列出未消耗的 changeset（`.changeset/*.md` 排除 `README.md` 与 `config.json`）；若为空则报错退出（无可发布的变更）。
   - **获取 GITHUB_TOKEN**：通过 `gh auth token` 子进程读取 token，存入当前进程环境的 `GITHUB_TOKEN`。`gh` 不存在或未登录时，打印「请安装 GitHub CLI 并执行 `gh auth login` 后重试」并退出。

2. **执行 changeset version**
   - 以 `GITHUB_TOKEN=<token>` 环境执行 `bunx changeset version`。
   - 执行 `bun install` 让 `bun.lock` 与新版本号同步。

3. **提交产物**
   - `git add .changeset packages/*/package.json packages/*/CHANGELOG.md package.json bun.lock`
   - `git commit -m "chore(release): 版本更新"`；若 `git diff --cached --quiet` 无变更（理论不应发生，changeset 未消耗或 version 未升），脚本报错退出。

4. **生成聚合触发 tag**
   - 名称格式：`release-YYYYMMDDHHmm`（UTC 时间，例：`release-202604211530`）。
   - `git tag <tag>`；若 tag 已存在，追加秒级后缀 `release-YYYYMMDDHHmmss` 重试一次，仍冲突则报错退出。

5. **推送**
   - `git push origin HEAD`（推送 release commit）。
   - `git push origin <tag>`（推送聚合 tag，触发 CI）。
   - stdout 打印：tag 名、GitHub Actions 链接提示（形如 `https://github.com/cabinet-fe/cat-kit/actions`）、回滚命令模板：
     ```
     # 若 CI 发布失败需本地回滚：
     git push --delete origin <tag>
     git tag -d <tag>
     git reset --hard HEAD~1
     git push --force-with-lease origin main
     ```

3.3 CLI 参数（最小集合）：

- `--dry-run`：仅执行「前置检查 + changeset version + bun install」三步，打印 diff 后执行 `git restore .` 回退，不产生 commit/tag/push。
- `--force`：跳过非 main 分支检查。

完成标准：

- `scripts/release.ts` 存在且可运行。
- `bunx oxfmt --check scripts/release.ts` 通过（风格合规）。
- `bunx oxlint scripts/release.ts` 无 error。
- 在一个干净本地测试 branch 上运行 `bun run release --dry-run`，输出预期 version 变更摘要且不产生任何 commit/tag，退出后 `git status` 恢复干净。
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
- 新增 `"release:publish"` 供 CI workflow 调用（等价于原 `release` 命令）。

其它脚本（`build` / `test` / `lint` / `typecheck` / `format` / `sync-cat-kit-skills-api*` / `update` 等）保持不变。

完成标准：

- `package.json` 中 `scripts` 字段仅新增/修改上述三个键；其它键位不变。
- `bun run release --dry-run` 等价于 `bun run scripts/release.ts --dry-run`。
- `bun run release:publish --help` 正常返回 changeset publish 帮助文本。

### 步骤 5：新增 GitHub Actions 发布 workflow

5.1 在 `.github/workflows/release.yml` 创建发布工作流，完整 YAML 如下：

```yaml
name: 发布到 npm

on:
  push:
    tags:
      - 'release-*'

permissions:
  contents: write
  id-token: write

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

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

- 触发条件锁定 `release-*` 聚合 tag。`changesets/action@v1` 内部为每个实际发布的包自动创建 per-pkg git tag（`@cat-kit/xxx@x.y.z`）与对应 GitHub Release；这些 per-pkg tag **不参与 workflow 触发**（触发 pattern 是 `release-*`，per-pkg tag 名称以 `@` 开头不匹配），避免递归。
- `publish: bun run release:publish` 展开为 `bun run changeset publish`。`changeset publish` 内部调用 `npm publish`，需要仓库根存在有效 `.npmrc` 认证。`actions/setup-node@v5` 配合 `registry-url` 会自动在构建前写入临时 `.npmrc`，`NODE_AUTH_TOKEN` 环境变量作为认证 token 被它读取。
- `NPM_TOKEN` 同时保留，兜底 changesets/action 与 bun 内部 publish 检测逻辑对 token 命名的不同预期。

5.2 兼容性验证要点（在 5.3 实施验证中明确执行）：

- 在主分支外创建分支 `tmp/verify-action-syntax`，手工 push 一个 `release-verify-<timestamp>` tag，观察 workflow 是否被触发。
- 观察 `changesets/action` 步骤日志中是否打印 `No unreleased changesets found, creating nothing`（无未发布变更时的预期行为）或 `Packages to be published: ...`（有变更时）。
- 若日志报「no package manager detected」，降级方案：把 publish 步骤替换为手写版（`npx changeset publish --otp ${{ secrets.NPM_OTP }}` 不可用——用 automation token 无需 otp；改为直接 `run: bun run release:publish` 并新增一个独立 step 通过 `changesets/action` 的 `created-releases` 输出或自行解析 `@cat-kit/xxx@x.y.z` tag 创建 release）。此降级方案仅在 primary 方案确认失败时启用，不在主实施路径执行。

5.3 部署后清理：删除 5.2 中可能创建的 `tmp/verify-action-syntax` 分支和 `release-verify-*` tag，确保仓库无测试遗留。

完成标准：

- `.github/workflows/release.yml` 通过 YAML 语法检查（可用 VS Code YAML 插件或 `actionlint`）。
- GitHub 仓库 `Actions` 列表中出现「发布到 npm」工作流卡片。
- 真实发布一次测试 changeset（针对 `@cat-kit/cli`，patch 级）后，npm registry 与 GitHub Releases 均出现对应新版本。

### 步骤 6：文档与规则更新

6.1 同步更新 `CLAUDE.md` 和 `AGENTS.md`（二者内容保持一致，均需修改）：

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

  # 发布（仅维护者执行，触发端到端流水线）
  bun run release
  ```
- 「构建约定」章节将「版本与发布：Changesets」一条扩写为两行：
  - 版本管理：Changesets（`fixed` 组：core/http/fe/be 共版本；其它包独立版本）。
  - 发布流程：本地 `bun run release` 生成聚合 tag → GitHub Actions 自动发布。

6.2 新增文档页面 `docs/content/guide/publishing.md`（走 VitePress 自动扫描 sidebar，无需改动 `config.ts` 或 `sidebar.ts`）。页面结构包含以下 4 个 H2 小节：

1. **## 录入变更** — 开发者完成功能后执行 `bun run changeset` 的规范（patch/minor/major 选择原则、摘要格式要求、fixed 组的自动传染行为）。
2. **## 发布流程** — 按 `scripts/release.ts` 实际行为分 5 个阶段逐步说明（前置检查 → version → commit → tag → push），附最终 GitHub Action 执行链路图（用 mermaid 或文字描述均可）。
3. **## 版本策略** — 列出 fixed 组（core/http/fe/be）与独立版本包（tsconfig/cli/agent-context/vitepress-theme）分界，以及 `workspace:^` 在 publish 时的替换语义示例。
4. **## 故障恢复** — 给出以下 3 种具体故障场景的处置清单：
   - 场景 A：本地脚本在 push 前失败 → `git reset --hard`、`git tag -d`。
   - 场景 B：CI 在 publish 步骤失败但 tag 已推 → 重跑 Action / 修复后 force-push 新 commit 并重新 tag。
   - 场景 C：部分包已 publish 到 npm 但失败包未发 → 72 小时内用 `npm unpublish @cat-kit/xxx@x.y.z` 撤回，超时则只能 bump 到下一个 patch 重发。

页面 frontmatter 使用：

```yaml
---
sidebarOrder: 90
title: 发布流程
---
```

`sidebarOrder: 90` 将其排在「开始」sidebar 靠后位置，避免与入门文档顺序冲突（实施时若与现有 guide 文档的 sidebarOrder 冲突，调整为不冲突的大数值）。

6.3 无需改动 `docs/.vitepress/config.ts` 或 `docs/.vitepress/sidebar.ts`：后者按文件系统自动扫描 `docs/content/**/*.md`，新增文件会自动出现在对应 sidebar 路径下。

完成标准：

- `CLAUDE.md` 与 `AGENTS.md` 中不再出现 `bun run version` 指令；两份文件的「常用命令」段落文本完全一致。
- `docs/content/guide/publishing.md` 存在且 4 个 H2 小节齐备，每个小节至少包含 1 个可执行命令或 1 个具体场景的处置步骤。
- `bun --cwd docs run dev` 启动后，在「开始」sidebar 中能看到「发布流程」入口，点击能打开该页面。

### 步骤 7：端到端验证

7.1 在一个临时分支或 main 分支上执行以下 checklist，逐项确认：

- [ ] 仓库根执行 `bun install`、`bun run build`、`bun run test` 全部通过。
- [ ] `bun run changeset` 能正确枚举所有 8 个可发布包。
- [ ] 录入一条测试 changeset（仅针对 `@cat-kit/cli`，patch 级别）。
- [ ] `bun run release --dry-run` 能打印预期 version 变更且不产生副作用（运行后 `git status` 干净）。
- [ ] `bun run release` 能完整走完 5 个阶段并在远端看到 `release-*` tag 被推送。
- [ ] GitHub Action「发布到 npm」成功执行完毕。
- [ ] npm registry 上 `@cat-kit/cli` 出现新版本（仅该包升版，其它未升）。
- [ ] GitHub Releases 页面出现 `@cat-kit/cli@<版本>` 条目，正文包含 changelog + PR 链接。
- [ ] 验证 fixed 组行为：再录入一条针对 `@cat-kit/core` 的 patch 级 changeset，走完一次发布，确认 `core / http / fe / be` 四个包同步升 patch、版本号一致。

7.2 全部通过后调用 `agent-context done` 归档本计划。任一步失败走 patch 协议修补。

## 影响范围

## 历史补丁
