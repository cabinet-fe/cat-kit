# @cat-kit/tsconfig

通过 `extends` 使用的 TypeScript 6 配置预设。

## 如何选择

- `@cat-kit/tsconfig/tsconfig.json`：运行时无关的 ESM/bundler 基础配置。
- `@cat-kit/tsconfig/tsconfig.node.json`：增加 `ESNext` lib 和 Node.js 全局类型。
- `@cat-kit/tsconfig/tsconfig.bun.json`：增加 `ESNext` lib 和 Bun 全局类型。
- `@cat-kit/tsconfig/tsconfig.web.json`：增加 `DOM`、`DOM.Iterable`，不注入额外全局类型。
- `@cat-kit/tsconfig/tsconfig.vue.json`：保留 JSX 并使用 Vue JSX 类型；按项目需要自行补 DOM lib。

## 最小示例

```json
{
  "extends": "@cat-kit/tsconfig/tsconfig.node.json",
  "compilerOptions": { "rootDir": "./src", "outDir": "./dist" },
  "include": ["src"]
}
```

## 约束与边界

- 当前包要求 TypeScript `>= 6.0.0`。
- Node.js 项目需安装 `@types/node`；Bun 项目需安装 `@types/bun`。
- 所有预设使用 `module: "ESNext"` 和 `moduleResolution: "bundler"`；需要 `NodeNext` 语义的项目应显式覆盖，而不是假设 Node 预设会切换模块解析。
- Vue 预设不继承 Web 预设。使用浏览器 API 时可在项目配置中补充 `"lib": ["ESNext", "DOM", "DOM.Iterable"]`。
- `rootDir`、`outDir`、`include`、`declaration` 等产物策略应由消费项目设置。

## 精确配置入口

[基础](../../generated/tsconfig/tsconfig.json) · [Node.js](../../generated/tsconfig/tsconfig.node.json) · [Bun](../../generated/tsconfig/tsconfig.bun.json) · [Web](../../generated/tsconfig/tsconfig.web.json) · [Vue](../../generated/tsconfig/tsconfig.vue.json)
