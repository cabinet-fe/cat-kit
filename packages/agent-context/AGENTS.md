# @cat-kit/agent-context - 代理上下文管理工具

CLI 工具，用于管理 `.agent-context/` 目录下的计划生命周期（创建 → 执行 → 归档）。

**CLI 命令**：`agent-context`（通过 `bin` 字段注册）
**依赖**：`commander`、`@inquirer/prompts`
**构建**：`tsc -p tsconfig.json`

## 目录结构

```
packages/agent-context/src/
├── commands/          # CLI 子命令
│   ├── context.ts     # 输出状态快照 JSON + 内置校验（Skill 启动步骤 CLI 等价物）
│   ├── done.ts        # 归档已执行计划
│   ├── index.ts       # 生成或更新计划索引
│   ├── init.ts        # 初始化 SCOPE
│   ├── install.ts     # 安装 canonical Skill 及兼容入口
│   ├── prompt-gen.ts  # 生成各 AI 工具全局提示词
│   ├── skill-eval.ts  # 评估 Skill description 触发样例
│   ├── status.ts      # 查看当前状态
│   ├── sync.ts        # 同步 Skill 并刷新兼容入口
│   ├── upgrade.ts     # 升级 CLI 版本
│   └── validate.ts    # 校验 .agent-context 目录结构
├── skill/             # Skill 渲染与安装
│   ├── protocols/     # 各协议 renderer（plan/implement/patch/rush/...）
│   ├── references/    # 共享 md 源文件（_principles.md、ask-user-question.md）
│   ├── scripts/       # bundled 运行时脚本（get-context-info.js、validate-context.js）
│   ├── render.ts      # renderSkillArtifacts() 入口
│   ├── installer.ts   # canonical source + 兼容入口写入逻辑
│   ├── targets.ts     # 兼容入口 target 映射
│   └── version.ts
├── workspace/         # .agent-context 目录读写与校验
│   ├── archive.ts     # 计划归档
│   ├── index-file.ts  # 计划索引生成
│   ├── reader.ts      # 原始上下文读取
│   ├── scope.ts       # SCOPE 解析与初始化
│   ├── validate.ts    # 计划 / 目录结构校验
│   └── index.ts
├── cli.ts             # CLI 入口（commander 绑定）
├── constants.ts       # 共享常量（AC_ROOT_DIR 等）
└── types.ts           # 类型定义
```

**当 `agent-context/src` 中添加文件、文件意义变更时同步上面的目录结构！**
