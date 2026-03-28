# 安装目标对齐 .agents 标准并增加 Gemini CLI

## 补丁内容

- 将 Antigravity 对应的 Skill 根目录由 `.agent/skills` 改为 Agent Skills 通用别名 `.agents/skills`；`install` / `sync` 仅向新路径写入。`detectConfiguredToolIds` 仍识别旧路径 `.agent/skills`，便于已安装项目被勾选与后续同步迁移。
- 新增工具标识 `gemini`，安装至 `.gemini/skills/ac-workflow/`，与 [Gemini CLI](https://www.geminicli.com/docs/cli/skills/) 工作区技能发现路径一致。
- 更新 CLI `--tools` 说明、README 中「支持的工具」与示例路径；扩展 `content.test.ts` 覆盖 `gemini`；在本仓库根目录加入 `.gemini/skills/ac-workflow/` 副本供回归对齐。

## 影响范围

- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/types.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/tools.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/cli.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/README.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/tests/agent-context/content.test.ts`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/SKILL.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/init.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/plan.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/replan.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/implement.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/patch.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.gemini/skills/ac-workflow/actions/rush.md`
