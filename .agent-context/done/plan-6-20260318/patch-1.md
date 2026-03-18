# 优化 rush 执行步骤结构

## 补丁内容

将 rush 的执行步骤从「手动展开 implement 验证循环」改为「阶段一：plan（差异）+ 阶段二：implement（完整引用）」结构。

**原问题**：rush 步骤 3 将 implement 的验证循环（3.1～3.3）手动展开重复列出，导致日后 implement 协议变更时 rush 不会自动跟随，需要双重维护。

**修改方式**：
- 执行步骤改为"阶段一/阶段二"两阶段结构，仅列出与原协议的差异点
- 阶段一（plan 差异）：跳过需求澄清、强制单计划、不等待用户确认
- 阶段二（implement）：直接引用 implement 协议完整执行，不再展开内部细节

## 影响范围

- 修改文件: `packages/agent-context/src/content/actions.ts`
- 修改文件: `.cursor/skills/ac-workflow/actions/rush.md`
- 修改文件: `.agent/skills/ac-workflow/actions/rush.md`
