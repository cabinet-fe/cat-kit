---
title: "defineThemeConfig VitePress 站点配置函数"
description: 从 @cat-kit/vitepress-theme/config 导出的 defineThemeConfig、demoContainer、mermaidPlugin、importExamples：生成或拆配 VitePress 的 markdown 与 vite 插件配置，接入 Demo 容器与 Mermaid 图表。
aliases: [config api, 配置 API, theme config, 插件函数签名, defineThemeConfig]
keywords: [defineThemeConfig, demoContainer, mermaidPlugin, importExamples, CatKitThemeOptions, DemoContainerOptions, ImportExamplesOptions, MarkdownRenderer, examplesDir, lineNumbers, md-transform, Demo路径不能为空, UserConfig, Shiki, 站点配置]
---

# defineThemeConfig VitePress 站点配置函数

`@cat-kit/vitepress-theme/config` 导出配置函数 `defineThemeConfig` 与 3 个可单独使用的插件 `demoContainer`（markdown-it 容器）、`mermaidPlugin`（fence 渲染替换）、`importExamples`（Vite 插件），以及参数类型 `CatKitThemeOptions`、`DemoContainerOptions`、`ImportExamplesOptions`。`defineThemeConfig` 内部组合这 3 个插件；需要自定义 `markdown.config` 或 `vite.plugins` 时改用单独插件。

## 快速上手

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { defineThemeConfig } from '@cat-kit/vitepress-theme/config'

// examples 目录的绝对路径，demo 容器与示例导入都基于它解析
const examplesDir = fileURLToPath(new URL('../examples', import.meta.url))

export default defineConfig({
  title: 'My Docs',
  ...defineThemeConfig({ examplesDir })
})
```

配置生效后，Markdown 中即可使用：

````md
::: demo basic-counter.vue
:::

```mermaid
graph LR
  A --> B
```
````

## API 签名

```ts
import type { MarkdownRenderer, Plugin, UserConfig } from 'vitepress'

/** defineThemeConfig / demoContainer / importExamples 共用的参数形态 */
export interface CatKitThemeOptions {
  /** examples 目录的绝对路径。必填 */
  examplesDir: string
}

export interface DemoContainerOptions {
  /** examples 目录的绝对路径。必填 */
  examplesDir: string
}

export interface ImportExamplesOptions {
  /** examples 目录的绝对路径。必填 */
  examplesDir: string
}

/**
 * 生成 CatKit 主题的站点配置片段，在 VitePress config 中展开合并
 */
export declare function defineThemeConfig(options: CatKitThemeOptions): Partial<UserConfig>

/**
 * 注册 ::: demo 容器。异步：首次调用初始化 Shiki highlighter（进程内缓存）
 * demo 路径为空时抛出 Error('Demo路径不能为空')
 */
export declare const demoContainer: (
  md: MarkdownRenderer,
  options: DemoContainerOptions
) => Promise<void>

/**
 * 把 info 为 mermaid 的围栏代码块替换为 <Mermaid> 组件。同步
 */
export declare function mermaidPlugin(md: MarkdownRenderer): void

/**
 * Vite 插件（name 'md-transform'，enforce 'pre'），为 .md 中的 ::: demo 生成组件 import
 */
export declare function importExamples(options: ImportExamplesOptions): Plugin
```

`MarkdownRenderer`、`Plugin`、`UserConfig` 均来自 `vitepress`。

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `options.examplesDir` | `string` | — | 是 | 文件系统绝对路径；`demoContainer` 用 `path.join` 拼接示例文件路径，`importExamples` 用 `path.relative` 计算生成 import 的相对路径 |
| `md` | `MarkdownRenderer` | — | 是 | VitePress `markdown.config(md)` 回调的入参，markdown-it 实例 |
| `mermaidPlugin` 返回 | `void` | — | — | 同步，无返回值 |
| `demoContainer` 返回 | `Promise<void>` | — | — | 异步，`markdown.config` 回调本身为 async，直接 `await` |
| `importExamples` 返回 | `Plugin` | — | — | 放入 `vite.plugins`；只处理 `.md` 文件，其余文件直接跳过 |

### defineThemeConfig 返回值

| 字段 | 值 | 行为 |
| --- | --- | --- |
| `markdown.lineNumbers` | `true` | 所有代码块显示行号 |
| `markdown.config` | `async (md) => void` | `await demoContainer(md, { examplesDir })` 后 `md.use(mermaidPlugin)` |
| `vite.plugins` | `[importExamples({ examplesDir })]` | 为页面中的 `::: demo` 生成 `<script setup>` import |

## 典型示例

### 自定义 markdown.config 时手动接入 demo 容器与 Mermaid

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { demoContainer, mermaidPlugin } from '@cat-kit/vitepress-theme/config'

const examplesDir = fileURLToPath(new URL('../examples', import.meta.url))

export default defineConfig({
  markdown: {
    lineNumbers: true,
    config: async (md) => {
      // demoContainer 是异步函数，必须 await
      await demoContainer(md, { examplesDir })
      md.use(mermaidPlugin)
    }
  }
})
```

### 自定义 vite.plugins 时单独接入示例导入插件

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { importExamples } from '@cat-kit/vitepress-theme/config'

const examplesDir = fileURLToPath(new URL('../examples', import.meta.url))

export default defineConfig({
  vite: {
    plugins: [
      importExamples({ examplesDir })
      // 其他 vite 插件写在这里，importExamples 的 enforce 为 'pre'，先于其余插件执行
    ]
  }
})
```

### Markdown 写法与页面产物

```md
::: demo basic-counter.vue
:::
```

`importExamples` 读取该行后，在 frontmatter 之后插入 `<script setup>` 与 `import BasicCounter from '<相对路径>'`（组件名 = 文件名去 `.vue` 后转 PascalCase）；`demoContainer` 输出 `<DemoContainer>` 标签，页面得到预览、源码高亮（Shiki，语言固定 `vue`，主题 `github-light` / `github-dark`）、复制、控制台与全屏能力。指向的文件不存在时输出不带源码的占位容器。

## 注意事项

> [!WARNING]
> - 本库配置入口从 `@cat-kit/vitepress-theme/config` 导入，不是包根；包根导出的是主题对象与组合式函数。
> - 本库 `examplesDir` 是文件系统绝对路径，不是相对于站点根目录的 URL 路径；传相对路径时示例文件读取失败。
> - `defineThemeConfig` 会把 `markdown.lineNumbers` 设为 `true`；与官方默认主题不同，全部代码块带行号。
> - `mermaidPlugin` 的围栏匹配区分大小写：只替换 info 为 `mermaid` 的代码块，`Mermaid`、`mermaid-js` 不替换。
> - `:::` 与 `demo` 之间必须至少一个空格，容器必须有配对的收尾 `:::`；`:::demo` 不满足 `importExamples` 的匹配正则，容器未收尾时 markdown-it-container 不输出 `<DemoContainer>` 标签。

## 常见问题

### 报错 `Error: Demo路径不能为空`

原因：`::: demo` 之后没有写路径。修复：补上相对 `examplesDir` 的文件路径。

```md
::: demo basic-counter.vue
:::
```

### 示例容器渲染了，但预览区空白

原因：`:::demo` 写成无空格形式，`importExamples` 未生成 import，`DemoContainer` 的 `is` 为 `undefined`；构建不报错，预览区为空。修复：`:::` 与 `demo` 之间写一个空格。

```md
::: demo basic-counter.vue
:::
```
