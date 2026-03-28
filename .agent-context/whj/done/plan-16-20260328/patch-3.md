# 纠正安装目标：Antigravity 保留 .agent，.agents 独立为开放标准选项

## 补丁内容

- **Antigravity** 恢复为仅使用 `.agent/skills`（与 patch-2 误改为 `.agents` 相区别）。
- 新增独立工具标识 **`agents`**，安装至 **`.agents/skills`**，对应 Agent Skills 开放标准及多工具共用的 `.agents` 路径。
- **`gemini`**（`.gemini/skills`）保持不变；移除「Antigravity 与 .agents 混用」的检测合并逻辑，各目标仅检测自身路径。
- 同步 CLI `--tools` 文案、`content.test.ts` 覆盖 `agents`、README 说明与表格。

## 影响范围

- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/types.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/tools.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/cli.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/README.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/tests/agent-context/content.test.ts`
