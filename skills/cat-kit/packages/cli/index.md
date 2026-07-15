# @cat-kit/cli

Node.js 命令行包，当前公开用途是校验 Git commit message。它不提供可从包根导入的编程 API。

## 何时使用

需要在 `commit-msg` hook 或脚本中强制 Conventional Commits 风格的首行时使用：

```bash
cat-cli verify-commit [file] [-m <message>]
```

消息来源优先级为 `--message`、位置参数文件、`.git/COMMIT_EDITMSG`。文件中的 `#` 注释行会在校验前移除。

## 最小示例

```bash
# .git/hooks/commit-msg
#!/bin/sh
cat-cli verify-commit "$1"
```

手动核对可运行：

```bash
cat-cli verify-commit --message "feat(api)!: change response format"
```

## 约束与边界

- 支持格式为 `<type>[(<scope>)][!]: <subject>`。
- `type` 仅接受 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`、`release`。
- 读取失败或格式不匹配时以非 0 状态退出，适合直接阻止提交。
- 可执行文件名是 `cat-cli`。临时执行 scoped 包应使用 `npx --package @cat-kit/cli cat-cli ...`；不要使用会解析成另一个包的 `npx cat-cli`。
- 不要导入 `@cat-kit/cli`、`src` 或 `dist` 路径；该包没有已发布的公共 JS/TS API 或类型入口。
