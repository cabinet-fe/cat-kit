# 增强需求澄清的"反向面试"能力

> 状态: 已执行

## 目标

将 agent-context 协议生成源码中的需求信息收集策略从被动枚举式改为主动探索式"反向面试"——代理在收集基本信息后主动分析需求盲区，构造针对性探测问题，帮助用户发现未考虑到的情况和逻辑漏洞。同时完善全局提问规范，使其成为可执行的方法论指导而非空泛的原则。

## 内容

### 步骤 1：完善 `renderAskQuestionGuidelines` (packages/agent-context/src/content/index.ts)

在现有基础规范之上增加反向面试方法论章节：

- **方法论定义**：代理在理解用户需求后，必须主动分析用户陈述中的盲区，构造探测性问题帮助用户发现遗漏
- **探测策略分类**：假设挑战（隐含假设是否成立）、边界探测（边界/异常场景）、遗漏发现（关键决策点缺失）、矛盾检测（需求间或需求与现有系统间的冲突）、风险预警（技术/依赖/性能风险）
- **节奏控制**：每轮聚焦 2-3 个最关键问题；连续追问无新发现即终止；设定最大追问轮次
- **质量要求**：问题必须基于用户的具体描述构造，禁止使用泛化检查清单；追问时应说明为何这个问题重要
- 保留现有的基础规范条目（通俗易懂、推荐项标注等）

完成标准：生成的 SKILL.md 中 AskQuestion 规范包含完整的反向面试指导，代理可据此执行主动探测。

### 步骤 2：改进 `renderInit` (packages/agent-context/src/content/actions/init.ts)

在新项目信息收集步骤（步骤 2.1）之后、生成 guide 之前，增加反向面试环节：

- 代理分析已收集的全部信息，从假设挑战、边界探测、遗漏发现等角度审视用户回答
- 针对具体上下文构造 2-3 个探测性问题（如：用户提到的技术选型与项目规模是否匹配、是否有未提及的非功能性约束等）
- 此环节作为结构化收集的**补充而非替代**，保留现有分类收集步骤

完成标准：init 协议在信息收集后包含明确的反向面试步骤，且注明问题必须基于上下文构造。

### 步骤 3：改进 `renderPlan` (packages/agent-context/src/content/actions/plan.ts)

增强步骤 1"需求澄清"，从纯条件触发改为"条件检查 + 主动分析"双层结构：

- 保留现有 4 个歧义条件作为最低触发标准
- 新增：即使 4 个条件均不满足，仍需对需求描述执行反向面试——分析隐含假设、未覆盖的边界情况和潜在风险
- 若反向面试未发现显著问题可跳过提问，直接进入步骤 2

完成标准：plan 协议的需求澄清步骤包含主动分析环节，且明确允许在无发现时跳过。

### 步骤 4：改进 `renderReplan` (packages/agent-context/src/content/actions/replan.ts)

在重规划方向确认（步骤 1）后增加反向面试环节：

- 分析原计划需要调整的根本原因
- 评估新方案是否解决了根因、是否引入了原计划不存在的新风险
- 若分析后无显著问题可跳过

完成标准：replan 协议在方向确认后包含反向面试步骤。

## 影响范围

- `packages/agent-context/src/content/index.ts` — 重写 `renderAskQuestionGuidelines`，增加反向面试方法论
- `packages/agent-context/src/content/actions/init.ts` — 新项目信息收集后增加反向面试步骤（步骤 4）
- `packages/agent-context/src/content/actions/plan.ts` — 需求澄清从条件触发改为"条件检查 + 反向面试"双层结构
- `packages/agent-context/src/content/actions/replan.ts` — 方向确认后增加反向面试步骤（步骤 2）
- `packages/agent-context/src/content/actions/rush.ts` — 更新对 plan 步骤的引用名称

## 历史补丁

- patch-1：修复 rush.ts 中「需求澄清」→「需求澄清与反向面试」命名不一致
