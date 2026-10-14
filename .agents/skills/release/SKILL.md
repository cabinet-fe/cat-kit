---
name: release
description: cat-kit 发版操作（发版规范 A：公开 npm · CI · changesets）。在本仓库发版、发布、升版本、publish、release、出新版本时使用——即使用户没明说「发版」。
---

# cat-kit 发版

规范 A：公开 npm，一切 publish 由 CI 完成，本地只准备并触发。发版分支 **main**。

## 步骤

1. 前置：`git status --porcelain` 干净、在 main、`git pull --ff-only` 不落后。
2. 确认待处理 changeset：`ls .changeset/*.md`（README.md 除外）。没有就用 Write 写 `.changeset/<slug>.md` 并 commit `chore: add changeset`（**不要跑交互式 `bun run changeset`**）：

   ```markdown
   ---
   "@cat-kit/core": patch
   ---

   fix: 修复 xxx
   ```

3. `bun run release` —— 自动完成 changeset version + bun install + commit + push（`--dry-run` 演练、`--force` 跳过分支检查）。
4. push 触碰 `packages/*/CHANGELOG.md` 自动触发 release.yml。`gh run list --limit 1` 拿 run 链接告知用户即结束，**不要 watch**。

## 本项目要点

- 发布物 8 包：`@cat-kit/{be,cli,core,crypto,fe,http,tsconfig,vitepress-theme}`。fixed 组 `@cat-kit/{core,http,fe,be}` 同步同版本，changeset 只列真正有改动的包即可。
- CI（release.yml）：npm OIDC 免 token + provenance + 固定 npm@11；发布后自动打 `@包名@版本` tag，fixed 组另有聚合 GitHub Release `cat-kit-fixed@<版本>`。
- CI 失败：GitHub Actions 页面重跑该 run；本地回滚 `git reset --hard HEAD~1`（详见 release.ts 输出的提示）。
- 禁止：本地 `npm publish`；watch / 轮询 CI；派子代理调查发版方式。

## 维护

发版配置（fixed 组、workflow、脚本）变动时，以仓库现状为准并同步更新本文件。
