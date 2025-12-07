# @cat-kit/tests - 集中测试套件

本文件为 `packages/tests` 目录提供详细的测试指导。

## 核心原则

- **不要引入任何 package.json 中不存在的依赖**

## 概述

`packages/tests` 是 Cat-Kit monorepo 的集中测试套件，包含所有包的测试用例。

**目录位置**：`packages/tests/`
**测试框架**：Vitest
**运行环境**：Node.js

## 目录结构

```
packages/tests/
├── core/              # @cat-kit/core 的测试
│   ├── data/          # 数据处理工具测试
│   ├── date/          # 日期工具测试
│   ├── optimize/      # 性能优化测试
│   └── ...
├── fe/                # @cat-kit/fe 的测试
│   ├── storage/       # 存储功能测试
│   ├── virtualizer/   # 虚拟滚动测试
│   └── ...
├── http/              # @cat-kit/http 的测试
│   ├── client.test.ts
│   ├── plugins/
│   └── ...
├── excel/             # @cat-kit/excel 的测试
│   ├── core/          # 核心类测试
│   ├── reader/        # 读取功能测试
│   ├── writer/        # 写入功能测试
│   └── ...
├── vitest.config.ts   # Vitest 配置
├── package.json
└── tsconfig.json
```

## 测试组织原则

> **📌 详细测试规范和最佳实践请参考根目录的 `AGENTS.md` 文件**

### 按包组织

测试文件镜像源包结构：

```
packages/core/src/data/array.ts → packages/tests/core/data/array.test.ts
```

### 命名约定

- 测试文件以 `.test.ts` 结尾
- 测试文件名与被测试文件名对应

## 编写测试

> **📌 详细的测试最佳实践请参考根目录的 `AGENTS.md` 文件**

基本测试模板参考根目录 `AGENTS.md` 中的示例。

## 测试覆盖率

> **📌 覆盖率目标和详细要求请参考根目录的 `AGENTS.md` 文件**

运行覆盖率测试：

```bash
cd packages/tests
bun run test -- --coverage
```

## 运行测试

### 运行所有测试

```bash
cd packages/tests
bun run test
```

### 运行特定包的测试

```bash
# 只测试 core 包
cd packages/tests
bun run test core/

# 只测试 excel 包
cd packages/tests
bun run test excel/
```

### 运行特定文件

```bash
cd packages/tests
bun run test core/data/array.test.ts
```

### 监听模式

```bash
cd packages/tests
bun run test --watch
```

### UI 模式

```bash
cd packages/tests
bun run test:ui
```

## Vitest 配置

配置文件：`packages/tests/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // 启用全局 API（describe, it, expect）
    environment: 'node', // 默认测试环境
    include: ['**/*.test.ts'], // 测试文件模式
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*']
    }
  }
})
```

## 测试最佳实践

> **注意**：详细的测试最佳实践（AAA 模式、边界测试、测试隔离、描述性命名、避免测试实现细节等）请参考根目录的 `AGENTS.md` 文件。

## 添加新测试

### 步骤

1. **确定位置**：根据被测试的包确定测试文件位置

   - `@cat-kit/core` → `packages/tests/core/`
   - `@cat-kit/fe` → `packages/tests/fe/`
   - 等等

2. **创建测试文件**：在对应位置创建 `.test.ts` 文件

3. **编写测试**：遵循测试最佳实践

4. **运行测试**：确保所有测试通过

   ```bash
   cd packages/tests
   bun run test
   ```

5. **检查覆盖率**：确保覆盖率达标
   ```bash
   cd packages/tests
   bun run test -- --coverage
   ```

## 调试测试

### 使用 console.log

```typescript
it('should do something', () => {
  const result = doSomething()
  console.log('Result:', result) // 调试输出
  expect(result).toBe(expected)
})
```

### 使用 debugger

```typescript
it('should do something', () => {
  debugger // 设置断点
  const result = doSomething()
  expect(result).toBe(expected)
})
```

然后使用 Node.js 调试器运行：

```bash
node --inspect-brk ./node_modules/.bin/vitest
```

## 常见问题

### 测试超时

增加超时时间：

```typescript
it('should handle slow operation', async () => {
  // 测试代码
}, 10000) // 10 秒超时
```

### 异步测试未完成

确保返回 Promise 或使用 async/await：

```typescript
// ✅ 正确
it('should wait for async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe('done')
})

// ❌ 错误
it('should wait for async operation', () => {
  asyncFunction().then(result => {
    expect(result).toBe('done') // 可能在测试结束后才执行
  })
})
```

## 持续集成

测试应该在 CI/CD 流程中自动运行。确保：

- 所有测试都通过
- 覆盖率达标
- 没有跳过的测试（除非有充分理由）
- 测试执行时间合理

## 测试文档

对于复杂的测试场景，添加注释说明：

```typescript
describe('complex feature', () => {
  /**
   * 这个测试验证在并发情况下的行为
   *
   * 场景：
   * 1. 同时发起多个请求
   * 2. 所有请求都应该成功
   * 3. 结果应该按照请求顺序返回
   */
  it('should handle concurrent requests correctly', async () => {
    // 测试代码
  })
})
```

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
