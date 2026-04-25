# 修复交互式提问工具在多代理下的触发率

## 补丁内容

针对"很多代理（Cursor、Cline、Roo 等）无法触发交互式提问工具，频繁回退到纯文本独白"的实际问题修复 `ask-user-question.md` 与 SKILL.md 路由段。

### 根因

1. **穷举名字 + 字面匹配**：`ask-user-question.md` 列出的"常见名称"（`AskUserQuestion` / `request_user_input` / `RequestUserInput` / `Question` / `askQuestions` / `question`）不完整，漏掉 Cursor `AskQuestion`、Cline/Roo `ask_followup_question` 等主流 host 的工具名；代理按字面匹配失败后走"无提问工具"分支回退纯文本。
2. **"优先使用"软约束**：SKILL.md 和 `ask-user-question.md` 都用"优先"措辞，代理容易自我合理化跳过。
3. **缺发现规则**：没告诉代理按**语义**扫自己工具清单，只要名字不眼熟就放弃识别。

### 修复

- **`packages/agent-context/src/skill/references/ask-user-question.md`**：新增 `## 工具识别（首次提问前必做）` 小节；给出 4 步语义扫描规则（扫工具清单 → 语义命中 → 必须调用 → 真无匹配才回退）；关键字扩展为 `ask / question / input / prompt / choice / select / multiple_choice / followup / clarify / user`；已知工具名示例补齐 `AskQuestion` / `ask_followup_question` / `prompt_user` 并明确"不穷举"；加"不确定是否命中时倾向调用"；把"优先使用"硬化为"必须调用"。
- **`packages/agent-context/src/skill/render.ts`**：SKILL.md 路由段的单段说明改为"协议里出现'通过交互式提问工具...'时一律按 `references/ask-user-question.md` 执行：首次提问前先读该文件，按'工具识别'步骤按语义在自己可调用的工具清单中定位，命中必须调用，真正无匹配才回退"。措辞强制化、引导语义识别，但**不写具体工具名**（保持 host-agnostic，符合测试约束 `skillMd.not.toContain('request_user_input'|'AskUserQuestion')`）。
- **Canonical skill 副本**：`.agents/skills/ac-workflow/SKILL.md` 与 `.agents/skills/ac-workflow/references/ask-user-question.md` 同步。
- **文档**：`docs/content/packages/agent-context/index.md` 把"常见问题 > 交互式提问工具不可用"改名为"交互式提问工具识别"，补齐 Cursor / Cline / Roo 工具名表格；`docs/content/packages/agent-context/cli.md` 同步更新 `ask-user-question.md` 说明。
- **测试**：`packages/agent-context/test/render-skill.test.ts` 新增两个用例固化新规则防回退——SKILL.md 必须含"工具识别"/"必须调用"/"followup"/"禁止伪造工具调用"且不得出现旧的"优先使用...交互式提问工具"措辞；`ask-user-question.md` 必须含 `## 工具识别`、`AskQuestion`、`ask_followup_question`、`必须调用该工具`、`不确定是否命中时倾向调用`、`followup`、`clarify`。

## 验证

- `cd packages/agent-context && bun run typecheck`：无错误。
- `cd packages/agent-context && bun run test`：12/12 通过（原 10 + 新增 2）。
- `cd packages/agent-context && bun run build`：34 files / 77.36 kB，完成 357ms。

## 影响范围

- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/references/ask-user-question.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/render.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/render-skill.test.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/ask-user-question.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/index.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/cli.md`
- 新增文件: `/Users/whj/Codes/cat-kit/.changeset/firm-trigger-ask-tool.md`
