---
title: "@cat-kit/cli 命令行工具"
description: "Node.js 命令行工具包，提供可执行文件 cat-cli：verify-commit 命令按 Conventional Commits 校验 Git 提交信息首行（type/scope/!:/subject），适配 commit-msg hook 与 CI；包根无编程 API。"
aliases: [cat-cli, commitlint 替代, commit message 校验, 提交信息检查, Git 提交校验]
keywords: [verify-commit, commit-msg, COMMIT_EDITMSG, Conventional Commits, feat, fix, chore, revert, release, breaking change, 提交信息校验, 提交格式校验, husky, 退出码, 提交验证失败, 提交验证通过, 无法读取文件]
---

# @cat-kit/cli 命令行工具

`@cat-kit/cli`（当前版本 1.0.6，基于 commander）提供可执行文件 `cat-cli`（bin 指向包内 `dist/cli.js`），公开用途是校验 Git 提交信息首行是否符合 Conventional Commits 格式，供 `commit-msg` hook、CI 或脚本调用。业务命令只有 `verify-commit`（`help` 为 commander 内置命令）；包根没有可导入的编程 API（`import '@cat-kit/cli'` 会失败）。

## 安装

```bash
# npm
npm install -D @cat-kit/cli
# pnpm
pnpm add -D @cat-kit/cli
# bun
bun add -d @cat-kit/cli
```

安装后二进制位于 `node_modules/.bin/cat-cli`，npm scripts 与 husky hook 内可直接写 `cat-cli`。

不安装、一次性执行（包名与命令名不同，必须写 `--package`）：

```bash
# npx
npx --package @cat-kit/cli cat-cli verify-commit --message "feat(api)!: change response format"
# bunx
bunx --package @cat-kit/cli cat-cli verify-commit --message "feat(api)!: change response format"
```

> [!WARNING]
> - `npx cat-cli`（不带 `--package @cat-kit/cli`）按 npm 包名 `cat-cli` 解析，安装执行的不是本包。
> - 禁止 `import '@cat-kit/cli'`：包根没有导出，编程用途走深路径 `@cat-kit/cli/commands/verify-commit`（见下文 `## 模块速查`）。

版本与帮助：

```bash
cat-cli --version  # => 1.0.6
cat-cli --help
cat-cli verify-commit --help
```

## 模块速查

包对外只有两种使用方式：命令行入口 `cat-cli` 与深路径导入的校验函数。

| 模块 | 用途 | 入口 |
| --- | --- | --- |
| `cat-cli verify-commit` | 校验 Git 提交信息 | 命令行，见下文 |
| `@cat-kit/cli/commands/verify-commit` | 编程调用校验与注释剥离函数 | `import { verifyCommitMessage, stripComments } from '@cat-kit/cli/commands/verify-commit'` |

### 命令与参数

```text
cat-cli verify-commit [file] [-m <msg>]
```

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `file`（位置参数） | `string` | `.git/COMMIT_EDITMSG` | 否 | 包含提交信息的文件路径，相对当前工作目录 |
| `-m, --message <msg>` | `string` | 无 | 否 | 直接传入提交信息字符串；先做 `trim()` 再校验；传空字符串 `''` 视为未提供，回退到文件来源 |

消息来源优先级：`--message`（非空字符串）→ 位置参数 `file` → `.git/COMMIT_EDITMSG`。读取文件后先剥离注释（见下文校验规则）再校验。

全局选项：`-V, --version` 输出版本号（如 `1.0.6`）；`-h, --help` 输出帮助。未知命令与缺少选项取值时输出错误并以退出码 1 结束。

### 校验规则

格式：`<type>[(<scope>)][!]: <subject>`，校验正则（`packages/cli/src/commands/verify-commit.ts` 原文）：

```ts
/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|release)(\(.+\))?!?: .+/
```

| 规则 | 内容 | 反例（不通过） |
| --- | --- | --- |
| `type` | 仅接受 12 个：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`、`release`；区分大小写 | `Fix: wrong case`、`unknown(scope): message` |
| `scope` | `(` 与 `)` 之间至少 1 个任意字符（含空格、中文）；空 scope 无效 | `feat(): empty scope` |
| `!`（breaking change） | 可选，紧跟 type 或 `)` 之后 | — |
| 冒号分隔 | 冒号后必须先有 1 个空格再接 subject | `feat:a` |
| `subject` | 至少 1 个字符；只校验首行，正文行不受限制 | `feat:`、`: message` |
| 注释剥离（文件来源） | 只移除顶格（行首无空白）以 `#` 开头的整行，随后 `trim()`；行内 `#` 不移除 | 纯注释文件剥离后为空串，不通过 |

多行消息示例（`-m $'feat: subject\n\nbody paragraph'`）：首行匹配即通过，正文不校验。

### 退出码与输出

| 退出码 | 触发条件 | 输出（流与原文） |
| --- | --- | --- |
| `0` | 校验通过 | stdout：`✅ 提交验证通过` |
| `1` | 格式不匹配 | stderr：`❌ 提交验证失败: 提交信息格式错误。请使用 feat\|fix\|docs\|style\|refactor\|perf\|test\|build\|ci\|chore\|revert 等前缀。` |
| `1` | 文件读取失败（`--message` 未提供且 `file` 或 `.git/COMMIT_EDITMSG` 打不开） | stderr 两行：`无法读取文件: <path>` 与 Node 错误原文（如 `ENOENT: no such file or directory, open '<path>'`） |
| `1` | 未知命令 | stderr：`error: unknown command '<name>'` |
| `1` | 选项缺值 | stderr：`error: option '-m, --message <msg>' argument missing` |

### commit-msg hook 示例

`.husky/commit-msg` 或 `.git/hooks/commit-msg`（记得 `chmod +x`）：

```bash
#!/bin/sh
# 校验失败时退出码 1，git 中止本次提交
cat-cli verify-commit "$1"
```

未把 `@cat-kit/cli` 装进当前仓库依赖时，hook 内改用 npx 形式：

```bash
#!/bin/sh
npx --package @cat-kit/cli cat-cli verify-commit "$1"
```

### 编程接口（深路径导入）

仅 `@cat-kit/cli/commands/verify-commit` 可导入，两个函数均为同步、纯函数、不抛错：

```ts
import { stripComments, verifyCommitMessage } from '@cat-kit/cli/commands/verify-commit'

verifyCommitMessage('feat: ok')
// => { valid: true }
verifyCommitMessage('bad message')
// => { valid: false, reason: '提交信息格式错误。请使用 feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert 等前缀。' }
stripComments('feat: a\n# note line')
// => 'feat: a'
```

签名与校验命令共用同一套规则；`reason` 即上表退出码 1 的失败文案。
