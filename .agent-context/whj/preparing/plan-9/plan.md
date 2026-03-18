# 更新 Skill 协议与文档适配 SCOPE 机制

> 状态: 未执行

## 目标

将所有 Skill 协议源码和用户面向的文档更新为 SCOPE 隔离后的目录结构，确保 AI 助手读取到的协议与实际运行时行为一致。

## 内容

### 1. 更新 Skill 主文档 (`src/content/index.ts`)

- 目录结构示例改为 SCOPE 嵌套格式：
  ```
  .agent-context/
  ├── .env
  ├── .gitignore
  ├── {SCOPE}/
  │   ├── plan-{N}/
  │   ├── preparing/
  │   │   └── plan-{N}/
  │   └── done/
  │       └── plan-{N}-{YYYYMMDD}/
  ```
- 新增全局约束：首次使用前需运行 `agent-context init`（或自动初始化）
- 新增说明：SCOPE 由 git username 决定，编号在 SCOPE 内独立

### 2. 更新动作协议 (`src/content/actions.ts`)

- `init` 协议：新增步骤——检查 `.env` 是否存在，不存在则运行 `agent-context init`
- `plan` 协议：编号规则更新为 scope 内扫描 `max(N)+1`
- `replan` / `implement` / `patch` / `rush` 协议：路径引用改为 `{SCOPE}/plan-{N}` 格式
- 所有协议的前置检查新增：SCOPE 未初始化 → 提示运行 `agent-context init`

### 3. 更新 README.md (`packages/agent-context/README.md`)

- 使用说明中新增 `init` 命令
- 目录结构示例更新
- 新增多人协作说明

### 4. 同步已安装 Skill 文件

- 运行 `agent-context sync` 将更新后的协议同步到所有已安装的 Skill 目标

### 5. 验证

- 运行 `agent-context validate` 确保工具自身能正确识别新结构
- 检查生成的 Skill 文件内容是否正确反映 SCOPE 结构

## 影响范围

- `packages/agent-context/src/content/index.ts`
- `packages/agent-context/src/content/actions.ts`
- `packages/agent-context/README.md`

## 历史补丁
