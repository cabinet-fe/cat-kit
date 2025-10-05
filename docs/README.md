# CatKit 文档

这是 CatKit 的官方文档站点，使用 VitePress 构建。

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发

启动开发服务器：

```bash
bun run dev
```

或在项目根目录运行：

```bash
bun run docs:dev
```

访问 http://localhost:5173

### 构建

构建生产版本：

```bash
bun run build
```

或在项目根目录运行：

```bash
bun run docs:build
```

### 预览

预览构建后的文档：

```bash
bun run preview
```

或在项目根目录运行：

```bash
bun run docs:preview
```

## 文档结构

```
docs/
├── .vitepress/              # VitePress 配置
│   ├── config.ts           # 站点配置
│   └── theme/              # 自定义主题
│       ├── index.ts        # 主题入口
│       ├── components/     # 自定义组件
│       │   └── DemoContainer.vue  # 示例容器组件
│       └── styles/         # 自定义样式
│           └── custom.css
├── public/                 # 静态资源
│   └── logo.svg           # Logo
├── index.md               # 首页
├── guide/                 # 指南
│   ├── getting-started.md
│   ├── installation.md
│   └── best-practice.md
├── core/                  # 核心工具文档
│   ├── data/             # 数据处理
│   ├── date/             # 日期工具
│   ├── optimize/         # 性能优化
│   └── pattern/          # 设计模式
├── crypto/               # 加密工具文档
│   ├── symmetric/        # 对称加密
│   ├── digest/           # 哈希摘要
│   ├── key-gen/          # 密钥生成
│   └── base/             # 基础
├── fe/                   # 前端工具文档
│   ├── storage/          # 存储管理
│   ├── file/             # 文件操作
│   ├── web-api/          # Web API
│   └── virtualizer/      # 虚拟滚动
└── http/                 # HTTP 工具文档
    └── index.md
```

## 编写文档

### 基本格式

```markdown
---
outline: deep
---

# 标题

描述内容...

## API 参考

### 函数名

函数描述。

#### 类型签名

\`\`\`typescript
function example(param: string): string
\`\`\`

#### 参数

| 参数  | 类型     | 说明     |
| ----- | -------- | -------- |
| param | `string` | 参数说明 |

#### 示例

\`\`\`typescript
import { example } from '@cat-kit/core'

const result = example('hello')
\`\`\`
```

### 添加交互示例

使用 `<Demo>` 组件创建交互示例：

```vue
<script setup>
import { ref } from 'vue'

const value = ref('')

function doSomething() {
  // 实现逻辑
}
</script>

<Demo title="示例标题">
<template #demo>
  <div>
    <!-- 交互界面 -->
    <input v-model="value" />
    <button @click="doSomething">执行</button>
  </div>
</template>

<template #code>

\`\`\`typescript
// 示例代码
import { example } from '@cat-kit/core'

const result = example(value)
\`\`\`

</template>
</Demo>
```

### 提示框

```markdown
::: tip 提示
这是一个提示
:::

::: warning 警告
这是一个警告
:::

::: danger 危险
这是一个危险提示
:::

::: info 信息
这是一条信息
:::
```

### 代码组

```markdown
::: code-group

\`\`\`bash [npm]
npm install @cat-kit/core
\`\`\`

\`\`\`bash [pnpm]
pnpm add @cat-kit/core
\`\`\`

\`\`\`bash [yarn]
yarn add @cat-kit/core
\`\`\`

\`\`\`bash [bun]
bun add @cat-kit/core
\`\`\`

:::
```

## 主题定制

### 颜色

在 `docs/.vitepress/theme/styles/custom.css` 中定制颜色：

```css
:root {
  --vp-c-brand-1: #5f67ee;
  --vp-c-brand-2: #7c84f5;
  --vp-c-brand-3: #989ef8;
}
```

### 自定义组件

在 `docs/.vitepress/theme/components/` 中添加自定义组件，然后在 `theme/index.ts` 中注册：

```typescript
import CustomComponent from './components/CustomComponent.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomComponent', CustomComponent)
  }
}
```

## 部署

### GitHub Pages

在 `.github/workflows/deploy.yml` 中配置：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: |
          cd docs
          bun install

      - name: Build
        run: |
          cd docs
          bun run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### Vercel

1. 在 Vercel 导入项目
2. 设置构建命令：`cd docs && bun install && bun run build`
3. 设置输出目录：`docs/.vitepress/dist`
4. 部署

### Netlify

1. 在 Netlify 导入项目
2. 设置构建命令：`cd docs && bun install && bun run build`
3. 设置发布目录：`docs/.vitepress/dist`
4. 部署

## 文档状态

目前的文档分为两类：

- ✅ **完整文档**：包含详细的 API 说明、交互示例和使用场景

  - 核心工具：数组、字符串
  - 加密工具：AES、MD5、SHA256、NanoID
  - 前端工具：Storage
  - HTTP 工具：概述和完整示例
  - 指南：快速开始、安装、最佳实践

- 📝 **占位文档**：标记为"开发中"的页面，包含基本结构和导入示例
  - 其他核心工具、前端工具等

欢迎贡献完善这些占位文档！

## 贡献

欢迎为文档做出贡献！请确保：

1. 文档内容准确完整
2. 代码示例可运行
3. 遵循现有的文档格式
4. 提供交互示例（如适用）
5. 添加前置元数据（创建时间、贡献者）

## 参考资料

- [VitePress 官方文档](https://vitepress.dev/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Markdown 语法](https://www.markdownguide.org/)
