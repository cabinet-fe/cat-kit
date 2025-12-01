# @cat-kit/tsconfig

Cat-Kit 项目的 TypeScript 配置预设，提供适用于不同运行环境的 TypeScript 配置。

## 概述

本包提供了多个 TypeScript 配置预设，适用于不同的运行环境和项目类型：

- **基础配置** (`tsconfig.json`) - 通用的严格类型检查配置
- **Bun 配置** (`tsconfig.bun.json`) - 适用于 Bun 运行时
- **Node.js 配置** (`tsconfig.node.json`) - 适用于 Node.js 环境
- **Web 配置** (`tsconfig.web.json`) - 适用于浏览器环境
- **Vue 配置** (`tsconfig.vue.json`) - 适用于 Vue 3 项目

## 安装

```bash
bun add -d @cat-kit/tsconfig typescript
```

## 使用方法

### 基础配置

适用于大多数 TypeScript 项目：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Bun 运行时

适用于使用 Bun 运行时的项目：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.bun.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Node.js 环境

适用于 Node.js 项目：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 浏览器环境

适用于浏览器端项目：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.web.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Vue 3 项目

适用于 Vue 3 项目（需要配合 Vite）：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.vue.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## 配置特点

### 严格类型检查

- ✅ `strictNullChecks` - null/undefined 作为独立类型
- ✅ `strictFunctionTypes` - 函数类型严格协变/逆变
- ✅ `strictBindCallApply` - bind/call/apply 参数严格匹配
- ✅ `noImplicitThis` - 禁止隐式 this
- ✅ `noImplicitOverride` - 类方法重写必须使用 override
- ✅ `noUncheckedIndexedAccess` - 索引访问自动加上 undefined
- ✅ `useUnknownInCatchVariables` - catch 变量类型为 unknown

### 代码质量

- ✅ `noUnusedLocals` - 检测未使用的局部变量
- ✅ `allowUnreachableCode: false` - 禁止不可达代码
- ✅ `forceConsistentCasingInFileNames` - 强制文件名大小写一致

### 模块系统

- ✅ `module: "ESNext"` - 使用最新的 ES 模块
- ✅ `moduleResolution: "bundler"` - 使用 bundler 解析策略
- ✅ `verbatimModuleSyntax` - 保持 import/export 原样输出
- ✅ `esModuleInterop` - 支持 CommonJS 默认导入
- ✅ `allowSyntheticDefaultImports` - 允许合成默认导入

### 性能优化

- ✅ `skipLibCheck` - 跳过 node_modules 类型检查

## 配置说明

### tsconfig.json（基础配置）

通用的严格 TypeScript 配置，包含所有类型检查和代码质量选项。不包含特定运行时的类型定义。

### tsconfig.bun.json

继承基础配置，添加：

- `lib: ["ESNext"]` - 仅包含 ESNext 库
- `types: ["bun"]` - 包含 Bun 类型定义

### tsconfig.node.json

继承基础配置，添加：

- `lib: ["ESNext"]` - 仅包含 ESNext 库
- `types: ["node"]` - 包含 Node.js 类型定义

### tsconfig.web.json

继承基础配置，添加：

- `lib: ["ESNext", "DOM", "DOM.Iterable"]` - 包含 DOM API
- `types: []` - 不包含额外的全局类型

### tsconfig.vue.json

继承基础配置，添加：

- `jsx: "preserve"` - 保留 JSX，由 Vue 插件处理
- `jsxImportSource: "vue"` - 使用 Vue 3 JSX 工厂
- `types: []` - 类型定义由 Vite 插件注入

## 注意事项

1. **TypeScript 版本**：需要 TypeScript >= 5.5.0
2. **类型定义**：根据使用的运行时环境，需要安装对应的类型定义包：
   - Bun: `@types/bun`
   - Node.js: `@types/node`
3. **Vue 项目**：使用 Vue 配置时，需要配合 Vite 和 Vue 插件使用
4. **编辑器支持**：建议在编辑器中启用 JSON with Comments 支持，以获得更好的配置提示

## 许可证

MIT
