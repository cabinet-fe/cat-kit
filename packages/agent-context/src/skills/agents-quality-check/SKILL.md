<!-- AGENT_CONTEXT:START -->

# agents-quality-check

## name

agents-quality-check

## purpose

检查 AGENTS.md 是否满足精简、结构清晰、可执行性要求。

## inputs

- AGENTS.md 内容
- 可选：项目目录结构快照

## steps

1. 检查是否前置常用命令与关键约束。
2. 检查目录结构、技术栈、代码风格信息是否明确。
3. 输出缺失项与精简建议。

## outputs

- AGENTS 质量报告
- 建议修改项列表

## constraints

- 建议必须可执行且避免空泛描述。
- 不引入与项目无关的模板化段落。
- 优先降低代理执行歧义。

<!-- AGENT_CONTEXT:END -->
