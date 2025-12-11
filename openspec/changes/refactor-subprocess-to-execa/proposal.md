# Change: 重构子进程操作 - 使用 execa 模板字符串语法

## Why

当前 `@cat-kit/maintenance` 包中的子进程操作使用原生 `node:child_process` 的 `spawn` API，存在以下问题：

1. **代码冗余**：每个命令执行函数都需要手动处理 stdout/stderr 收集、错误处理、Promise 封装
2. **可维护性差**：相似的样板代码分散在多个文件中
3. **功能局限**：缺少超时控制、进程取消等高级特性

`execa` v9.6.1 已经作为依赖引入，它提供：
- **模板字符串语法**：`$\`git status\`` 更简洁、变量自动转义
- **更好的类型支持**：TypeScript 友好
- **灵活的输出控制**：静默/实时输出可配置

## What Changes

### 1. 重构 `execGit` - 静默模式
使用模板字符串语法，静默执行并返回 stdout：
```typescript
import { $ } from 'execa'

export async function execGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await $({ cwd })`git ${args}`
  return stdout.trim()
}
```

### 2. 重构 `publishPackage` - 实时输出模式
发布操作使用实时输出，让用户看到进度：
```typescript
// 实时输出到控制台
await $({ cwd, stdio: 'inherit' })`npm publish ${args}`
```

### 3. 输出模式选择

| 函数 | 输出模式 | 原因 |
|-----|---------|------|
| `execGit` | 静默 (返回 stdout) | 程序化调用，需要处理输出 |
| `publishPackage` | 实时输出 | 用户需要看到发布进度 |

## Impact

- **受影响的文件**：
  - `packages/maintenance/src/utils.ts` - 重构 `execGit`
  - `packages/maintenance/src/release/publish.ts` - 重构发布逻辑
- **向后兼容**：✅ 公共 API 签名保持不变
- **用户体验提升**：发布时可以看到实时进度
