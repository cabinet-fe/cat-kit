# agent-context 支持 CLAUDE.md 及新增 review 协议

> 状态: 已执行

## 目标

为 agent-context 包实现两个功能：
1. init 协议根据工具类型动态使用 `AGENTS.md` 或 `CLAUDE.md`（Claude Code 环境使用 `CLAUDE.md`）
2. 新增 review 协议，支持对计划和代码变更进行独立的第三方审查

## 内容

### 第一部分：支持 CLAUDE.md

**步骤 1**：为 `ToolTarget` 类型新增 `guideFileName` 字段
- 修改 `src/types.ts`，在 `ToolTarget` 接口中添加 `guideFileName: string`
- 该字段表示项目指导文件名称（`AGENTS.md` 或 `CLAUDE.md`）

**步骤 2**：在工具配置中设置 `guideFileName`
- 修改 `src/tools.ts`，为 `TOOL_TARGET_MAP` 中每个工具设置 `guideFileName`
- `claude` 工具设为 `'CLAUDE.md'`，其余所有工具设为 `'AGENTS.md'`

**步骤 3**：将 action 渲染器签名改为接受 `ToolTarget` 参数
- 修改 `src/content/actions/index.ts`，将 `ACTION_RENDERERS` 类型从 `Record<ActionName, () => string>` 改为 `Record<ActionName, (target: ToolTarget) => string>`
- 所有现有渲染器函数签名添加 `target: ToolTarget` 参数（不使用的渲染器忽略该参数即可）

**步骤 4**：修改 `renderInit()` 使用动态文件名
- 修改 `src/content/actions/init.ts`，接收 `ToolTarget` 参数
- 将所有硬编码的 `AGENTS.md` 替换为 `target.guideFileName`（使用模板字符串变量）
- 质量标准部分也相应替换

**步骤 5**：更新 `renderSkillArtifacts()` 传递 `target`
- 修改 `src/content/index.ts` 中的 `renderSkillArtifacts()`，调用 action 渲染器时传入 `target` 参数
- Navigator 中引用 `AGENTS` 的意图匹配表描述也可考虑动态化（用 `target.guideFileName` 替换 "补全 AGENTS"）

### 第二部分：新增 review 协议

**步骤 6**：创建 review 协议渲染器
- 新建 `src/content/actions/review.ts`，导出 `renderReview(target: ToolTarget): string`
- 协议内容设计要点：
  - **标题**：`# review` — 对当前计划进行独立审查
  - **不接受额外描述**
  - **前置检查**：
    - 运行 `agent-context validate`
    - 当前计划不存在 → 提示无可审查内容，终止
    - 存在多个当前计划 → 按常规流程处理
  - **执行步骤**：
    1. 读取当前计划的 `plan.md` 和所有 `patch-*.md`，确认状态（未执行/已执行）
    2. 读取项目指导文件（`{target.guideFileName}`）
    3. **按状态分支**：
       - **IF 未执行**（计划审查）：
         - 使用**独立子代理**（Agent 工具）进行审查，防止上下文共享导致审查失效
         - 子代理 prompt 包含：计划全文、项目指导文件全文、审查清单
         - 审查清单：目标是否明确可衡量、步骤是否完整无遗漏无冗余、步骤间依赖关系是否合理、技术方案是否符合项目指导文件的约束、影响范围预估是否合理、是否存在潜在风险或遗漏边界情况
       - **ELSE IF 已执行**（代码审查）：
         - 读取 `## 影响范围` 获取变更文件列表
         - 使用 `git diff` 获取这些文件的具体变更内容
         - 使用**独立子代理**（Agent 工具）进行审查
         - 子代理 prompt 包含：计划全文（含补丁）、项目指导文件全文、变更文件 diff、审查清单
         - 审查清单：实现是否完整覆盖计划所有步骤、代码质量是否符合项目指导文件中的规范（命名、风格、约束）、是否引入不必要的副作用或破坏性变更、是否遗漏测试或文档更新、是否存在安全隐患或性能问题、是否存在过度设计或实现不足
    4. **汇总审查结果**：将子代理返回的审查意见整理呈现给用户
    5. **提供行动选项**：通过 AskUserQuestion 提供选项：
       - 未执行计划：1) 按审查意见修订计划（走 replan）（推荐） 2) 忽略审查意见继续执行 3) 终止操作
       - 已执行计划：1) 按审查意见创建补丁修复（走 patch）（推荐） 2) 忽略审查意见 3) 终止操作
  - **子代理隔离要求**：
    - 明确要求使用 Agent 工具启动子代理
    - 子代理 prompt 必须包含完整上下文（计划、指导文件、diff），不依赖对话历史
    - 子代理以**独立第三方审查员**身份执行，审查视角独立于原始实施者
    - 子代理返回结构化审查报告：问题列表（严重程度 + 描述 + 建议修复方式）

**步骤 7**：注册 review 到 action 系统
- 修改 `src/content/actions/index.ts`：
  - 导入 `renderReview`
  - 在 `ACTION_NAMES` 中添加 `'review'`
  - 在 `ACTION_RENDERERS` 中添加 `review: renderReview`

**步骤 8**：更新 Navigator 意图匹配表
- 修改 `src/content/index.ts` 的 `renderNavigator()` 函数：
  - 在意图匹配表中添加 review 行：`| 审查当前计划或实施结果 | review | \`actions/review.md\` |`
  - 将 "补全 AGENTS" 描述改为动态引用 `guideFileName`

**步骤 9**：验证构建和测试
- 运行 `cd packages/tests && bun vitest` 确保无测试失败
- 运行 `bunx oxlint .` 检查 lint
- 运行 `bunx oxfmt --check .` 检查格式

## 影响范围

- `packages/agent-context/src/types.ts` — ToolTarget 接口新增 guideFileName 字段
- `packages/agent-context/src/tools.ts` — TOOL_TARGET_MAP 中所有工具配置添加 guideFileName
- `packages/agent-context/src/content/actions/index.ts` — ACTION_RENDERERS 类型改为接受 ToolTarget 参数，注册 review
- `packages/agent-context/src/content/actions/init.ts` — renderInit 接收 ToolTarget，AGENTS.md 替换为动态 guideFileName
- `packages/agent-context/src/content/actions/plan.ts` — renderPlan 签名添加 _target 参数
- `packages/agent-context/src/content/actions/replan.ts` — renderReplan 签名添加 _target 参数
- `packages/agent-context/src/content/actions/implement.ts` — renderImplement 签名添加 _target 参数
- `packages/agent-context/src/content/actions/patch.ts` — renderPatch 签名添加 _target 参数
- `packages/agent-context/src/content/actions/rush.ts` — renderRush 签名添加 _target 参数
- `packages/agent-context/src/content/actions/review.ts` — 新增 review 协议渲染器
- `packages/agent-context/src/content/index.ts` — renderSkillArtifacts 传递 target，Navigator 添加 review 行并动态化 guideFileName

## 历史补丁
