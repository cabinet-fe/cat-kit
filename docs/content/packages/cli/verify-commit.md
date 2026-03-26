---
title: 提交信息校验
description: '使用 cat-cli verify-commit 校验 Git 提交信息格式'
outline: deep
---

# 提交信息校验

## 介绍

`cat-cli verify-commit` 用于校验提交信息是否符合约定格式。命令支持三种输入方式：

- 通过 `--message` 直接传入提交信息
- 通过 `[file]` 读取提交信息文件
- 不传参数时从 `stdin` 读取

校验失败会以退出码 `1` 结束，适合接入 Git Hook 或 CI。

## 快速使用

```bash
# 方式 1：直接传入提交信息
cat-cli verify-commit --message "feat(cli): add verify command"

# 方式 2：读取提交信息文件
cat-cli verify-commit .git/COMMIT_EDITMSG

# 方式 3：从标准输入读取
echo "fix(core): handle edge case" | cat-cli verify-commit
```

可用于 `commit-msg` Hook：

```bash
cat-cli verify-commit "$1"
```

## API参考

### 命令签名

```bash
cat-cli verify-commit [file] [options]
```

| 参数/选项             | 类型     | 说明                           |
| --------------------- | -------- | ------------------------------ |
| `[file]`              | `string` | 包含提交信息的文件路径（可选） |
| `-m, --message <msg>` | `string` | 直接传入提交信息字符串         |

### 校验规则

提交信息需匹配以下格式（Conventional Commit）：

```txt
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .+
```

示例：

- `feat(cli): add verify command`
- `fix(core)!: drop legacy parser`
- `docs: update README`

### 内部实现（用于二次开发）

```typescript
function verifyCommitMessage(message: string): { valid: boolean; reason?: string }
```

```typescript
async function verifyCommitAction(
  file: string | undefined,
  options: { message?: string },
  _command: any
): Promise<void>
```
