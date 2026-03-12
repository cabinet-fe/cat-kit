# @cat-kit/agent-context - 代理上下文管理工具

CLI 工具，用于管理 `.agent-context/` 目录下的计划生命周期（创建 → 执行 → 归档）。

**CLI 命令**：`agent-context`（通过 `bin` 字段注册）
**依赖**：`commander`、`@inquirer/prompts`
**构建**：`tsc -p tsconfig.json`

## 目录结构

```
packages/agent-context/src/
├── commands/          # CLI 子命令
│   ├── done.ts        # 归档计划
│   ├── install.ts     # 安装/初始化
│   ├── printer.ts     # 输出格式化
│   ├── status.ts      # 查看状态
│   ├── sync.ts        # 同步计划
│   └── validate.ts    # 验证计划
├── content/           # 内容处理
│   ├── actions.ts     # 动作定义
│   └── index.ts
├── context/           # 上下文管理
│   ├── archiver.ts    # 计划归档
│   ├── reader.ts      # 计划读取
│   ├── validator.ts   # 计划验证
│   └── index.ts
├── cli.ts             # CLI 入口
├── runner.ts          # 命令执行器
├── tools.ts           # 工具函数
└── types.ts           # 类型定义
```

**当 `agent-context/src` 中添加文件、文件意义变更时同步上面的目录结构！**
