# 修复 vitepress-theme 构建报错及声明文件缺失

> 状态: 已执行

## 目标

修复 `@cat-kit/vitepress-theme` 包构建时 `rolldown-plugin-dts` 无法处理 `.vue` 文件的报错，同时使构建能正确生成 `.d.ts` 声明文件。

## 问题分析

1. `buildLib` 中 `dts: dts !== false` 只传布尔值给 tsdown，无法传递 `vue: true` 等 DTS 配置
2. `rolldown-plugin-dts` 需要 `vue: true` 选项才能用 `vue-tsc` 处理 `.vue` 文件
3. 当前 `BuildConfig.dts` 类型只支持 `boolean`，不支持对象配置

## 内容

1. **修改 `packages/maintenance/src/build/types.ts`**：扩展 `dts` 字段类型，支持传入 DTS 配置对象（包含 `vue` 等选项）
2. **修改 `packages/maintenance/src/build/build.ts`**：解析 `dts` 配置，当为对象时正确传递给 tsdown
3. **修改 `release/groups.ts`**：为 vitepress-theme 构建配置添加 `dts: { vue: true }`
4. **确保 `vue-tsc` 作为依赖可用**（vitepress-theme 的 devDependencies 或根 devDependencies）
5. **验证构建通过且生成声明文件**

## 影响范围

- `packages/maintenance/src/build/types.ts` — 新增 `DtsConfig` 接口，扩展 `BuildConfig.dts` 类型为 `boolean | DtsConfig`
- `packages/maintenance/src/build/build.ts` — 解析 dts 配置对象并透传给 tsdown
- `release/groups.ts` — vitepress-theme 构建配置新增 `dts: { vue: true }`
- `packages/vitepress-theme/package.json` — 新增 `vue-tsc` devDependency

## 历史补丁
