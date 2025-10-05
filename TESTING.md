# Cat-Kit 测试指南

本文档介绍如何在 cat-kit 单体仓库中运行和编写测试。

## 快速开始

### 安装依赖

```bash
bun install
```

### 运行所有测试

```bash
# 运行所有测试（单次）
bun run test

# 监听模式（自动重新运行）
bun run test:watch

# 生成覆盖率报告
bun run test:coverage

# 使用 UI 界面
bun run test:ui
```

### 运行特定包的测试

```bash
# 运行 crypto 包的测试
bun run test packages/crypto

# 运行 core 包的测试
bun run test packages/core

# 运行特定测试文件
bun run test packages/crypto/tests/md5.test.ts
```

## 项目结构

```
cat-kit/
├── vitest.config.ts           # Vitest 全局配置
├── package.json               # 根 package.json（包含测试脚本）
└── packages/
    ├── crypto/
    │   ├── src/               # 源代码
    │   ├── tests/             # 测试文件
    │   │   ├── key-gen.test.ts
    │   │   ├── md5.test.ts
    │   │   ├── aes.test.ts
    │   │   ├── utils.test.ts
    │   │   ├── types.test.ts
    │   │   ├── integration.test.ts
    │   │   └── README.md
    │   └── package.json
    ├── core/
    │   └── tests/             # Core 包的测试
    └── ...
```

## 测试配置

### Vitest 配置 (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### 特性

- ✅ **全局 API** - 无需在每个文件中导入 `describe`, `it`, `expect`
- ✅ **Node.js 环境** - 测试在 Node.js 环境中运行
- ✅ **自动发现** - 自动发现所有包中的 `tests/**/*.test.ts` 文件
- ✅ **覆盖率报告** - 支持 v8 覆盖率提供器

## 编写测试

### 基本测试结构

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../src/my-module'

describe('模块名称', () => {
  describe('功能分组', () => {
    it('应该正确处理正常情况', () => {
      const result = myFunction('input')
      expect(result).toBe('expected')
    })

    it('应该处理边界情况', () => {
      expect(myFunction('')).toBe('')
      expect(myFunction(null)).toBeNull()
    })
  })
})
```

### 异步测试

```typescript
it('应该正确处理异步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

### 测试组织

1. **单元测试** - 测试单个函数或类

   - 文件命名：`function-name.test.ts`
   - 每个模块对应一个测试文件

2. **集成测试** - 测试多个模块的协作

   - 文件命名：`integration.test.ts`
   - 测试实际使用场景

3. **性能测试** - 测试性能指标
   - 包含在集成测试中
   - 使用合理的性能阈值

## 测试覆盖率

### 查看覆盖率

```bash
# 生成覆盖率报告
bun run test:coverage

# 查看 HTML 报告
open coverage/index.html
```

### 覆盖率目标

- **行覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **函数覆盖率**: > 90%
- **语句覆盖率**: > 90%

## 测试最佳实践

### 1. 测试命名

```typescript
// ✅ 好的命名 - 清晰描述测试目的
it('应该在输入为空时返回空数组', () => {})

// ❌ 不好的命名 - 不清楚测试什么
it('测试函数', () => {})
```

### 2. 测试组织

```typescript
describe('功能模块', () => {
  describe('子功能 A', () => {
    it('场景 1', () => {})
    it('场景 2', () => {})
  })

  describe('子功能 B', () => {
    it('场景 1', () => {})
    it('场景 2', () => {})
  })
})
```

### 3. 断言清晰

```typescript
// ✅ 好的断言
expect(result).toBe(expected)
expect(array).toHaveLength(3)
expect(obj).toEqual({ id: 1, name: 'test' })

// ❌ 不好的断言
expect(result).toBeTruthy() // 不够具体
```

### 4. 测试独立性

```typescript
// ✅ 每个测试都是独立的
it('测试 1', () => {
  const data = createTestData()
  // ... 测试逻辑
})

it('测试 2', () => {
  const data = createTestData()
  // ... 测试逻辑
})

// ❌ 测试之间有依赖
let sharedData
it('测试 1', () => {
  sharedData = {
    /* ... */
  }
})
it('测试 2', () => {
  // 依赖测试 1 的结果
  expect(sharedData).toBeDefined()
})
```

### 5. 边界测试

```typescript
describe('边界情况', () => {
  it('应该处理空输入', () => {})
  it('应该处理最小值', () => {})
  it('应该处理最大值', () => {})
  it('应该处理无效输入', () => {})
})
```

## 常用断言

```typescript
// 相等性
expect(value).toBe(expected) // 严格相等 (===)
expect(value).toEqual(expected) // 深度相等
expect(value).not.toBe(other) // 不等于

// 真假值
expect(value).toBeTruthy() // 真值
expect(value).toBeFalsy() // 假值
expect(value).toBeNull() // null
expect(value).toBeUndefined() // undefined
expect(value).toBeDefined() // 已定义

// 数字
expect(number).toBeGreaterThan(5) // > 5
expect(number).toBeLessThan(10) // < 10
expect(number).toBeCloseTo(5.5) // 接近 5.5

// 字符串
expect(string).toMatch(/pattern/) // 匹配正则
expect(string).toContain('substring') // 包含子串

// 数组
expect(array).toHaveLength(3) // 长度为 3
expect(array).toContain(item) // 包含元素

// 对象
expect(obj).toHaveProperty('key') // 有属性
expect(obj).toMatchObject(partial) // 部分匹配

// 异常
expect(() => fn()).toThrow() // 抛出异常
expect(() => fn()).toThrow(Error) // 抛出特定类型
```

## 调试测试

### 使用 console.log

```typescript
it('调试测试', () => {
  const result = myFunction()
  console.log('结果:', result)
  expect(result).toBe(expected)
})
```

### 使用 Vitest UI

```bash
bun run test:ui
```

在浏览器中打开，可以：

- 查看测试结果
- 查看测试覆盖率
- 单独运行某个测试
- 实时查看测试状态

### 只运行特定测试

```typescript
// 只运行这个测试
it.only('只运行这个', () => {})

// 跳过这个测试
it.skip('跳过这个', () => {})

// 标记为待办
it.todo('待实现的测试')
```

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run test:coverage
```

## 常见问题

### Q: 测试运行缓慢怎么办？

A: 可以并行运行测试或只运行特定文件：

```bash
bun run test --reporter=dot  # 使用简化输出
bun run test packages/crypto/tests/md5.test.ts  # 只运行特定文件
```

### Q: 如何测试浏览器特定功能？

A: 使用 jsdom 或 happy-dom 环境：

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom' // 或 'happy-dom'
  }
})
```

### Q: 如何模拟依赖？

A: 使用 Vitest 的 mock 功能：

```typescript
import { vi } from 'vitest'

vi.mock('../src/dependency', () => ({
  someFunction: vi.fn(() => 'mocked')
}))
```

## 资源链接

- [Vitest 官方文档](https://vitest.dev/)
- [测试覆盖率报告](./coverage/index.html)
- [Crypto 包测试文档](./packages/crypto/tests/README.md)

## 贡献

添加新功能时，请确保：

1. ✅ 编写相应的单元测试
2. ✅ 测试覆盖率达标
3. ✅ 所有测试通过
4. ✅ 更新相关文档
