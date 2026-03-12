# 新建 @cat-kit/cli 包并实现可测试的 verify-commit 子命令

> 状态: 未执行

## 目标

新建 `@cat-kit/cli` 包，提供 `cat-cli` 命令。实现 `verify-commit` 子命令，校验 git 提交信息。
**核心原则**：分离校验逻辑与 CLI 交互逻辑，确保校验规则可通过单元测试完全覆盖，而不依赖文件系统或 Stdin。

## 内容

### 步骤 1：创建包基础结构

创建 `packages/cli/` 目录及基础配置文件：

- `packages/cli/package.json`
  - name: `@cat-kit/cli`
  - bin: `{ "cat-cli": "./dist/cli.js" }`
  - type: `module`
  - dependencies: `commander`
  - devDependencies: `@cat-kit/tsconfig: workspace:*`
  - files: `["dist"]`

- `packages/cli/tsconfig.json`
  - 继承 `@cat-kit/tsconfig/tsconfig.node.json`
  - rootDir: `./src`, outDir: `./dist`

### 步骤 2：实现核心校验逻辑 (Test Friendly)

创建 `packages/cli/src/commands/verify-commit.ts`：

- 实现 `verifyCommitMessage(message: string): { valid: boolean; reason?: string }`
- 包含正则校验规则：`^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .+`
- 这是一个纯函数，不涉及 `process.exit` 或 `console.log`。

### 步骤 3：实现 CLI 命令适配器

创建 `packages/cli/src/commands/verify-commit.ts`：

- 使用 `commander` 定义子命令。
- 处理输入优先级：
  1. 位置参数 (文件路径) -> 读取文件内容。
  2. `--message` 选项 -> 直接使用字符串。
  3. Stdin -> 异步读取。
- 调用 `verifyCommitMessage` 获取结果。
- 根据结果输出状态并执行 `process.exit(0/1)`。

### 步骤 4：实现 CLI 入口

创建 `packages/cli/src/cli.ts`：

- Shebang: `#!/usr/bin/env node`
- 注册 `verify-commit` 命令。
- 处理全局错误捕获。

### 步骤 5：集成到 Monorepo

- 在根 `tsconfig.json` 的 `references` 中添加新包。
- 在 `release/build.ts` 中添加构建配置。

### 步骤 6：编写并运行单元测试

在 `packages/tests/cli/verify-commit.test.ts` 中：

- 针对 `verifyCommitMessage` 函数编写多组测试用例（合法/非法）。
- 运行测试：`cd packages/tests && bun vitest cli/verify-commit.test.ts`。

## 影响范围

- 新增 `packages/cli`
- 修改根 `tsconfig.json`
- 修改 `release/build.ts`

## 历史补丁
