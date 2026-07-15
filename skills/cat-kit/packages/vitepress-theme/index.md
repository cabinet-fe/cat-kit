# @cat-kit/vitepress-theme

VitePress 2 的水墨风自定义主题，并提供 Demo 容器与 Mermaid 所需的配置辅助。

## 如何选择

- `@cat-kit/vitepress-theme`：在 `.vitepress/theme/index.ts` 中作为主题入口；默认导出已包含布局、全局组件和样式。
- `@cat-kit/vitepress-theme/config`：在 `.vitepress/config.ts` 中配置 Demo 和 Mermaid。
  - 优先用 `defineThemeConfig({ examplesDir })` 一次合并 Markdown 与 Vite 插件。
  - 仅需部分能力时分别使用 `demoContainer`、`mermaidPlugin`、`importExamples`。
- `@cat-kit/vitepress-theme/style.css`：只在自定义组合未使用默认主题入口时显式加载样式。

## 最小示例

```ts
// .vitepress/theme/index.ts
export { default } from '@cat-kit/vitepress-theme'
```

```ts
// .vitepress/config.ts
import { fileURLToPath } from 'node:url'

import { defineThemeConfig } from '@cat-kit/vitepress-theme/config'
import { defineConfig } from 'vitepress'

export default defineConfig(
  defineThemeConfig({ examplesDir: fileURLToPath(new URL('../examples', import.meta.url)) })
)
```

## 约束与边界

- VitePress 自定义主题由 `.vitepress/theme/index.ts` 导出，不是 `defineConfig({ theme: ... })` 配置项。
- `examplesDir` 必须是绝对路径；其中的 `.vue` 文件供 `::: demo relative/path.vue` 引用。
- `defineThemeConfig` 同时写入 `markdown` 和 `vite.plugins`。与其他配置组合时需保留双方嵌套字段，避免浅覆盖。
- Mermaid 围栏需要配置辅助将代码块转换为主题已注册的 `Mermaid` 组件。
- 只使用包根及 `config`、`style.css`、`styles/theme.css` 这些已发布子路径，不导入内部组件文件。

## 精确类型入口

- `@cat-kit/vitepress-theme`：默认主题、`CatKitLayout` 与公开 composables。
- `@cat-kit/vitepress-theme/config`：`CatKitThemeOptions`、`DemoContainerOptions`、`ImportExamplesOptions` 及配置函数。

完整的 Demo 与 Mermaid 组合见 [examples.md](examples.md)。
