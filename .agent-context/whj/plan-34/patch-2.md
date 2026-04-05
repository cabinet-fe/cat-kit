# 重组 agent-context 源码目录，统一职责边界

## 补丁内容

将 `packages/agent-context/src` 按职责重组为 `commands`、`skill`、`workspace` 三个清晰域，避免 `content`、`context`、`runner`、`tools` 这类语义模糊的顶级命名继续混在一起。

本次同时处理了几类组织层面的怪异点：

- 将 Skill 渲染、安装、裁剪、版本处理、工具目标解析收拢到 `src/skill/`
- 将 `.agent-context` 工作区读写、归档、校验、索引生成收拢到 `src/workspace/`
- 将 `content/actions` 改为 `skill/protocols`，并把内部常量从 `ACTION_*` 同步改为 `PROTOCOL_*`
- 将 `commands/index-cmd.ts` 改为 `commands/index.ts`
- 更新全部 import 路径，确保目录重排后构建与 CLI 行为不变

## 影响范围

- 新增文件: `packages/agent-context/src/commands/index.ts`
- 新增文件: `packages/agent-context/src/skill/fs.ts`
- 新增文件: `packages/agent-context/src/skill/installer.ts`
- 新增文件: `packages/agent-context/src/skill/metadata.ts`
- 新增文件: `packages/agent-context/src/skill/prune.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/implement.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/index.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/init.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/patch.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/plan.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/replan.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/review.ts`
- 新增文件: `packages/agent-context/src/skill/protocols/rush.ts`
- 新增文件: `packages/agent-context/src/skill/render.ts`
- 新增文件: `packages/agent-context/src/skill/targets.ts`
- 新增文件: `packages/agent-context/src/skill/version.ts`
- 新增文件: `packages/agent-context/src/workspace/archive.ts`
- 新增文件: `packages/agent-context/src/workspace/index-file.ts`
- 新增文件: `packages/agent-context/src/workspace/index.ts`
- 新增文件: `packages/agent-context/src/workspace/reader.ts`
- 新增文件: `packages/agent-context/src/workspace/scope.ts`
- 新增文件: `packages/agent-context/src/workspace/validate.ts`
- 修改文件: `packages/agent-context/src/cli.ts`
- 修改文件: `packages/agent-context/src/commands/done.ts`
- 修改文件: `packages/agent-context/src/commands/init.ts`
- 修改文件: `packages/agent-context/src/commands/install.ts`
- 修改文件: `packages/agent-context/src/commands/prompt-gen.ts`
- 修改文件: `packages/agent-context/src/commands/status.ts`
- 修改文件: `packages/agent-context/src/commands/sync.ts`
- 修改文件: `packages/agent-context/src/commands/validate.ts`
- 删除文件: `packages/agent-context/src/commands/index-cmd.ts`
- 删除文件: `packages/agent-context/src/content/actions/implement.ts`
- 删除文件: `packages/agent-context/src/content/actions/index.ts`
- 删除文件: `packages/agent-context/src/content/actions/init.ts`
- 删除文件: `packages/agent-context/src/content/actions/patch.ts`
- 删除文件: `packages/agent-context/src/content/actions/plan.ts`
- 删除文件: `packages/agent-context/src/content/actions/replan.ts`
- 删除文件: `packages/agent-context/src/content/actions/review.ts`
- 删除文件: `packages/agent-context/src/content/actions/rush.ts`
- 删除文件: `packages/agent-context/src/content/index.ts`
- 删除文件: `packages/agent-context/src/context/archiver.ts`
- 删除文件: `packages/agent-context/src/context/index.ts`
- 删除文件: `packages/agent-context/src/context/indexer.ts`
- 删除文件: `packages/agent-context/src/context/reader.ts`
- 删除文件: `packages/agent-context/src/context/scope.ts`
- 删除文件: `packages/agent-context/src/context/validator.ts`
- 删除文件: `packages/agent-context/src/fs-utils.ts`
- 删除文件: `packages/agent-context/src/package-version.ts`
- 删除文件: `packages/agent-context/src/runner.ts`
- 删除文件: `packages/agent-context/src/skill-metadata.ts`
- 删除文件: `packages/agent-context/src/skill-prune.ts`
- 删除文件: `packages/agent-context/src/tools.ts`
