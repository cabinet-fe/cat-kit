# 子进程 API 规范

## MODIFIED Requirements

### Requirement: Git 命令执行

`execGit(cwd, args)` 函数 SHALL 使用 `execa` 的 `$` 模板字符串语法执行 git 命令。

函数 SHALL 以静默模式执行，返回命令标准输出，失败时抛出 `GitError`。

#### Scenario: 执行 git 命令成功

- **WHEN** 调用 `execGit(cwd, ['status'])`
- **THEN** 静默执行命令并返回 stdout（已 trim）

#### Scenario: 执行 git 命令失败

- **WHEN** 调用 `execGit(cwd, ['invalid-command'])`
- **THEN** 抛出 `GitError`，包含命令字符串和原始错误

---

### Requirement: NPM 发布执行

`publishPackage(options)` 函数 SHALL 使用 `execa` 的 `$` 模板字符串语法执行 npm publish 命令。

函数 SHALL 以实时输出模式（`stdio: 'inherit'`）执行，让用户看到发布进度。

#### Scenario: 发布包成功

- **WHEN** 调用 `publishPackage({ cwd, dryRun: true })`
- **THEN** 实时输出发布进度到控制台，返回 `PublishResult`

#### Scenario: 发布包失败

- **WHEN** 调用 `publishPackage({ cwd })` 且发布失败
- **THEN** 抛出 `PublishError`，包含命令字符串和原始错误

---

### Requirement: 使用 execa 模板字符串语法

所有子进程操作 SHALL 使用 `execa` 的 `$` 函数和模板字符串语法。

#### Scenario: 模板字符串调用

- **WHEN** 执行 git 或 npm 命令
- **THEN** 使用 `$({ options })\`command ${args}\`` 语法

---

### Requirement: 移除原生 child_process 依赖

`@cat-kit/maintenance` 包 SHALL 不再直接使用 `node:child_process` 模块。

#### Scenario: 无 child_process 导入

- **WHEN** 检查 `packages/maintenance/src/` 目录
- **THEN** 不存在 `import ... from 'node:child_process'` 语句
