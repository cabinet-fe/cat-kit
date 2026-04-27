# cat-kit 统一技能 — 架构设计与入口点

> 状态: 已执行

## 目标

将当前分散的 9 个技能（1 个路由 + 8 个包技能）收敛为单一的 `skills/cat-kit/` 技能，采用文档驱动、渐进式披露的架构，让 AI 代理能够自行按需索引并精确获取 API 使用方法。本计划完成架构设计、入口点编写、脚本改造和目录骨架搭建，后续计划分批填充各包的内容文档。

## 内容

### 1. 设计新技能目录结构

建立 `skills/cat-kit/` 目录，结构如下：

```
skills/cat-kit/
├── SKILL.md                    # 入口点：包索引表 + 安装 + 渐进式披露使用指南
├── generated/                  # 由 sync 脚本自动生成的类型声明（仅供类型查证）
│   ├── core/
│   ├── http/
│   ├── fe/
│   ├── be/
│   ├── agent-context/
│   ├── cli/
│   ├── tsconfig/
│   └── vitepress-theme/
└── packages/
    ├── core/
    │   ├── index.md            # 包概览 + 分类索引
    │   ├── data.md             # 数组/对象/集合操作
    │   ├── date.md             # 日期/时间工具
    │   ├── pattern.md          # 设计模式相关
    │   ├── optimize.md         # 性能优化工具
    │   ├── data-structure.md   # 数据结构（Tree、LRU 等）
    │   ├── env.md              # 环境检测
    │   └── examples.md         # 精选示例
    ├── http/
    │   ├── index.md
    │   ├── client.md           # HTTPClient 核心 API
    │   ├── plugins.md          # 插件体系（auth、retry、transform）
    │   └── examples.md
    ├── fe/
    │   ├── index.md
    │   ├── virtualizer.md      # Virtualizer API 速查与最佳实践
    │   ├── file.md             # 文件读取/分块
    │   ├── storage.md          # 客户端存储
    │   ├── web-api.md          # Web API 封装（clipboard 等）
    │   └── examples.md
    ├── be/
    │   ├── index.md
    │   ├── fs.md               # 文件系统操作
    │   ├── logger.md           # 日志系统
    │   ├── cache.md            # 缓存（LRU、TTL 等）
    │   ├── config.md           # 配置管理
    │   ├── net.md              # 网络工具
    │   ├── system.md           # 系统信息
    │   ├── scheduler.md        # 调度器
    │   └── examples.md
    ├── cli/
    │   ├── index.md
    │   └── examples.md
    ├── agent-context/
    │   ├── index.md
    │   └── examples.md
    ├── tsconfig/
    │   ├── index.md
    │   └── examples.md
    └── vitepress-theme/
        ├── index.md
        └── examples.md
```

**设计原则**：
- SKILL.md 作为唯一入口，最多 60 行，提供包索引表 + 渐进式阅读路径说明
- `packages/<pkg>/index.md` 作为二级入口，列出该包的所有导出分类和文档链接
- `packages/<pkg>/<topic>.md` 为具体 API 文档，格式见步骤 3
- `generated/` 只放自动生成的 `.d.ts` 类型声明，不作为主要阅读路径
- 不再需要 `references/` 中间层，包索引直接链接到具体文档

### 2. 编写 `skills/cat-kit/SKILL.md` 入口点

内容要求：
- YAML 元数据：`name: cat-kit`，`description: CatKit 工具包全集——渐进式 API 文档，覆盖所有 @cat-kit/* 包`
- H1 标题：`# cat-kit`
- 简短说明（1 句）：面向已安装 `@cat-kit/*` npm 包的真实项目
- 安装列表（每个包一行 `npm add`）
- 包索引表：npm 包名 → 文档入口路径
- 渐进式阅读指南：告诉 AI 代理如何按需索引
  - 先读本文件找到对应包
  - 打开 `packages/<pkg>/index.md` 了解分类
  - 按需打开 `<topic>.md` 获取精确 API 说明
  - 需要精确类型签名时查阅 `generated/<pkg>/`
- 引用 `generated/` 类型（标记为自动生成，仅供类型查证）
- 维护者信息：sync 脚本命令

格式参考：当前 `skills/use-cat-kit/SKILL.md` 和 `skills/cat-kit-core/SKILL.md` 的风格，去除路由/多技能的概念。

### 3. 定义内容文件格式标准

为 `packages/<pkg>/<topic>.md` 统一内容格式：

**index.md 格式**：
```markdown
# @cat-kit/<pkg>

[一句话描述包的作用和适用场景]

## 运行环境

[浏览器 / Node.js / 通用]

## API 分类

| 分类 | 文档 | 说明 |
|------|------|------|
| 数据操作 | [data.md](data.md) | 数组并集、交集、去重等 |
| ... | ... | ... |

## 全部导出

[列出该包的完整导出符号列表，每个符号一行简要说明]
```

**topic.md 格式**：
```markdown
# <pkg> — <topic>

[该分类的概览，1-2 句]

## API

[每个 API 按以下格式：]

### `<functionName>`

```ts
function functionName(param: Type): ReturnType
```

[1-2 句功能说明]

- **参数**：`param` — [说明]
- **返回**：[说明]
- **注意**：[边界情况/陷阱/最佳实践]

[可选：简短的代码示例]

## 类型签名

> 详见 [`generated/<pkg>/<path>.d.ts`](../../generated/<pkg>/<path>.d.ts)
```

**examples.md 格式**：
末尾添加一行指向 `generated/<pkg>/index.d.ts` 的类型参考链接。

### 4. 改造 sync 脚本

修改 `scripts/sync-cat-kit-skills-api.ts`：
- 将输出目标从 `skills/cat-kit-<pkg>/generated/` 改为 `skills/cat-kit/generated/<pkg>/`
- 保留原有的 `manifest.json` + `README.md` 生成逻辑
- 保留 `DIST_PACKAGES` 的 `.d.ts` 复制和 `TSCONFIG_PKG` 的 JSON 复制
- package.json 中 `sync-cat-kit-skills-api` 和 `sync-cat-kit-skills-api:build` 脚本的说明文字不需要改（命令不变）
- 产物的 README.md 说明文字更新路径指向

### 5. 创建目录骨架和占位文件

- 创建所有目录结构
- 每个 `packages/<pkg>/index.md` 先写占位内容（标题 + 「待补充」标记）
- 创建各包 `examples.md` 的初始版本（从旧技能迁移现有示例）
- 运行 sync 脚本验证 `generated/` 生成正确

### 6. 迁移现有优质内容

- 将 `cat-kit-fe/references/virtualizer.md` 的 API 速查表迁移到 `packages/fe/virtualizer.md`
- 将各包 `examples.md` 中的示例迁移到新位置
- 保留可直接复用的参考内容，不从头重写

## 影响范围

- 新增目录: `skills/cat-kit/`（含 SKILL.md + 8 个包文档目录 + 91 个 generated 类型文件）
- 修改文件: `scripts/sync-cat-kit-skills-api.ts`
- 旧技能目录 `skills/cat-kit-*/`、`skills/use-cat-kit/` 未删除（待后续计划统一清理）

## 历史补丁
