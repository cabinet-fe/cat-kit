# Changesets

本目录保存版本变更意图与发布元信息。

- 新增变更说明：`bun run changeset`
- 本地发布（跑 `changeset version` + commit + push，其余在 GitHub Actions 中完成）：`bun run release`

发布范围完全由本目录下保留的 changeset 决定：想发什么包，就只保留对应的 changeset 文件。
