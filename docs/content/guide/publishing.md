---
sidebarOrder: 90
title: 发布流程
outline: deep
---

# 发布流程

CatKit 使用「本地选择 + 远端 GitHub Actions」的半自动流水线发布 `@cat-kit/*` 到 npm。本地负责版本升级和触发，远端负责构建、发布、打 tag、建 GitHub Release。

## 录入变更

**每次** 完成会影响用户的功能后，开发者都应在仓库根执行：

```bash
bun run changeset
```

选择规则：

| 变更级别 | 适用场景 |
|---------|---------|
| `patch` | 修复 bug、内部重构、不影响公开 API |
| `minor` | 新增功能、新增公开 API、不破坏既有兼容性 |
| `major` | 破坏性变更（删除/重命名公开 API、行为不兼容） |

摘要（summary）需包含足够背景以便在 CHANGELOG 中被用户读懂：**改了什么 + 为什么 + 对调用方的影响**。

### fixed 组的自动传染

`@cat-kit/core / http / fe / be` 是 fixed 组，版本号强制同步。为其中任意一个录入 changeset，`changeset version` 会把同一个版本号应用到组内全部 4 个包。**不要手工为组内其它包再写一条 changeset**，避免 version 冲突。

### 纪律：单次只为本轮要发的包录入

本地 `bun run release` 会做「待消费 changeset 影响包集合 == 本轮选择集合」的强一致校验（fixed 组按整体计算）。如果 `.changeset/` 同时存在「独立包 A」和「独立包 B」的 changeset，但本轮只想发 A，则 B 的 changeset 必须先从 `.changeset/` 中移除（或等到下一轮随 B 一起发）。**禁止「默默升无关包」**。

## 发布流程

仅维护者执行（要求本地已登录 `gh` 并在 main 分支，工作区干净）：

```bash
bun run release                           # 交互选择
bun run release --select fixed,cli        # 非交互
bun run release --dry-run                 # 跑到 version 阶段并回滚
bun run release --force                   # 允许非 main 分支
```

本地脚本按 8 个阶段串行：

1. **前置检查**：工作区干净、分支为 `main`（非 main 需 `--force`）、本地未落后于 `origin/main`、存在未消费 changeset、能读到 `gh auth token`。
2. **解析 changeset 影响包集合**：扫描 `.changeset/*.md` frontmatter，收集 `@cat-kit/xxx: patch|minor|major`；若命中 fixed 组任一成员则整组展开。
3. **选择发布范围**：交互式 checkbox 或 `--select <csv>`；可选单元共 5 个（1 个 fixed 组 + 4 个独立包）。
4. **一致性校验**：`effective` 与 `selected` 必须**严格相等**，否则列出差集并报错退出。
5. **执行 `changeset version`**：以 `GITHUB_TOKEN` 环境运行；`changelog-github` 自动插入 PR/commit 链接。随后 `bun install` 同步 lockfile。
6. **提交产物**：`git add .changeset packages package.json bun.lock` → `git commit -m "chore(release): publish <short-names>"`。
7. **推送**：`git push origin HEAD`。
8. **触发远端 workflow**：`gh workflow run release.yml --ref main -f packages="<csv>"`；打印 commit hash、包列表、Actions 链接。

远端 GitHub Actions 执行链路：

```
checkout → setup-bun → setup-node → bun install --frozen-lockfile
         → bun run test → bun run build:packages
         → changesets/action@v1 publish
                 ├── bun run release:publish（= changeset publish）
                 ├── per-pkg git tag（@cat-kit/xxx@x.y.z）并推送
                 └── 为每个 publish 成功的包创建 GitHub Release
```

## 版本策略

| 组别 | 成员 | 语义 |
|------|------|------|
| **fixed 组** | `@cat-kit/core`、`@cat-kit/http`、`@cat-kit/fe`、`@cat-kit/be` | 版本号必须一致，单包 changeset 会整组升级 |
| **独立包** | `@cat-kit/cli`、`@cat-kit/agent-context`、`@cat-kit/vitepress-theme`、`@cat-kit/tsconfig` | 各自独立版本号 |

内部依赖统一使用 **`workspace:^`** 协议，在 `changeset version` 时会被替换为实际版本号。例如 `@cat-kit/http` 的 `dependencies` 中：

```jsonc
// 发布前（仓库源码）
{ "@cat-kit/core": "workspace:^" }

// 发布后（npm registry 上的 package.json）
{ "@cat-kit/core": "^1.0.3" }
```

开发期 `devDependencies` 中的 `@cat-kit/tsconfig` 保留 `workspace:*`，表示「精确匹配 workspace 内版本」。

## 故障恢复

### 场景 A：本地脚本在 push 前失败

例如 changeset version 报错、一致性校验失败、`gh` 未登录等。此时尚未产生 commit/push，只需回滚工作区：

```bash
git restore -- .                  # 撤销未暂存的改动
git reset --hard HEAD             # 彻底回滚到 HEAD（必要时）
```

修复根因后重新运行 `bun run release`。

### 场景 B：`gh workflow run` 成功但 CI publish 失败

打开 Actions 页面定位失败 step：

- **多数情况**（npm token 偶发失败、测试偶发 flake 等）：直接点击 **Re-run failed jobs**，不需要重跑 version。本地 commit 中的版本号已固定，重试会在同一组版本号上继续 publish。
- **需代码修复**：在 `main` 继续提 commit 推动修复，然后在 Actions 页面对同一次 workflow run 点 Re-run，或重新手工触发 `workflow_dispatch`（参数填相同的 `packages` csv）。`.changeset/` 中的 changeset 已被上一步 `version` 消费掉，不需重写，也不需再跑 `bun run release`。

### 场景 C：部分包已 publish 但其余包失败

首先确认失败范围（`npm view @cat-kit/<pkg> versions` 对照）。

- **72 小时内**：可对已错发的包执行 `npm unpublish @cat-kit/<pkg>@<version>` 撤回（npm 规则：24h 内无条件撤回，24~72h 内需联系 support）。撤回后修复代码再完整重发。
- **超过 72 小时**：不能撤回，只能以下一个 patch 版本号重发。此时录入新的 changeset，走 `bun run release` 再发一次即可；changelog 中建议备注「修复 vX.Y.Z 发布过程中 `<pkg>` 未同步发布」。

> 无论哪种场景，**不要**直接删除本地 `.changeset/*.md` 已被 `version` 消费的文件然后 `git push --force`；这会让 npm registry 和仓库 tag 的对应关系失准。
