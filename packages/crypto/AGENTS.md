# @cat-kit/crypto - 安全工具包

安全相关工具包，面向 Browser / Node.js / Bun，提供随机 ID、安全摘要、加密等能力。

**运行环境**：通用（Browser + Node.js + Bun）
**当前能力**：基于 Web Crypto `crypto.getRandomValues` 的 nanoid 随机 ID 生成。

## 目录结构

```
packages/crypto/src/
├── nanoid.ts          # nanoid 随机 ID 生成
└── index.ts           # 主导出文件
```

**当 `crypto/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- 优先使用现代跨环境 Web Platform API，例如 `globalThis.crypto`、Web Crypto、Web Streams 等。
- 保持 Browser / Node.js / Bun 通用，不要在通用入口直接依赖 Node.js 专用 API。
- 不要使用 `Buffer`、`node:crypto` 等 Node 专用能力实现可由 Web Crypto 覆盖的功能。
- 移植第三方实现时，必须在代码顶部保留来源说明，包含项目地址和对应源文件。
- 所有公共 API 通过 `src/index.ts` 统一导出。
- 新增 `packages/crypto` 功能时，同步更新：
  - `docs/content/packages/crypto/`
  - `skills/cat-kit/packages/crypto/`
  - 必要时刷新 `skills/cat-kit/generated/crypto/`
