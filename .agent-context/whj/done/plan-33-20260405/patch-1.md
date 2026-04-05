# 修正 implement 协议步骤编号

## 补丁内容

审查发现 `implement` 协议「执行步骤」编号为 1、2、3、5、6，缺少第 4 步，与「顺序执行」纪律冲突。将「记录范围」「追问」依次改为第 4、5 步。

同步更新生成模板 `packages/agent-context/src/content/actions/implement.ts`，以及仓库内已安装的 `.agents` / `.claude` 下 `references/implement.md`，保证下次 `agent-context install` 产物与之一致。

另：曾误用 registry 上的旧版 `bunx agent-context` 在本地重新生成了已废弃的 `actions/` 目录，且把 `SKILL.md` 回退为指向 `actions/*.md` 的旧版；已删除 `actions/`，并用当前仓库内 `renderSkillArtifacts` 源码重新写出 `.agents` / `.claude` 下的 `SKILL.md`，与 `references/` 布局一致。

## 影响范围

- 修改文件: `packages/agent-context/src/content/actions/implement.ts`
- 修改文件: `.agents/skills/ac-workflow/references/implement.md`
- 修改文件: `.claude/skills/ac-workflow/references/implement.md`
- 修改文件: `.agents/skills/ac-workflow/SKILL.md`
- 修改文件: `.claude/skills/ac-workflow/SKILL.md`
