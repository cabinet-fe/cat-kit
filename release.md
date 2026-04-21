# Release Guide

CatKit 的发布分为两段：

- 本地：录入 changeset，并执行 `bun run release`
- 远端：GitHub Actions 在 `main` 分支上自动完成测试、构建、npm publish 和 GitHub Release

## 触发条件

发布 workflow 定义在 `.github/workflows/release.yml`，只有满足下面两个条件才会触发：

- 有新的 `push` 到 `main`
- 这次提交改动命中了 `packages/*/CHANGELOG.md`

这意味着普通功能提交不会触发发布。通常只有执行过 `changeset version` 并把产物 push 到 `main` 后，发布 workflow 才会启动。

## 本地发布步骤

先录入变更：

```bash
bun run changeset
```

再执行发布：

```bash
bun run release
```

可选参数：

```bash
bun run release --dry-run
bun run release --force
bun run release --help
```

`bun run release` 本地会做 4 件事：

1. 检查工作区是否干净、当前分支是否为 `main`、本地是否落后于 `origin/main`、是否存在未消费的 changeset
2. 执行 `changeset version` 和 `bun install`
3. 提交版本产物
4. 推送到远端，交给 GitHub Actions 继续完成发布

## 发布范围怎么决定

发布范围不是通过命令参数控制，而是通过当前保留在 `.changeset/` 里的 changeset 文件控制：

- 只想发 fixed 组：只保留 fixed 组相关 changeset
- 只想发独立包：只保留该包相关 changeset
- 想一起发：两类 changeset 一起保留

## 版本策略

### fixed 组

以下 4 个包属于 fixed 组，版本号始终同步：

- `@cat-kit/core`
- `@cat-kit/http`
- `@cat-kit/fe`
- `@cat-kit/be`

为 fixed 组中任意一个包写 changeset，`changeset version` 都会把同一个版本号应用到整组。不要给组内其他包重复写一份 changeset。

### 独立包

以下包独立发版：

- `@cat-kit/cli`
- `@cat-kit/agent-context`
- `@cat-kit/vitepress-theme`
- `@cat-kit/tsconfig`

## 远端发布链路

GitHub Actions 的执行顺序如下：

```text
push main + packages/*/CHANGELOG.md 变更
  -> checkout
  -> setup bun
  -> setup node
  -> bun install --frozen-lockfile
  -> bun run test
  -> bun run build:packages
  -> changesets/action publish
  -> create-github-releases.ts
```

其中：

- `changesets/action@v1` 负责 `changeset publish`
- npm publish 成功后，会为每个包打 package tag
- GitHub Release 由仓库脚本 `scripts/create-github-releases.ts` 统一生成

## GitHub Release 规则

### fixed 组

fixed 组现在只生成 1 条 GitHub Release：

- GitHub Release tag：`cat-kit-fixed@<version>`
- Release 名称：`@cat-kit/fixed v<version>`

但 package tag 仍然会保留 4 个：

- `@cat-kit/core@<version>`
- `@cat-kit/http@<version>`
- `@cat-kit/fe@<version>`
- `@cat-kit/be@<version>`

这样做的目的是：

- npm 包和源码 tag 仍然一一对应
- GitHub Releases 页面不会因为 fixed 组刷出 4 条重复 release

### 独立包

独立包继续按包生成各自的 GitHub Release，tag 仍然是：

```text
@cat-kit/<pkg>@<version>
```

## changelog 与 release notes

- `changeset version` 会把摘要写入各包 `CHANGELOG.md`
- workflow 触发依赖 `packages/*/CHANGELOG.md` 的变更
- GitHub Release 正文会读取对应版本的小节内容生成

所以 changeset 的 summary 需要写清楚：

- 改了什么
- 为什么改
- 对调用方有什么影响

## 故障处理

### 本地失败，尚未 push

可以修复问题后重新执行：

```bash
bun run release
```

如果 `changeset version` 已经改了工作区，但还没 push，可以先手动回滚本地改动。

### 已经 push，但 CI 失败

优先处理方式：

- 如果是偶发失败，直接在 Actions 页面 `Re-run failed jobs`
- 如果是代码问题，继续修复并 push；是否重新触发 workflow 取决于新的提交是否再次改动了 `packages/*/CHANGELOG.md`

### 部分包已发布，部分包失败

这种情况需要先确认 npm 上哪些版本已经存在，再决定是重试、补发，还是走下一个 patch 版本修复。不要直接删除已经被消费的 `.changeset/*.md` 再强推历史。
