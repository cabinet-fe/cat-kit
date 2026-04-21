---
sidebarOrder: 90
title: 发布流程
outline: deep
---

# 发布流程

CatKit 把发布拆成**本地两步**和**远端自动化**：

- **本地**：只负责录入变更（`bun run changeset`）和本地升版本 + 推送（`bun run release`）。
- **远端**（`.github/workflows/release.yml`）：由 `packages/*/CHANGELOG.md` 路径变更自动触发，负责跑测试、构建、发布到 npm、为每个包打 git tag，并按仓库规则创建 GitHub Release（独立包各 1 条，fixed 组聚合为 1 条）。

**发布范围由 `.changeset/` 下保留的 changeset 决定**：

- 只想发 fixed 组（core/http/fe/be）→ 本轮只保留 fixed 组相关的 changeset。
- 只想发某个独立包 → 本轮只保留该包的 changeset。
- 想一起发 → 两边都留着。

这样既不需要本地菜单，也不需要 CI 的 `workflow_dispatch` 输入参数，录入环节就是**唯一**决定发布范围的地方。

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

摘要（summary）需包含足够背景以便在 CHANGELOG 中被用户读懂：**改了什么 + 为什么 + 对调用方的影响**。摘要会被 `changeset version` 合并进各包 `CHANGELOG.md`，远端 release 脚本会直接读取对应版本小节来生成 GitHub Release 正文。

### fixed 组的自动传染

`@cat-kit/core / http / fe / be` 是 fixed 组，版本号强制同步。为其中任意一个录入 changeset，`changeset version` 会把同一个版本号应用到组内全部 4 个包。**不要手工为组内其它包再写一条 changeset**，以免 version 冲突。

## 发布流程

仅维护者执行（要求本地在 main 分支、工作区干净、未落后于 origin/main）：

```bash
bun run release              # 正常发布
bun run release --dry-run    # 跑到 version 阶段后回滚（不 commit/push）
bun run release --force      # 允许非 main 分支
bun run release --help       # 打印帮助
```

本地脚本按 4 个阶段串行：

1. **前置检查**：工作区干净、分支为 `main`（非 main 需 `--force`）、本地未落后于 `origin/main`、存在未消费 changeset。本地脚本**不依赖** `gh` CLI，也不需要本地 `GITHUB_TOKEN`。
2. **`changeset version` + `bun install`**：升版本、写 CHANGELOG、更新内部依赖（`workspace:^` → 具体版本号）、同步 `bun.lock`。
3. **提交产物**：`git add .changeset packages package.json bun.lock` → `git commit -m "chore(release): publish <pkg-short-names>"`。
4. **推送**：`git push origin HEAD`。push 后远端 workflow 由 `packages/*/CHANGELOG.md` 路径变更自动触发，脚本打印 commit hash 与 Actions 链接即退出。

远端 GitHub Actions 触发条件与执行链路：

```text
push: branches: [main], paths: ['packages/*/CHANGELOG.md']
  └── checkout → setup-bun → setup-node → bun install --frozen-lockfile
      → bun run test → bun run build:packages
      → changesets/action@v1 publish
              ├── changeset publish
              ├── per-pkg git tag（@cat-kit/xxx@x.y.z）并推送
              └── 仓库脚本创建 GitHub Release
                      ├── fixed 组聚合为 1 条（tag: cat-kit-fixed@x.y.z）
                      └── 独立包按包各 1 条
```

> **为什么用 paths 过滤而不是 `workflow_dispatch`？** `changeset version` 必然更新 `packages/*/CHANGELOG.md`，这是 release commit 的唯一可靠信号；普通功能提交不会命中这个路径，因此不会白跑 CI。同时 `changesets/action@v1` 的 publish 模式对「无可发布版本」幂等（直接打印 `No unreleased changesets found, creating nothing`），偶发误触发也安全。

## 版本策略

| 组别 | 成员 | 语义 |
|------|------|------|
| **fixed 组** | `@cat-kit/core`、`@cat-kit/http`、`@cat-kit/fe`、`@cat-kit/be` | 版本号必须一致，单包 changeset 会整组升级 |
| **独立包** | `@cat-kit/cli`、`@cat-kit/agent-context`、`@cat-kit/vitepress-theme`、`@cat-kit/tsconfig` | 各自独立版本号 |

### GitHub Release 规则

- fixed 组仍然保留 4 个 package tag（如 `@cat-kit/core@1.0.4`），以保持 npm 与源码 tag 的一一对应。
- GitHub Releases 页面只保留 **1 条 fixed 组 release**，聚合 tag 为 `cat-kit-fixed@<version>`，正文按 `core/http/fe/be` 顺序拼接同版本 changelog。
- 独立包继续使用各自的 package tag 创建 release。

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

例如 `changeset version` 报错、工作区不干净、本地落后 origin/main 等。此时尚未产生 commit/push，只需回滚工作区：

```bash
git restore -- .                  # 撤销未暂存的改动
git reset --hard HEAD             # 彻底回滚到 HEAD（必要时）
```

修复根因后重新运行 `bun run release`。

### 场景 B：push 成功但 CI publish 失败

打开 Actions 页面定位失败 step：

- **多数情况**（npm token 偶发失败、测试偶发 flake 等）：直接点击 **Re-run failed jobs**，不需要重跑 version。本地 commit 中的版本号已固定，重试会在同一组版本号上继续 publish。
- **需代码修复**：在 `main` 继续提 commit 推动修复；修复 commit 若恰好再次改动 `packages/*/CHANGELOG.md`（罕见），workflow 会再次自动触发；否则在 Actions 页面对原 run 点 **Re-run failed jobs** 即可。`.changeset/` 中的 changeset 已被上一步 `version` 消费掉，不需重写，也不需再跑 `bun run release`。

### 场景 C：部分包已 publish 但其余包失败

首先确认失败范围（`npm view @cat-kit/<pkg> versions` 对照）。

- **72 小时内**：可对已错发的包执行 `npm unpublish @cat-kit/<pkg>@<version>` 撤回（npm 规则：24h 内无条件撤回，24~72h 内需联系 support）。撤回后修复代码再完整重发。
- **超过 72 小时**：不能撤回，只能以下一个 patch 版本号重发。此时录入新的 changeset，走 `bun run release` 再发一次即可；changelog 中建议备注「修复 vX.Y.Z 发布过程中 `<pkg>` 未同步发布」。

> 无论哪种场景，**不要**直接删除本地 `.changeset/*.md` 已被 `version` 消费的文件然后 `git push --force`；这会让 npm registry 和仓库 tag 的对应关系失准。
