---
'@cat-kit/agent-context': patch
---

Fix ac-workflow interactive question tool trigger rate: replace the hard-coded tool-name list in `references/ask-user-question.md` with a semantic discovery rule (scan the agent's own tool list for names/descriptions containing `ask` / `question` / `choice` / `select` / `prompt` / `input` / `followup` / `clarify`), require the agent to call any matched tool (no more "prefer"), extend the known-name examples to cover Cursor `AskQuestion` and Cline/Roo `ask_followup_question`, and tighten the SKILL.md routing paragraph with mandatory wording while keeping it host-agnostic.
