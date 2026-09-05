---
title: "@cat-kit/cli"
description: Node.js 命令行包：cat-cli 校验 Git 提交信息是否符合 Conventional Commits
---

## 概述

`@cat-kit/cli` 提供可执行文件 `cat-cli`，公开用途是校验 Git commit message 是否符合 Conventional Commits 首行格式。**不提供**可从包根导入的编程 API。

- 版本：1.0.6
- 可执行文件：`cat-cli`（bin 指向包内 `dist/cli.js`）

## 何时使用

在 `commit-msg` hook 或脚本中强制 Conventional Commits 风格首行：

```bash
cat-cli verify-commit [file] [-m <message>]
```

消息来源优先级：`--message` → 位置参数文件 → `.git/COMMIT_EDITMSG`。`#` 注释行会在校验前移除。

## 最小示例

```bash
# .git/hooks/commit-msg
#!/bin/sh
cat-cli verify-commit "$1"
```

```bash
npx --package @cat-kit/cli cat-cli verify-commit --message "feat(api)!: change response format"
```

## 校验规则

- 格式：`<type>[(<scope>)][!]: <subject>`
- `type` 仅接受：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`、`release`
- 读取失败或格式不匹配时非 0 退出

## 约束

- 不要使用 `npx cat-cli`（可能解析到其他包）
- 不要 `import '@cat-kit/cli'`（无公开编程 API）
