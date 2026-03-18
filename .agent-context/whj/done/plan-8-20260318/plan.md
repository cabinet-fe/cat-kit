# 基于 SCOPE 的计划目录隔离

> 状态: 已执行

## 目标

1. 新增 `.agent-context/.env` 环境文件，通过 `SCOPE` 配置区分不同协作者
2. SCOPE 值从 `git config user.name` 自动获取并规范化为合法目录名
3. 所有计划目录嵌套在 `{SCOPE}/` 目录下，实现多人协作时的计划隔离
4. 保留现有 `plan-{N}` 命名与递增编号约定，编号在各 SCOPE 内独立

## 内容

### 1. 新增 SCOPE 解析模块 (`src/context/scope.ts`)

- `resolveScope(acRoot: string): Promise<string>`
  - 读取 `{acRoot}/.env`，解析 `SCOPE=xxx`
  - `.env` 不存在时自动调用 `initScope` 尝试初始化
  - 初始化失败（git 未配置 user.name）→ 抛出错误并提示
- `initScope(acRoot: string): Promise<string>`
  - 执行 `git config user.name` 获取用户名
  - 未配置 → 抛出明确错误：`"未找到 git user.name，请先运行 git config user.name <name>"`
  - 规范化：小写、非字母数字替换为连字符、去首尾连字符、压缩连续连字符
  - 写入 `{acRoot}/.env`（内容：`SCOPE=xxx`）
  - 确保 `{acRoot}/.gitignore` 包含 `.env` 行
  - 创建 `{acRoot}/{scope}/` 目录（如不存在）
  - 返回 scope 字符串

### 2. 更新类型定义 (`src/types.ts`)

- `ContextSnapshot` 新增 `scope: string` 字段
- `root` 语义变更：从 `.agent-context/` 指向 `.agent-context/{scope}/`（即 scope 目录）
- 所有依赖 `root` 的逻辑（reader/validator/archiver）无需改路径拼接

### 3. 更新读取器 (`src/context/reader.ts`)

- 导入 `resolveScope`
- `readRawContext(cwd)` 修改：
  - `acRoot = join(cwd, '.agent-context')`
  - `scope = await resolveScope(acRoot)`
  - `root = join(acRoot, scope)` ← 关键变更
  - 其余逻辑不变：`readPlanDirs(root)`、`readPlanDirs(join(root, 'preparing'))`、`readDonePlans(join(root, 'done'))`
  - snapshot 新增 `scope` 字段
- `readPlanDirs`、`readDonePlans`、`readPlanStatus` 无需改动

### 4. 更新校验器 (`src/context/validator.ts`)

- `validate` 函数签名不变
- 校验规则不变（编号连续性、唯一性、状态检查均在 scope 内）
- 错误信息中可选追加 scope 标识

### 5. 更新归档器 (`src/context/archiver.ts`)

- 无需修改路径逻辑：`archive` 使用 `context.root`（已指向 scope 目录）
- 归档路径：`{scope}/done/plan-{N}-{YYYYMMDD}/`（自动正确）
- 晋升路径：`{scope}/plan-{N}/`（自动正确）

### 6. 新增 CLI 命令 `init` (`src/commands/init.ts`)

- 接收可选参数 `--scope <name>` 允许手动指定（跳过 git 查询）
- 无参数时自动从 git config 获取
- 流程：创建 `.agent-context/` → 调用 `initScope` → 打印结果
- 如 `.env` 已存在，显示当前 SCOPE 并提示是否覆盖

### 7. 更新现有 CLI 命令

- `cli.ts`：注册 `init` 子命令
- `validate.ts`：输出中增加 scope 信息（如 `当前作用域: whj`）
- `status.ts`：输出中增加 scope 信息
- `done.ts`：无需修改（通过 snapshot.root 自动定位 scope 目录）

### 8. 更新包 AGENTS.md

- 同步目录结构（新增 `scope.ts`、`commands/init.ts`）

### 9. 验证

- `tsc --noEmit` 确保类型正确
- 手动测试 `init`、`validate`、`status`、`done` 命令

## 影响范围

- `packages/agent-context/src/context/scope.ts`（新增）
- `packages/agent-context/src/context/reader.ts`
- `packages/agent-context/src/context/index.ts`
- `packages/agent-context/src/types.ts`
- `packages/agent-context/src/commands/init.ts`（新增）
- `packages/agent-context/src/commands/validate.ts`
- `packages/agent-context/src/commands/status.ts`
- `packages/agent-context/src/cli.ts`
- `packages/agent-context/AGENTS.md`
- `packages/agent-context/src/content/index.ts`
- `packages/agent-context/src/content/actions.ts`

## 历史补丁

- patch-1: Skill 内容适配 SCOPE 目录结构
