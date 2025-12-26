# TypeScript 代码风格指南

## 文件命名

- 普通文件：**kebab-case**：`user-service.ts`
- 组件文件：**PascalCase**：`UserProfile.tsx`
- 测试文件：`*.test.ts`

## 项目约定

### 类型定义偏好

- 对象结构优先使用 `interface`（可扩展）
- 联合类型、工具类型使用 `type`

### 导出偏好

- 使用具名导出，避免默认导出（支持 tree-shaking）

### 函数参数

- 超过 3 个参数时使用对象参数

### 注释要求

- 公共 API 必须有 JSDoc 注释
