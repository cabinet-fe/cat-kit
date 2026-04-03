# 优化 agent-context 命令行输出文案

> 状态: 已执行

## 目标

调整 `packages/agent-context/src/commands` 中面向用户的终端输出，去掉明显的模板化表达和 emoji 滥用，在保留状态提示能力的前提下，让文案更自然、更像常规 CLI 工具。

## 内容

### 1. 梳理输出点

- 扫描 `packages/agent-context/src/commands` 下所有 `console.log` / `console.error` / `console.warn` 输出。
- 标记存在以下问题的文案：emoji 过多、语气浮夸、重复强调“检查通过/失败”、表达像 AI 模板而不是 CLI 提示。

### 2. 统一文案风格

- 为成功、失败、警告、信息类输出建立统一但克制的表达方式。
- 仅保留确有必要的状态标记；默认使用纯文本，避免在同一命令中连续出现多个 emoji。
- 保持已有信息结构不变，重点调整标题、状态词和结果摘要，不改命令的业务行为。

### 3. 修改命令实现

- 更新 `packages/agent-context/src/commands` 中相关命令文件的输出字符串。
- 对列表、摘要、取消操作、空状态等场景分别采用简洁直述的文案，避免“AI 味”或过度装饰。

### 4. 验证

- 运行若干代表性命令，检查输出是否仍然清晰且无明显回归。
- 确认计划状态、影响范围记录完整。

## 影响范围

- 修改文件: `packages/agent-context/src/commands/done.ts`
- 修改文件: `packages/agent-context/src/commands/index-cmd.ts`
- 修改文件: `packages/agent-context/src/commands/init.ts`
- 修改文件: `packages/agent-context/src/commands/install.ts`
- 修改文件: `packages/agent-context/src/commands/prompt-gen.ts`
- 修改文件: `packages/agent-context/src/commands/status.ts`
- 修改文件: `packages/agent-context/src/commands/sync.ts`
- 修改文件: `packages/agent-context/src/commands/upgrade.ts`
- 修改文件: `packages/agent-context/src/commands/validate.ts`

## 历史补丁
