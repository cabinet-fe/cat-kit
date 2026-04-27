# cat-kit 统一技能 — 剩余包 + 清理旧技能

> 状态: 已执行

## 目标

完成 cli、agent-context、tsconfig、vitepress-theme 的文档编写，删除旧的 9 个技能目录，更新 AGENTS.md 中的技能引用。

## 内容

### 1. 编写 cli 包文档

`packages/cli/index.md` 从占位升级为完整内容，列出所有可用命令、参数说明、使用场景。

### 2. 编写 agent-context 包文档

`packages/agent-context/index.md` 从占位升级为完整内容，覆盖 CLI 命令（init/plan/sync/prompt-gen/done）和编程 API。

### 3. 编写 tsconfig 包文档

`packages/tsconfig/index.md` 已较完整，复查确认类型引用路径正确。

### 4. 编写 vitepress-theme 包文档

`packages/vitepress-theme/index.md` 已较完整，复查确认。

### 5. 删除旧技能目录

删除以下目录及其全部内容：
- `skills/use-cat-kit/`
- `skills/cat-kit-core/`
- `skills/cat-kit-http/`
- `skills/cat-kit-fe/`
- `skills/cat-kit-be/`
- `skills/cat-kit-cli/`
- `skills/cat-kit-agent-context/`
- `skills/cat-kit-tsconfig/`
- `skills/cat-kit-vitepress-theme/`

### 6. 更新项目引用

- `AGENTS.md`：更新「AI 助手：cat-kit 技能」段落，指向新的单一 `skills/cat-kit/SKILL.md`
- `package.json`：确认 sync 脚本命令无变化

## 影响范围

- 修改文件: `skills/cat-kit/packages/cli/index.md`
- 修改文件: `skills/cat-kit/packages/agent-context/index.md`
- 删除目录: `skills/use-cat-kit/`
- 删除目录: `skills/cat-kit-core/`
- 删除目录: `skills/cat-kit-http/`
- 删除目录: `skills/cat-kit-fe/`
- 删除目录: `skills/cat-kit-be/`
- 删除目录: `skills/cat-kit-cli/`
- 删除目录: `skills/cat-kit-agent-context/`
- 删除目录: `skills/cat-kit-tsconfig/`
- 删除目录: `skills/cat-kit-vitepress-theme/`
- 修改文件: `AGENTS.md`

## 历史补丁
