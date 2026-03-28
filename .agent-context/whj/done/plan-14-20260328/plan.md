# 更新 tsconfig 适应 TypeScript 6.0/大版本变更配置

> 状态: 已执行

## 目标

更新 `@cat-kit/tsconfig` 包以适应刚更新的 TypeScript 大版本配置变更。由于用户提示已升级到新版（大版本），需要应用或移除相关的编译配置以保证最佳实践与兼容性。

## 内容

1. 根据 TypeScript 环境更新推荐配置，在 `packages/tsconfig/tsconfig.json` 中添加新的严格性及模块配置，例如：
   - `noUncheckedSideEffectImports: true`
   - `moduleDetection: "force"`
   - `exactOptionalPropertyTypes: true`
   - `isolatedModules: true`
2. 确保各个环境的配置文件 (`tsconfig.bun.json`, `tsconfig.node.json`, `tsconfig.vue.json`, `tsconfig.web.json`) 不受破坏或同步需要的新字段。
3. 运行代码检查和测试以验证所有包在使用新 tsconfig 时是否正常工作并无报错。

## 影响范围

- `packages/tsconfig/tsconfig.json`

## 历史补丁
