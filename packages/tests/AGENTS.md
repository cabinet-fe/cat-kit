# @cat-kit/tests - 集中测试套件

本文件为 `packages/tests` 目录提供详细的测试指导。

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

### 1. 按包组织

测试文件按照源包进行组织，目录结构镜像源包的结构：

```
packages/core/src/data/array.ts
→ packages/tests/core/data/array.test.ts

packages/fe/src/storage/cookie.ts
→ packages/tests/fe/storage/cookie.test.ts
```

### 2. 命名约定

- 测试文件必须以 `.test.ts` 结尾
- 测试文件名应与被测试文件名对应
- 测试套件名称使用 `describe` 描述模块/函数
- 测试用例名称使用 `it` 描述具体行为

```typescript
// packages/tests/core/data/array.test.ts
import { describe, it, expect } from 'vitest'
import { unique } from '@cat-kit/core/src'

describe('unique', () => {
  it('should remove duplicates from array', () => {
    const result = unique([1, 2, 2, 3, 3, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('should work with empty array', () => {
    expect(unique([])).toEqual([])
  })
})
```

## 编写测试

### 基本模板

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { functionToTest } from '@cat-kit/<package>/src'

describe('functionToTest', () => {
  beforeEach(() => {
    // 每个测试前的设置
  })

  afterEach(() => {
    // 每个测试后的清理
  })

  it('should do something', () => {
    // 准备（Arrange）
    const input = 'test'

    // 执行（Act）
    const result = functionToTest(input)

    // 断言（Assert）
    expect(result).toBe('expected')
  })
})
```

### 测试纯函数

```typescript
import { describe, it, expect } from 'vitest'
import { add } from '@cat-kit/core/src'

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3)
  })

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5)
  })
})
```

### 测试异步函数

```typescript
import { describe, it, expect } from 'vitest'
import { fetchData } from '@cat-kit/http/src'

describe('fetchData', () => {
  it('should fetch data successfully', async () => {
    const data = await fetchData('/api/users')
    expect(data).toBeDefined()
    expect(data.users).toBeInstanceOf(Array)
  })

  it('should handle errors', async () => {
    await expect(
      fetchData('/api/invalid')
    ).rejects.toThrow('Not found')
  })
})
```

### 测试类和对象

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Cell } from '@cat-kit/excel/src'

describe('Cell', () => {
  let cell: Cell

  beforeEach(() => {
    cell = new Cell({ value: 'test' })
  })

  it('should create cell with value', () => {
    expect(cell.value).toBe('test')
  })

  it('should be immutable', () => {
    const newCell = cell.setValue('new')
    expect(cell.value).toBe('test')
    expect(newCell.value).toBe('new')
  })
})
```

### 使用 Mock

```typescript
import { describe, it, expect, vi } from 'vitest'
import { processWithCallback } from '@cat-kit/core/src'

describe('processWithCallback', () => {
  it('should call callback with result', () => {
    const callback = vi.fn()
    processWithCallback('input', callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('processed: input')
  })
})
```

### 测试浏览器 API（需要 jsdom）

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setCookie, getCookie } from '@cat-kit/fe/src'

describe('cookie', () => {
  beforeEach(() => {
    // 清理 cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
  })

  it('should set and get cookie', () => {
    setCookie('test', 'value')
    expect(getCookie('test')).toBe('value')
  })
})
```

## 测试覆盖率

### 运行覆盖率测试

```bash
cd packages/tests
bun run test -- --coverage
```

### 覆盖率目标

- **语句覆盖率**：≥ 80%
- **分支覆盖率**：≥ 75%
- **函数覆盖率**：≥ 80%
- **行覆盖率**：≥ 80%

### 覆盖率报告

覆盖率报告生成在 `packages/tests/coverage/` 目录：
- `coverage/index.html` - HTML 报告
- `coverage/coverage-final.json` - JSON 报告

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
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

## 测试最佳实践

### 1. AAA 模式

遵循 Arrange-Act-Assert 模式：

```typescript
it('should format date correctly', () => {
  // Arrange - 准备测试数据
  const date = new Date('2024-01-01')

  // Act - 执行被测试的操作
  const result = formatDate(date, 'YYYY-MM-DD')

  // Assert - 验证结果
  expect(result).toBe('2024-01-01')
})
```

### 2. 测试边界情况

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero')
  })

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })

  it('should handle decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.333, 2)
  })
})
```

### 3. 测试隔离

每个测试应该独立，不依赖其他测试：

```typescript
// ✅ 正确：每个测试独立
describe('Calculator', () => {
  it('should add numbers', () => {
    const calc = new Calculator()
    expect(calc.add(1, 2)).toBe(3)
  })

  it('should subtract numbers', () => {
    const calc = new Calculator()
    expect(calc.subtract(5, 3)).toBe(2)
  })
})

// ❌ 错误：测试之间有依赖
describe('Calculator', () => {
  const calc = new Calculator()

  it('should add numbers', () => {
    calc.add(1, 2) // 修改了共享状态
    expect(calc.result).toBe(3)
  })

  it('should subtract numbers', () => {
    // 依赖前一个测试的状态
    calc.subtract(2, 1)
    expect(calc.result).toBe(2)
  })
})
```

### 4. 描述性测试名称

```typescript
// ✅ 正确：清晰描述行为
it('should return empty array when input is empty', () => {})
it('should throw error when value is negative', () => {})

// ❌ 错误：不清晰
it('test1', () => {})
it('works', () => {})
```

### 5. 避免测试实现细节

```typescript
// ✅ 正确：测试公共 API 行为
it('should filter even numbers', () => {
  const result = filterEven([1, 2, 3, 4])
  expect(result).toEqual([2, 4])
})

// ❌ 错误：测试内部实现
it('should call Array.filter internally', () => {
  const spy = vi.spyOn(Array.prototype, 'filter')
  filterEven([1, 2, 3, 4])
  expect(spy).toHaveBeenCalled()
})
```

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
