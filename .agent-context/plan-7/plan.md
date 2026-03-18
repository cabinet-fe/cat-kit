# 修复 verify-commit 命令在 git hook 中的 bug

> 状态: 已执行

## 目标

修复 `bun cat-cli verify-commit` 在 `commit-msg` hook 中无法正确获取提交信息的问题。

## 内容

1. 修改 `verifyCommitAction`：当无 `file` 参数和 `--message` 选项时，默认读取 `.git/COMMIT_EDITMSG`，而非从 stdin 读取（stdin 在 hook 上下文中不可靠）
2. 新增 `stripComments` 逻辑：去除 `#` 开头的注释行（git 在 commit-msg hook 之后才清理注释）
3. 移除 `readFromStdin` 函数（verify-commit 场景下无实际用途）
4. 运行已有测试，确保核心校验逻辑未被破坏

## 影响范围

- `packages/cli/src/commands/verify-commit.ts` — 重写消息来源逻辑，新增 `stripComments`，移除 `readFromStdin`
- `packages/tests/cli/verify-commit.test.ts` — 新增 `stripComments` 测试用例

## 历史补丁
