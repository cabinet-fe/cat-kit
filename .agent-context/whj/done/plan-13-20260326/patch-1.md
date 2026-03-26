# 优化 vitepress-theme 构建配置

## 补丁内容

1. **集成插件系统**：在 `@cat-kit/maintenance` 的构建工具中增加了对第三方插件的支持（`plugins` 字段），并默认集成了 `@tsdown/css` 以处理 CSS。
2. **引入 Vue 编译驱动**：在全局构建配置 `release/groups.ts` 中，为 `vitepressTheme` 引入了 `@vitejs/plugin-vue`，实现了对 `.vue` 文件的真正编译，而非简单的文件拷贝。
3. **移除冗余配置**：删除了 `packages/vitepress-theme/tsdown.config.ts`，统一回归到 `release/groups.ts` 管理，符合项目整体架构。
4. **解决 DTS 兼容性**：由于目前的 `rolldown-plugin-dts` 暂不支持 Vue SFC 的类型生成，暂时为该包关闭了 `dts` 选项以保证构建通过。
5. **精简资产拷贝**：修改 `afterBuild` 逻辑，仅保留 `styles` 目录的拷贝，`components` 目录现在由编译器自动处理输出到 `dist`。

## 影响范围

- **修改文件**:
    - `packages/maintenance/src/build/types.ts`
    - `packages/maintenance/src/build/build.ts`
    - `release/groups.ts`
- **删除文件**:
    - `packages/vitepress-theme/tsdown.config.ts`
- **依赖变更**:
    - 根目录 `devDependencies` 新增 `@vitejs/plugin-vue`, `vue`, `@tsdown/css`
