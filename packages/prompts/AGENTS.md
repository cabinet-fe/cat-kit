# @cat-kit/prompts - AI 开发提示词管理工具

本文件为 `@cat-kit/prompts` 包提供详细的开发指导。

## 包概述

`@cat-kit/prompts` 是一个命令行工具，用于初始化和管理项目中的 AI 开发提示词。通过 `dp` 命令，开发者可以快速为项目配置代码风格指南、开发规范等提示词文件。

**包名称**：`@cat-kit/prompts`
**命令名称**：`dp`（dev-prompts）
**依赖关系**：无其他 workspace 依赖
**运行环境**：Node.js CLI 工具

## 目录结构

```
packages/prompts/
├── package.json
├── tsconfig.json
├── AGENTS.md
├── templates/                 # Markdown 模板文件（发布时包含）
│   ├── languages/
│   │   ├── typescript.md
│   │   ├── javascript.md
│   │   ├── python.md
│   │   ├── go.md
│   │   ├── java.md
│   │   └── rust.md
│   ├── weight-model.md
│   └── agents-block.md
└── src/
    ├── index.ts              # CLI 入口
    ├── commands/
    │   └── init.ts           # init 命令实现
    └── utils/
        ├── fs.ts             # 文件操作工具
        ├── questions.ts      # 交互式问询
        └── templates.ts      # 模板处理工具
```

## 设计理念

### 模板即文件

模板文件使用纯 Markdown 格式存储在 `templates/` 目录中，而非嵌入在 TypeScript 代码中。这样的设计有以下优点：

1. **易于编辑**：直接编辑 Markdown 文件，无需修改代码
2. **可预览**：模板文件可以在任何 Markdown 编辑器中预览
3. **简单复制**：init 命令只需复制文件，无需代码生成

### 路径引用

生成的 `AGENTS.md` 文件使用相对路径引用提示词文件：

```markdown
### 代码风格指南

- [TypeScript](dev-prompts/languages/typescript.md)
- [Python](dev-prompts/languages/python.md)

### 开发权重模型

- [开发权重模型](dev-prompts/weight-model.md)
```

AI 助手会根据需要按需读取对应的提示词文件。

## 命令说明

### `dp init`

初始化项目的开发提示词配置：

1. 检查 `dev-prompts/` 文件夹是否存在
2. 检查 `AGENTS.md` 文件是否存在
3. 检查 `AGENTS.md` 中是否包含 `dev-prompts` 引导块
4. 询问用户配置选项（语言选择、是否启用权重模型）
5. 复制对应的模板文件到项目中
6. 创建或更新 `AGENTS.md` 添加引导块

## 编码规范

> **📌 通用编码规范请参考根目录的 `AGENTS.md` 文件**

### Prompts 包特有规范

- **CLI 工具规范**：使用 Commander.js 管理命令
- **交互式问询**：使用 @inquirer/prompts 进行用户交互
- **文件复制**：模板文件直接复制，不使用代码生成

## 模板编写规范

### 模板文件位置

所有模板文件存放在 `templates/` 目录：

- `templates/languages/*.md` - 各语言代码风格指南
- `templates/weight-model.md` - 开发权重模型
- `templates/agents-block.md` - AGENTS.md 引导块模板（仅供参考）

### 模板内容要求

- **清晰的结构**：使用 Markdown 标题组织内容
- **实用的示例**：提供代码示例说明规范
- **可定制性**：考虑不同项目的需求差异

## 构建配置

此包作为 CLI 工具，需要：
1. 正确配置 `bin` 字段
2. 确保入口文件包含 shebang（`#!/usr/bin/env node`）
3. `files` 字段包含 `templates` 目录

## 常见任务

### 添加新的语言支持
→ 在 `templates/languages/` 下创建新的 `.md` 文件
→ 在 `src/utils/questions.ts` 中添加语言选项
→ 在 `src/utils/templates.ts` 中添加语言名称映射

### 修改提示词模板
→ 直接编辑 `templates/` 下的相应 `.md` 文件

### 添加新命令
→ 在 `src/commands/` 下创建新文件，并在 CLI 入口注册
