# 完善 agent-context 文档，补全 action 说明与具体协作场景

> 状态: 已执行

## 目标

修正 `@cat-kit/agent-context` 的文档表达问题，让用户能够明确理解每个 action 的适用时机、前置状态、执行结果，以及在真实 AI 协作中的推荐用法。
同时重构文档站入口页，使其符合项目文档规范：`index.md` 只保留简介与导航，详细说明拆分到独立页面。

## 内容

### 步骤 1：梳理现有文档问题并确定新结构

- 阅读 `packages/agent-context/README.md` 与 `docs/content/packages/agent-context/index.md`
- 明确需要补强的两类信息：
  - action 逐项说明：何时使用、依赖什么状态、会产出什么
  - AI 协作场景：从宽泛口号改为可直接复用的任务流与提示词
- 确定文档重构方案：
  - README 保留完整说明
  - 文档站 `index.md` 仅做介绍与导航
  - 新增独立页面承载 action、协作方式与 CLI 参考

### 步骤 2：重写 README

- 明确区分“CLI 命令”和“安装后的 Skill 动作”
- 补充完整生命周期与 action 对照表
- 为 `init`、`plan`、`replan`、`implement`、`patch`、`rush`、`done` 分别提供详细解释
- 增加具体协作场景，给出推荐的自然语言指令示例
- 校正文案，避免把真实 CLI 能力与 Skill 协议混写

### 步骤 3：重构文档站页面

- 将 `docs/content/packages/agent-context/index.md` 改为简洁入口页
- 新增 action 说明页
- 新增 AI 协作场景页
- 新增 CLI 命令页
- 保持页面结构、标题层级与文档规范一致

### 步骤 4：验证结果

- 自检 README 与文档站内容是否与 `packages/agent-context/src/content/actions.ts`、CLI 实现保持一致
- 运行文档构建，确认新增页面可被正常解析

## 影响范围

- `packages/agent-context/README.md`
- `docs/content/packages/agent-context/index.md`
- `docs/content/packages/agent-context/actions.md`
- `docs/content/packages/agent-context/collaboration.md`
- `docs/content/packages/agent-context/cli.md`

## 历史补丁

- patch-1: 为 agent-context 文档首页增加生命周期 Mermaid 图
- patch-2: 优化 agent-context 文档首页生命周期图的纵向布局
