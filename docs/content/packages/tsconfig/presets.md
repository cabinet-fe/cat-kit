---
title: 预设说明
description: '@cat-kit/tsconfig 的各个 JSON 预设与适用场景'
outline: deep
---

# 预设说明

## 介绍

`@cat-kit/tsconfig` 当前发布 5 个 JSON 预设：

- `tsconfig.json`
- `tsconfig.node.json`
- `tsconfig.bun.json`
- `tsconfig.web.json`
- `tsconfig.vue.json`

选择方式很简单：按项目运行环境决定 `extends` 指向哪个文件。

## 快速使用

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.node.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

## API参考

### 基础预设

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.json"
}
```

适合：

- 通用库
- 想在上层自己补 `lib` / `types` 的项目

### Node.js 预设

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.node.json"
}
```

特点：

- 基于基础预设
- 额外包含 Node.js 类型
- 适合脚本、CLI、服务端包

### Bun 预设

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.bun.json"
}
```

特点：

- 基于基础预设
- 额外包含 Bun 类型
- 适合 Bun runtime 项目

### Web 预设

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.web.json"
}
```

特点：

- 补充 `DOM` 与 `DOM.Iterable`
- 适合浏览器端项目

### Vue 预设

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.vue.json",
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

特点：

- 面向 Vue 3 / Vite 场景
- 保留 JSX 给 Vue 工具链处理

### 安装要求

```bash
bun add -d @cat-kit/tsconfig typescript
```

注意：

- 这是开发依赖，不是运行时依赖
- 还需要按环境安装 `@types/node` 或 `@types/bun`
- `package.json` 当前对 `typescript` 的 peer 要求是 `>= 6.0.0`
