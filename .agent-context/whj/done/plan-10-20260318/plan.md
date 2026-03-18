# 新增 index 命令生成人类可读的计划索引

> 状态: 已执行

## 目标

为 `agent-context` CLI 新增 `index` 子命令，自动扫描当前 SCOPE 下所有计划（当前、preparing、done），提取一级标题，生成 `.agent-context/{scope}/index.md` 索引文件。

## 内容

1. **新增 `context/indexer.ts`**：实现索引生成逻辑。
   - 读取 `ContextSnapshot`，遍历 done、currentPlan、preparing 中的所有计划。
   - 从每个 `plan.md` 提取一级标题（`# ...`）。
   - 按分类（done 用 `[x]`，其他用 `[ ]`）生成 markdown 列表，每项为 `- [x/空格] [计划名称](相对路径)` 格式。
   - done 在前，当前计划次之，preparing 最后。
   - 将生成内容写入 `.agent-context/{scope}/index.md`。

2. **新增 `commands/index-cmd.ts`**：CLI 命令入口。
   - 调用 validate 前置检查。
   - 调用 indexer 生成索引。
   - 输出结果反馈。

3. **注册命令**：在 `cli.ts` 中注册 `index` 子命令。

4. **导出 indexer**：在 `context/index.ts` 中导出 `generateIndex`。

5. **在 `done` 命令中集成**：归档完成后自动调用 `generateIndex` 更新索引。

6. **验证**：运行命令确认索引文件正确生成。

## 影响范围

- 新增文件: `packages/agent-context/src/context/indexer.ts`
- 新增文件: `packages/agent-context/src/commands/index-cmd.ts`
- 修改文件: `packages/agent-context/src/context/index.ts`
- 修改文件: `packages/agent-context/src/cli.ts`
- 修改文件: `packages/agent-context/src/commands/done.ts`

## 历史补丁
