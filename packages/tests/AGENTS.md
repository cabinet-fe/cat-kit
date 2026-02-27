# 集中测试指南

## 概述

`packages/tests` 是 Cat-Kit monorepo 的集中测试应用。

### 测试范围

- `packages/be`
- `packages/core`
- `packages/excel`
- `packages/fe`
- `packages/http`
- `packages/maintenance`

### 测试框架

Vitest

### 运行环境

Node.js

## 测试组织原则

### 引入测试目标

引入测试目标时，统一使用源码路径，每个包的`package.json`文件的`exports`字段定义了源码路径如下:

```json
{
  "exports": {
    "./src": "./src/index.ts"
  }
}
```

引入示例：

```ts
import { o } from '@cat-kit/core/src'
```

### 按包组织

测试文件镜像源包结构：

```
packages/core/src/data/array.ts → packages/tests/core/data/array.test.ts
```
### 命名约定

- 测试文件以 `.test.ts` 结尾
- 测试文件名与被测试文件名对应

## 测试最佳实践

- 使用 AAA 模式
- 使用 `async/await` 处理异步逻辑，确保不使用不稳定的定时器（除非使用 vi.useFakeTimers()）
- 避免在测试中编写复杂的逻辑。如果测试代码本身需要复杂的 if/else，请简化它
- 充分利用 Vitest 的类型支持，例如在 Mock 之后使用 vi.mocked(dependency) 来获得完整的 IDE 类型提示


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

## **约束**

- 不要超出测试范围
