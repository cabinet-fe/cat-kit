# @cat-kit/core

## 1.1.8

## 1.1.7

## 1.1.6

### Patch Changes

- **@cat-kit/http**（破坏性重命名，按 patch 发布）：`HTTPResponse.data` 重命名为 `body`，调用方需将访问 `data` 的代码改为 `body`。

  **@cat-kit/core**：`$str.joinUrlPath` 过滤空路径段，修复 base URL 为空字符串时产生多余 `/` 的问题。

## 1.1.5

### Patch Changes

- 7a04cb8: feat(data): CatObject.get() 方法参数支持 string[] 数组形式，调用方可使用路径段数组代替点分隔字符串

## 1.1.4

### Patch Changes

- 6f26bd7: fix(data): merge 方法不再跳过源对象的空值，确保 null/undefined/空字符串等从源对象覆盖到目标对象

## 1.1.3

## 1.1.2

### Patch Changes

- 5a18a14: 增强 number 工具

## 1.1.1

## 1.1.0

## 1.0.7

## 1.0.6

## 1.0.5

### Patch Changes

- 407e248: 更新包构建

## 1.0.4

### Patch Changes

- 2ad5b2e: 修复 workspace 依赖发布问题

## 1.0.3
