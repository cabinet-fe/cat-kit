# 补丁 1：修复 rush.ts 命名不一致

## 原因

review 发现 `rush.ts` 中仍引用"需求澄清"，而 `plan.ts` 已重命名为"需求澄清与反向面试"，文本不一致。

## 变更

- `packages/agent-context/src/content/actions/rush.ts`：将「需求澄清」更新为「需求澄清与反向面试」
