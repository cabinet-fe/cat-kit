# 修复 agent-context 全局安装 install/sync 的 ENOENT 错误

> 状态: 未执行

## 目标

修复 `@cat-kit/agent-context` 通过 `npm i -g` 安装后执行 `install` / `sync` 子命令时报 `ENOENT: no such file or directory, open '.../dist/skill/scripts/get-context-info.mjs'` 的问题。根因是 `tsdown` 仅编译 `.ts`，不会把 `src/skill/scripts/get-context-info.mjs` 这份运行期必读的静态资产复制到 `dist/` 产物目录，使得 `renderSkillArtifacts → readContextScript()`（`packages/agent-context/src/skill/render.ts` 第 192-195 行）在读取 `dist/skill/scripts/get-context-info.mjs` 时必然失败。让构建产物携带这份脚本，以恢复 `install` / `sync` 的正常行为。

## 内容

1. 修改 `packages/agent-context/tsdown.config.ts`，在现有配置基础上新增 `copy` 字段：
   ```ts
   copy: [{ from: 'src/skill/scripts/get-context-info.mjs', to: 'dist/skill/scripts/get-context-info.mjs' }]
   ```
   仅复制这一份 `.mjs` 文件；不使用通配模式，避免未来新增非资产文件被误带入。明确写死 `to` 为 `dist/skill/scripts/get-context-info.mjs`，保持与 `render.ts` 中 `join(dirname(fileURLToPath(import.meta.url)), 'scripts', CONTEXT_SCRIPT_NAME)` 的解析路径一致。
2. 在 `packages/agent-context` 下执行 `pnpm build`（等价 `tsdown`），验证构建产物包含：
   - `packages/agent-context/dist/skill/scripts/get-context-info.mjs`
   - 文件内容与 `packages/agent-context/src/skill/scripts/get-context-info.mjs` 字节一致（使用 `diff` 比较）。
3. 回归验证（命中原 ENOENT 场景）：
   a. 创建临时目录 `/tmp/ac-install-smoke`，切换到该目录。
   b. 执行 `node /Users/whj/codes/cat-kit/packages/agent-context/dist/cli.js install --tools cursor`，期望：命令退出码为 0，终端不再出现 `ENOENT: no such file or directory`，且 `/tmp/ac-install-smoke/.cursor/skills/ac-workflow/scripts/get-context-info.mjs` 被生成，内容与源脚本一致。
   c. 在同目录接着执行 `node /Users/whj/codes/cat-kit/packages/agent-context/dist/cli.js sync`，期望：命令退出码为 0，输出无 ENOENT；已生成的 skill 目录保持完整。
   d. 执行完成后删除 `/tmp/ac-install-smoke`。
4. 同步仓库内已安装的 skill（验证链路完整性）：在仓库根执行 `npx agent-context sync`，期望退出码为 0 且无 ENOENT。

## 影响范围

## 历史补丁
