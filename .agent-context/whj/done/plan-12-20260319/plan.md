# 封装 VitePress 水墨丹青主题为独立可复用包

> 状态: 已执行

## 目标

将 `docs/.vitepress/theme/` 下的水墨丹青主题（样式、组件、composables）以及 `docs/.vitepress/markdown/`、`docs/.vitepress/plugins/` 下的通用 markdown-it 扩展和 Vite 插件，封装为一个独立的 npm 包 `@cat-kit/vitepress-theme`，使得其他 VitePress 2 项目可以通过安装该包快速获得相同的主题效果和功能组件。

### 边界定义

**包含（提取到主题包）：**

- CSS 变量系统（墨色系统、纸张系统、VP 变量覆盖、暗色模式）
- 全部组件样式覆盖（按钮、卡片、导航栏、侧边栏、代码块、提示框、首页布局等）
- 响应式样式、滚动条美化、`prefers-reduced-motion` 支持
- `texture.jpg` 背景纹理
- `CatKitLayout.vue` 自定义 Layout
- 通用装饰组件：`CloudPatterns.vue`、`SealStamp.vue`、`BrushStrokes.vue`
- Demo 系统组件：`DemoContainer.vue`、`Console.vue`、`CodeViewer.vue`
- `Mermaid.vue` 渲染组件
- Composables：`useFullscreen`、`useDraggable`、`useConsoleInterceptor`
- Markdown-it 插件：`demo-container.ts`（demoContainer）
- Markdown-it 插件：`mermaid.ts`（mermaidPlugin）
- Vite 插件：`import-examples.ts`（importExamples）

**不包含（保留在 docs 项目）：**

- `config.ts`（含项目专属 nav、head、social links 等）
- `sidebar.ts`
- `shared.ts`（DOCS_DIR / EXAMPLES_DIR 常量，与 demo 系统紧耦合，需改为配置化）
- `scripts/check-links.ts`
- `docs/content/`、`docs/examples/` 内容文件

## 内容

### 步骤 1：创建包骨架

在 `packages/vitepress-theme/` 下创建包结构：

```
packages/vitepress-theme/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # 主题入口（default export）
│   ├── config.ts             # 导出 defineThemeConfig 辅助函数
│   ├── styles/
│   │   ├── custom.css        # 全部主题 CSS
│   │   └── texture.jpg       # 背景纹理
│   ├── components/
│   │   ├── CatKitLayout.vue
│   │   ├── CloudPatterns.vue
│   │   ├── SealStamp.vue
│   │   ├── BrushStrokes.vue
│   │   ├── DemoContainer.vue
│   │   ├── Console.vue
│   │   ├── CodeViewer.vue
│   │   └── Mermaid.vue
│   ├── composables/
│   │   ├── index.ts
│   │   ├── useConsoleInterceptor.ts
│   │   ├── useDraggable.ts
│   │   └── useFullscreen.ts
│   ├── markdown/
│   │   ├── demo-container.ts
│   │   └── mermaid.ts
│   └── plugins/
│       └── import-examples.ts
└── README.md
```

`package.json` 关键配置：

- `name`: `@cat-kit/vitepress-theme`
- `type`: `module`
- `exports`: 双入口（`dist` + `src`），额外导出 `./config` 子路径供用户 config 中使用
- `peerDependencies`: `vitepress@^2.0.0`, `vue@^3.5.0`
- `dependencies`: `lucide-vue-next`, `markdown-it-container`, `shiki`, `mermaid`（仅供 Mermaid 组件 dynamic import）
- 内部依赖: `@cat-kit/core`（str 工具）、`@cat-kit/fe`（clipboard 工具）

### 步骤 2：迁移样式文件

1. 将 `docs/.vitepress/theme/styles/custom.css` 复制到 `packages/vitepress-theme/src/styles/custom.css`
2. 将 `docs/.vitepress/theme/styles/texture.jpg` 复制到 `packages/vitepress-theme/src/styles/texture.jpg`
3. 修正 `custom.css` 中 `background: url(texture.jpg)` 的路径引用，确保在包内和消费者项目中都能正确解析

### 步骤 3：迁移组件

1. 将所有 `.vue` 组件复制到 `packages/vitepress-theme/src/components/`
2. 修正组件内部的相对导入路径（`../composables` → 调整为包内相对路径）
3. `DemoContainer.vue` 中 `import { clipboard } from '@cat-kit/fe'` 保持不变（作为 peerDependency 或 dependency）

### 步骤 4：迁移 composables

1. 将 composables 目录复制到 `packages/vitepress-theme/src/composables/`
2. 路径无须调整（内部引用均为同级相对路径）

### 步骤 5：迁移 markdown 插件和 Vite 插件

1. 复制 `demo-container.ts`、`mermaid.ts` 到 `packages/vitepress-theme/src/markdown/`
2. 复制 `import-examples.ts` 到 `packages/vitepress-theme/src/plugins/`
3. **关键改造**：将 `shared.ts` 中硬编码的 `EXAMPLES_DIR` 改为参数化配置
   - `demoContainer(md, options)` 接收 `{ examplesDir: string }` 参数
   - `importExamples(options)` 接收 `{ examplesDir: string }` 参数
   - 由消费者在 VitePress config 中传入自己的 examples 目录路径

### 步骤 6：创建主题入口 `src/index.ts`

```ts
import DefaultTheme from 'vitepress/theme'
import CatKitLayout from './components/CatKitLayout.vue'
import DemoContainer from './components/DemoContainer.vue'
import Mermaid from './components/Mermaid.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: CatKitLayout,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component('Mermaid', Mermaid)
  }
}

// 导出各模块供按需使用
export { CatKitLayout } from './components/CatKitLayout.vue'
export * from './composables'
export { demoContainer } from './markdown/demo-container'
export { mermaidPlugin } from './markdown/mermaid'
export { importExamples } from './plugins/import-examples'
```

### 步骤 7：创建 `src/config.ts` 辅助函数

提供一个 `defineThemeConfig` 辅助函数，帮助消费者快速配置 VitePress markdown 和 vite 插件：

```ts
import type { UserConfig } from 'vitepress'

export interface CatKitThemeOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string
}

export function defineThemeConfig(options: CatKitThemeOptions): Partial<UserConfig> {
  return {
    markdown: {
      lineNumbers: true,
      config: async (md) => {
        const { demoContainer } = await import('./markdown/demo-container')
        const { mermaidPlugin } = await import('./markdown/mermaid')
        md.use(await demoContainer({ examplesDir: options.examplesDir }))
        md.use(mermaidPlugin)
      }
    },
    vite: {
      plugins: [
        (await import('./plugins/import-examples')).importExamples({
          examplesDir: options.examplesDir
        })
      ]
    }
  }
}
```

### 步骤 8：改造 docs 项目消费新主题包

1. **docs/package.json**：添加 `@cat-kit/vitepress-theme: workspace:*` 依赖
2. **docs/.vitepress/theme/index.ts**：改为从 `@cat-kit/vitepress-theme` 导入主题并 re-export
3. **docs/.vitepress/config.ts**：在 markdown 和 vite 配置中使用主题包导出的函数
4. 删除 docs 中已迁移到包内的文件（components、composables、styles、markdown、plugins 中已迁移的部分）
5. 保留 docs 项目专属的 `config.ts`、`sidebar.ts`、`shared.ts`

### 步骤 9：构建配置

1. 在 `release/build.ts` 中添加 `@cat-kit/vitepress-theme` 的构建配置
2. 由于包含 `.vue` 文件和 `.css` 文件，构建工具（tsdown）需配置 Vue 插件支持
3. 确保 `.css` 和 `.jpg` 等静态资源被正确复制或内联到构建产物中
4. 如果 tsdown 对 Vue SFC 支持有限，考虑仅发布 `src` 源码（不构建），消费者通过 VitePress 的 Vite 管线直接处理

### 步骤 10：验证与测试

1. 在 docs 项目中 `bun install` 确保依赖解析正确
2. 运行 `cd docs && bun run dev`，验证：
   - 首页水墨丹青主题正常渲染（亮色/暗色模式）
   - 所有装饰组件（祥云、印章、笔触）正常显示
   - Demo 容器功能正常（预览、代码查看、全屏、控制台）
   - Mermaid 图表正常渲染
   - 响应式布局正常
3. 运行 `cd docs && bun run build`，确保生产构建无报错

## 影响范围

### 新增

- `packages/vitepress-theme/package.json`
- `packages/vitepress-theme/tsconfig.json`
- `packages/vitepress-theme/README.md`
- `packages/vitepress-theme/src/index.ts`
- `packages/vitepress-theme/src/config.ts`
- `packages/vitepress-theme/src/styles/custom.css`
- `packages/vitepress-theme/src/styles/texture.jpg`
- `packages/vitepress-theme/src/components/CatKitLayout.vue`
- `packages/vitepress-theme/src/components/CloudPatterns.vue`
- `packages/vitepress-theme/src/components/SealStamp.vue`
- `packages/vitepress-theme/src/components/BrushStrokes.vue`
- `packages/vitepress-theme/src/components/DemoContainer.vue`
- `packages/vitepress-theme/src/components/Console.vue`
- `packages/vitepress-theme/src/components/CodeViewer.vue`
- `packages/vitepress-theme/src/components/Mermaid.vue`
- `packages/vitepress-theme/src/composables/index.ts`
- `packages/vitepress-theme/src/composables/useConsoleInterceptor.ts`
- `packages/vitepress-theme/src/composables/useDraggable.ts`
- `packages/vitepress-theme/src/composables/useFullscreen.ts`
- `packages/vitepress-theme/src/markdown/demo-container.ts`
- `packages/vitepress-theme/src/markdown/mermaid.ts`
- `packages/vitepress-theme/src/plugins/import-examples.ts`

### 修改

- `docs/package.json` — 添加 `@cat-kit/vitepress-theme` 依赖，移除已迁移的直接依赖
- `docs/.vitepress/theme/index.ts` — 改为从主题包导入
- `docs/.vitepress/config.ts` — 收敛和集成通过 extends 设置主题配置，不再手动逐个导入配置
- `packages/vitepress-theme/src/index.ts` — 删除会造成浏览器报错的 Node.js 模块导出
- `packages/vitepress-theme/src/config.ts` — 导出配置以供使用

### 删除

- `docs/.vitepress/theme/CatKitLayout.vue`
- `docs/.vitepress/theme/components/` (全部 7 个 .vue 文件)
- `docs/.vitepress/theme/composables/` (全部 4 个 .ts 文件)
- `docs/.vitepress/theme/styles/` (custom.css + texture.jpg)
- `docs/.vitepress/markdown/` (demo-container.ts)
- `docs/.vitepress/plugins/` (import-examples.ts + mermaid.ts)

## 历史补丁

- patch-1: 封装 Vite 和 Markdown 配置
- patch-2: 修复 VitePress 配置文件解析缺失扩展名的错误
