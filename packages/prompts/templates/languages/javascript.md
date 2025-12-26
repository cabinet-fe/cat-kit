# JavaScript 代码风格指南

## 文件命名

- 普通文件：**kebab-case**：`user-service.js`
- 组件文件：**PascalCase**：`UserProfile.jsx`
- 测试文件：`*.test.js`

## 项目约定

### 导出偏好

- 使用具名导出，避免默认导出（支持 tree-shaking）

### 函数参数

- 超过 3 个参数时使用对象参数

### 注释要求

- 公共函数应有 JSDoc 注释
