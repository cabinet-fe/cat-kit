# 回填 agent-context Skill 模板源并补回归验证

## 补丁内容

将此前直接落在 SKILL 产物文件中的协议文案变化，回填到 `packages/agent-context` 的模板生成源码中，确保后续通过包内生成逻辑即可产出当前版本的 Skill 内容。

同时补充一个回归测试，校验 `packages/agent-context/src` 渲染出的 Skill 文件与仓库内已安装的 Claude、Cursor、Antigravity Skill 保持一致。为完成构建验证，还顺手修复了 `install`、`sync` 和 `indexer` 中几个与 `exactOptionalPropertyTypes` / 未使用类型相关的 TypeScript 问题。

## 影响范围

- 新增文件: `/Users/whj/Codes/cat-kit/packages/tests/agent-context/content.test.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/install.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/sync.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/content/actions.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/content/index.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/context/indexer.ts`
