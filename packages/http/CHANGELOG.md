# @cat-kit/http

## 1.1.7

### Patch Changes

- b621023: refactor(http): 插件 hook 改为对象上下文；移除 HTTPRetryPlugin，Token 内置 maxRetries；导出 IHTTPClient 与 getEngine()
  - @cat-kit/core@1.1.7

## 1.1.6

### Patch Changes

- **@cat-kit/http**（破坏性重命名，按 patch 发布）：`HTTPResponse.data` 重命名为 `body`，调用方需将访问 `data` 的代码改为 `body`。

  **@cat-kit/core**：`$str.joinUrlPath` 过滤空路径段，修复 base URL 为空字符串时产生多余 `/` 的问题。

- Updated dependencies
  - @cat-kit/core@1.1.6

## 1.1.5

### Patch Changes

- Updated dependencies [7a04cb8]
  - @cat-kit/core@1.1.5

## 1.1.4

### Patch Changes

- Updated dependencies [6f26bd7]
  - @cat-kit/core@1.1.4

## 1.1.3

### Patch Changes

- a54474e: http 包源码同时发布
  - @cat-kit/core@1.1.3

## 1.1.2

### Patch Changes

- 5a18a14: http 工具增强
- Updated dependencies [5a18a14]
  - @cat-kit/core@1.1.2

## 1.1.1

### Patch Changes

- @cat-kit/core@1.1.1

## 1.1.0

### Patch Changes

- @cat-kit/core@1.1.0

## 1.0.7

### Patch Changes

- @cat-kit/core@1.0.7

## 1.0.6

### Patch Changes

- @cat-kit/core@1.0.6

## 1.0.5

### Patch Changes

- 407e248: 更新包构建
- Updated dependencies [407e248]
  - @cat-kit/core@1.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [2ad5b2e]
  - @cat-kit/core@1.0.4

## 1.0.3

### Patch Changes

- 455541f: 新增虚拟化 API 和 Tween API
  - @cat-kit/core@1.0.3
