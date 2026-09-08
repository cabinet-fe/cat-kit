---
title: "@cat-kit/tsconfig TypeScript 配置预设"
description: 按 Node.js、Bun、浏览器、Vue 3 四种运行环境划分的 TypeScript 共享配置预设，项目 tsconfig 一行 extends 接入，统一 ESNext 目标、bundler 模块解析与逐项代码质量检查。
aliases: [tsconfig preset, TypeScript 配置, 共享 tsconfig, ts 配置继承, typescript-config]
keywords: [tsconfig.json, tsconfig.node.json, tsconfig.bun.json, tsconfig.web.json, tsconfig.vue.json, extends, moduleResolution, bundler 解析, verbatimModuleSyntax, noUncheckedIndexedAccess, noImplicitAny, types, DOM, JSX, TS2688, Cannot find type definition file, 配置继承]
---

# @cat-kit/tsconfig TypeScript 配置预设

`@cat-kit/tsconfig` 是 JSON 配置预设包，不是编程 API：发布 1 份基础配置（`tsconfig.json`）加 4 份运行环境预设（`tsconfig.node.json`、`tsconfig.bun.json`、`tsconfig.web.json`、`tsconfig.vue.json`），项目在自己的 `tsconfig.json` 中用 `extends` 继承其中一份，只补 `include`、`outDir`、`rootDir` 等项目私有选项。当前版本 2.0.1；peer 依赖 `typescript >= 6.0.0`、`@types/node` 26.4.1、`@types/bun` 1.4.1，三者均声明为可选（`peerDependenciesMeta.optional`）。

## 安装

```bash
bun add -d @cat-kit/tsconfig typescript
```

按运行环境补装类型包：Node.js 项目装 `@types/node`，Bun 项目装 `@types/bun`，浏览器与 Vue 项目无需类型包。`types` 编译选项指向未安装的类型包时，`tsc` 报 `error TS2688: Cannot find type definition file for '<包名>'.`。

新建项目 `tsconfig.json`，继承基础预设并补项目私有选项（完整文件，直接可用）：

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

- `extends` 值写包名路径（`@cat-kit/tsconfig/tsconfig.node.json` 形式），包管理器会解析到 `node_modules/@cat-kit/tsconfig/` 下的 JSON 文件；本仓库各子包即采用此写法
- 预设内部的 `"extends": "./tsconfig.json"` 相对预设文件自身解析，环境预设自动带上基础配置，消费者只 extends 环境预设一份即可
- 预设 JSON 内含注释（JSONC），TypeScript 原生支持；编辑器中把预设文件识别为 JSON with Comments 可获得 schema 提示

## 模块速查

| 预设 | 适用环境 | 一句话说明 |
| --- | --- | --- |
| `tsconfig.json` | 所有 TypeScript 项目 | 基础配置：ESNext 目标、bundler 解析、逐项开启的代码质量检查 |
| `tsconfig.node.json` | Node.js 项目 | 基础配置 + `lib: ["ESNext"]`、`types: ["node"]` |
| `tsconfig.bun.json` | Bun 项目 | 基础配置 + `lib: ["ESNext"]`、`types: ["bun"]` |
| `tsconfig.web.json` | 浏览器 / 打包前端项目 | 基础配置 + DOM lib（`ESNext`、`DOM`、`DOM.Iterable`），`types: []` |
| `tsconfig.vue.json` | Vue 3 + Vite 项目 | 基础配置 + `jsx: "preserve"`、`jsxImportSource: "vue"`，`types: []` |

### tsconfig.json（基础配置）

完整文件内容：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "allowJs": false,
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": false,
    "verbatimModuleSyntax": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noUnusedLocals": true,
    "noUnusedParameters": false,
    "allowUnreachableCode": false,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

- 本库是「逐项开启检查」的预设，不是「全量 strict」预设：文件不含 `strict` 字段，且显式设置 `"noImplicitAny": false`（隐式 `any` 不报错）与 `"noUnusedParameters": false`（未使用的函数参数不报错）
- `allowJs: false` 禁止项目混入 `.js` 源文件；`moduleResolution: "bundler"` 面向 Vite、Rspack 等打包器，未启用 NodeNext
- `verbatimModuleSyntax: true` 要求类型导入写 `import type`，import / export 按原样输出

### tsconfig.node.json（Node.js）

完整文件内容：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "types": ["node"]
  }
}
```

`types: ["node"]` 要求项目已安装 `@types/node`（可选 peer，版本 26.4.1），否则报 `TS2688`。lib 不含 DOM，Node 侧脚本无需浏览器声明。

### tsconfig.bun.json（Bun）

完整文件内容：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "types": ["bun"]
  }
}
```

`types: ["bun"]` 要求项目已安装 `@types/bun`（可选 peer，版本 1.4.1），否则报 `TS2688`。lib 不含 DOM。

### tsconfig.web.json（浏览器）

完整文件内容：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": []
  }
}
```

`types: []` 表示不自动注入任何 `@types/*` 全局类型；需要时在项目自己的 tsconfig 里覆盖 `types` 字段。

### tsconfig.vue.json（Vue 3）

完整文件内容：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "types": []
  }
}
```

- `jsx: "preserve"` 保留 JSX / TSX 原样输出，转换交给 Vite 的 Vue 插件；`jsxImportSource: "vue"` 使自动注入的 JSX 工厂来自 Vue 3
- 本预设不继承 `tsconfig.web.json`，lib 不含 DOM；代码里用到 `window`、`document` 时在项目自己的 tsconfig 补 `"lib": ["ESNext", "DOM", "DOM.Iterable"]`
- 类型声明（`.vue` 模块、`defineProps` 宏等）由 Vite 插件与 `vue-tsc` 注入，预设内 `types` 保持为空
