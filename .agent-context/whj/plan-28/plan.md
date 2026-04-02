# agent-context 协议渲染优化

> 状态: 已执行

## 目标

优化 `src/content/actions/` 下的 replan、implement、rush 三个协议渲染函数，精简冗余的前置检查并补全 review 追问流程。

## 内容

### 步骤 1：精简 replan 前置检查

文件：`packages/agent-context/src/content/actions/replan.ts`

移除三项冗余的前置检查条目：

1. **移除"存在多个当前计划"检查**（第 15 行）：`agent-context validate` 已保证单活跃计划，此检查永远不会触发。
2. **移除"目标计划编号不存在"检查**（第 16 行）：重构后 replan 不再支持指定目标计划（见步骤 2），此检查失去意义。
3. **移除"目标计划已执行"检查**（第 17 行）：已执行的计划不属于"未实施计划"，"无未实施计划"检查已覆盖此场景。

### 步骤 2：重构 replan 作用域与执行步骤

文件：`packages/agent-context/src/content/actions/replan.ts`

**作用域**改为固定覆盖所有未执行计划，不允许部分重规划：

- 作用域为所有未执行的计划：当前计划（若状态为 `未执行`）+ `preparing/` 中全部计划。
- 当前计划为 `已执行` → 不纳入重规划范围，仅重规划 `preparing/` 队列。
- 不支持部分重规划，所有未执行计划必须一起重新规划。

**执行步骤**第 1 步从"确定重规划目标范围"改为"确定重规划方向"，移除"无法确定用户期望重规划哪些计划"歧义项；第 2 步改为"读取所有未执行计划的 `plan.md`"。

### 步骤 3：implement 完成后追问 review

文件：`packages/agent-context/src/content/actions/implement.ts`

在现有步骤 5（记录范围）之后新增步骤 6：

```
6. **Review 询问**：通过 ${askToolName} 询问用户是否对实施结果进行审查。选项：1) 立即 review（推荐，review 由独立子代理执行，不影响当前上下文） 2) 跳过 review。若用户选择 review → 按 `review` 协议执行。
```

### 步骤 4：rush 完成后追问 review

文件：`packages/agent-context/src/content/actions/rush.ts`

在"阶段二：implement"部分末尾新增一条差异说明：

```
- 实施完成后，通过 ${askToolName} 询问用户是否对实施结果进行审查。选项：1) 立即 review（推荐） 2) 跳过 review。若用户选择 review → 按 `review` 协议执行。
```

## 影响范围

- `packages/agent-context/src/content/actions/replan.ts`
- `packages/agent-context/src/content/actions/implement.ts`
- `packages/agent-context/src/content/actions/rush.ts`

## 历史补丁
