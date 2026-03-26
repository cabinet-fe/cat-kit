# @cat-kit/vitepress-theme

> CatKit 水墨丹青 VitePress 主题

## 安装

```bash
bun add @cat-kit/vitepress-theme
```

## 使用

### 主题入口

```ts
// .vitepress/theme/index.ts
import theme from '@cat-kit/vitepress-theme'

export default theme
```

### 配置辅助

```ts
// .vitepress/config.ts
import { demoContainer, mermaidPlugin, importExamples } from '@cat-kit/vitepress-theme'

export default defineConfig({
  markdown: {
    config: async (md) => {
      await demoContainer(md, { examplesDir: '/path/to/examples' })
      md.use(mermaidPlugin)
    }
  },
  vite: { plugins: [importExamples({ examplesDir: '/path/to/examples' })] }
})
```

## 功能

- 水墨丹青主题（亮色/暗色模式）
- Demo 容器组件（预览、代码查看、全屏、控制台）
- Mermaid 图表渲染
- 祥云、印章、笔触等装饰组件
- 响应式布局
- `prefers-reduced-motion` 支持
