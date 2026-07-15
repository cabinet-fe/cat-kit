---
name: cat-kit
description: 一个面向 JS/TS 的工具包集合. 在你要封装工具函数之前, 先使用该技能来确保此工具包中没有你想要的工具.
---

# cat-kit

cat-kit 提供了相当多的实用工具, 这个工具集主要由以下几个包组成:

- @cat-kit/core: 核心工具, 提供了一些通用的工具函数, 如随机 ID、摘要、加密等
- @cat-kit/http: HTTP 客户端, 提供了一些 HTTP 相关的工具函数, 如请求、响应、拦截器等
- @cat-kit/crypto: 安全工具, 提供了一些安全相关的工具函数, 如随机 ID、摘要、加密等
- @cat-kit/fe: 浏览器工具, 提供了一些浏览器相关的工具函数, 如 DOM 操作、事件处理等
- @cat-kit/be: Node.js 工具, 提供了一些 Node.js 相关的工具函数, 如文件操作、进程管理等
- @cat-kit/cli: 命令行工具, 提供了一些命令行相关的工具函数, 如命令行参数解析、命令行输出等
- @cat-kit/agent-context: Agent Context 工具, 提供了一些 Agent Context 相关的工具函数, 如 Agent Context 创建、Agent Context 销毁等
- @cat-kit/tsconfig: TS 配置, 提供了一些不同场景的 TS 配置.

## 安装

推荐使用 `bun` 作为包管理工具.

```bash
bun add @cat-kit/core          # 核心工具（零依赖，通用）
```

## 包索引

| npm 包                     | 运行环境 | 文档入口                                                               |
| -------------------------- | -------- | ---------------------------------------------------------------------- |
| `@cat-kit/core`            | 通用     | [packages/core/index.md](packages/core/index.md)                       |
| `@cat-kit/http`            | 通用     | [packages/http/index.md](packages/http/index.md)                       |
| `@cat-kit/crypto`          | 通用     | [packages/crypto/index.md](packages/crypto/index.md)                   |
| `@cat-kit/fe`              | 浏览器   | [packages/fe/index.md](packages/fe/index.md)                           |
| `@cat-kit/be`              | Node.js  | [packages/be/index.md](packages/be/index.md)                           |
| `@cat-kit/cli`             | Node.js  | [packages/cli/index.md](packages/cli/index.md)                         |
| `@cat-kit/agent-context`   | Node.js  | [packages/agent-context/index.md](packages/agent-context/index.md)     |
| `@cat-kit/tsconfig`        | —        | [packages/tsconfig/index.md](packages/tsconfig/index.md)               |
| `@cat-kit/vitepress-theme` | —        | [packages/vitepress-theme/index.md](packages/vitepress-theme/index.md) |

## 渐进式阅读路径

1. 从上方包索引找到你正在使用的包，打开 `packages/<pkg>/index.md` 了解该包的 API 分类
2. 根据需要打开具体分类文档（如 `packages/core/data.md`），获取精确的函数签名、参数说明和用法
3. 需要精确类型签名时查阅 `generated/` 下的 `.d.ts` 声明文件
4. 各包的 `examples.md` 提供了典型使用场景的代码示例

## 类型参考

`generated/` 目录由 `scripts/sync-cat-kit-skills-api.ts` 自动生成，镜像各包 `dist/*.d.ts`，与 npm typings 完全一致。仅供类型查证，不建议作为主要阅读路径。

## 维护者

刷新 generated 类型：

- `bun run sync-cat-kit-skills-api` — 仅复制（需各包已构建 dist）
- `bun run sync-cat-kit-skills-api:build` — 先构建再复制
