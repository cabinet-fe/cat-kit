# docs - VitePress 文档站点

本文件为 `docs` 目录提供详细的开发指导。

## 概述

`docs` 目录包含 Cat-Kit 项目的 VitePress 文档站点，提供完整的 API 文档和交互式示例。

**目录位置**：`docs/`
**文档框架**：VitePress v2.0
**运行环境**：Node.js（使用 Bun）

## 目录结构

```
docs/
├── .vitepress/               # VitePress 配置
│   ├── config.ts             # 主配置文件
│   ├── shared.ts             # 共享配置和常量
│   ├── theme/                # 自定义主题
│   │   ├── index.ts          # 主题入口
│   │   ├── components/       # 主题组件
│   │   │   └── DemoContainer.vue  # 示例容器组件
│   │   └── styles/
│   │       └── custom.css    # 自定义样式
│   ├── markdown/             # Markdown 插件
│   │   └── demo-container.ts # Demo 容器插件
│   └── plugins/              # Vite 插件
│       └── import-examples.ts # 自动导入示例
├── examples/                 # 示例组件（Vue SFC）
│   ├── fe/                   # FE 包示例
│   │   ├── storage/
│   │   │   └── basic.vue
│   │   └── file/
│   └── core/                 # Core 包示例（如有）
├── guide/                    # 指南文档
│   ├── getting-started.md
│   └── installation.md
├── packages/                 # 各包的 API 文档
│   ├── core/
│   │   ├── index.md
│   │   ├── data.md
│   │   └── ...
│   ├── fe/
│   ├── http/
│   ├── be/
│   └── excel/
├── public/                   # 静态资源
│   └── banner.png
├── index.md                  # 首页
├── package.json
└── tsconfig.json
```

## 核心特性

### 1. 交互式示例系统

文档支持嵌入可运行的 Vue 组件示例：

**在 Markdown 中使用**：
```markdown
# 存储示例

这是一个基础的存储示例：

::: demo fe/storage/basic.vue
:::
```

**示例组件**（`docs/examples/fe/storage/basic.vue`）：
```vue
<template>
  <div>
    <var-button @click="saveData">保存数据</var-button>
    <var-button @click="loadData">加载数据</var-button>
    <div>{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setCookie, getCookie } from '@cat-kit/fe/src'

const message = ref('')

function saveData() {
  setCookie('test', 'Hello CatKit!')
  message.value = '数据已保存'
}

function loadData() {
  const value = getCookie('test')
  message.value = `加载的数据: ${value}`
}
</script>
```

**渲染效果**：
- 实际运行的组件（可交互）
- 可展开/收起的源代码
- 语法高亮的代码显示
- 支持明暗主题切换

### 2. 自动导入系统

**组件自动导入**（`import-examples.ts` 插件）：
- 自动扫描 `examples/` 目录
- 自动注册所有示例组件
- 无需手动导入

**API 自动导入**（`unplugin-auto-import`）：
- Vue API（ref, computed, watch 等）
- @varlet/ui 组件

### 3. Demo 容器插件

**Markdown 插件**（`demo-container.ts`）：
- 解析 `::: demo` 语法
- 自动提取组件源代码
- 使用 Shiki 进行语法高亮
- 生成 DemoContainer 组件调用

### 4. 主题定制

**自定义主题组件**：
- `DemoContainer.vue`：示例容器组件，提供代码显示和交互功能

**自定义样式**：
- `custom.css`：全局样式覆盖

## 配置文件详解

### config.ts - 主配置

```typescript
export default defineConfig({
  // 站点元数据
  title: 'CatKit',
  description: '基于 TS 的全环境开发工具包',
  lang: 'zh-CN',

  // 功能配置
  lastUpdated: true,
  cleanUrls: true,

  // 主题配置
  themeConfig: {
    logo: '/banner.png',
    nav: [...], // 导航栏
    sidebar: {...}, // 侧边栏
    socialLinks: [...], // 社交链接
    search: { provider: 'local' } // 本地搜索
  },

  // Markdown 配置
  markdown: {
    config: (md) => {
      md.use(demoContainer) // 使用 demo 容器插件
    }
  },

  // Vite 配置
  vite: {
    plugins: [
      importExamples(), // 自动导入示例
      components({...}), // 组件自动注册
      autoImport({...}) // API 自动导入
    ]
  }
})
```

### DemoContainer.vue - 示例容器

**功能**：
- 显示运行的组件
- 显示/隐藏源代码
- 代码高亮
- 复制代码按钮

**Props**：
```typescript
interface Props {
  component: string  // 组件路径（如 'fe/storage/basic.vue'）
  code: string       // 组件源代码
}
```

## 开发工作流

### 启动开发服务器

```bash
cd docs
bun run dev
```

访问 `http://localhost:5173`

### 添加新文档页面

1. **创建 Markdown 文件**：
   ```bash
   # 例如添加新的 core 包文档
   touch docs/packages/core/my-feature.md
   ```

2. **编写文档内容**：
   ```markdown
   # 我的功能

   这是功能描述。

   ## 基本用法

   \`\`\`typescript
   import { myFunction } from '@cat-kit/core'

   myFunction('hello')
   \`\`\`

   ## 示例

   ::: demo core/my-feature/basic.vue
   :::
   ```

3. **更新侧边栏**（`config.ts`）：
   ```typescript
   sidebar: {
     '/packages/': [
       {
         text: 'Core 核心包',
         items: [
           { text: '概览', link: '/packages/core/' },
           { text: '我的功能', link: '/packages/core/my-feature' } // 新增
         ]
       }
     ]
   }
   ```

### 添加交互式示例

1. **创建示例组件**：
   ```bash
   # 在 examples 目录下创建
   mkdir -p docs/examples/core/my-feature
   touch docs/examples/core/my-feature/basic.vue
   ```

2. **编写示例组件**：
   ```vue
   <template>
     <div>
       <var-button @click="handleClick">点击测试</var-button>
       <div>{{ result }}</div>
     </div>
   </template>

   <script setup lang="ts">
   import { ref } from 'vue'
   import { myFunction } from '@cat-kit/core/src'

   const result = ref('')

   function handleClick() {
     result.value = myFunction('test')
   }
   </script>
   ```

3. **在文档中引用**：
   ```markdown
   ## 交互式示例

   ::: demo core/my-feature/basic.vue
   :::
   ```

4. **示例组件要求**：
   - 使用 Vue 3 Composition API
   - 可以导入任何 `@cat-kit/*` 包（使用 `/src` 路径）
   - 可以使用 `@varlet/ui` 组件库
   - 保持简洁，专注于演示功能

### 更新导航和侧边栏

**导航栏**（`themeConfig.nav`）：
```typescript
nav: [
  { text: '首页', link: '/' },
  { text: '指南', link: '/guide/getting-started' },
  {
    text: '包',
    items: [
      { text: 'Core 核心', link: '/packages/core/' },
      // ... 其他包
    ]
  }
]
```

**侧边栏**（`themeConfig.sidebar`）：
```typescript
sidebar: {
  '/guide/': [
    {
      text: '开始',
      items: [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '安装', link: '/guide/installation' }
      ]
    }
  ],
  '/packages/': [
    {
      text: 'Core 核心包',
      collapsed: false, // 默认展开
      items: [
        { text: '概览', link: '/packages/core/' },
        { text: '数据处理', link: '/packages/core/data' }
      ]
    }
  ]
}
```

## 构建和部署

### 本地构建

```bash
cd docs
bun run build
```

产物生成在 `docs/.vitepress/dist/` 目录。

### 预览构建产物

```bash
cd docs
bun run preview
```

### 部署到生产环境

VitePress 生成静态站点，可以部署到：
- GitHub Pages
- Netlify
- Vercel
- 自己的服务器

**部署步骤**：
1. 运行 `bun run build`
2. 将 `.vitepress/dist/` 目录部署到服务器

## 插件系统

### demo-container.ts

Markdown 插件，解析 `::: demo` 语法。

**工作原理**：
1. 检测 `demo` 容器
2. 读取组件文件
3. 提取源代码
4. 使用 Shiki 高亮
5. 生成 DemoContainer 组件调用

### import-examples.ts

Vite 插件，自动导入示例组件。

**工作原理**：
1. 扫描 `examples/` 目录
2. 生成虚拟模块
3. 导出所有示例组件
4. 在主题中全局注册

## 样式定制

### 自定义颜色

编辑 `.vitepress/theme/styles/custom.css`：

```css
:root {
  --vp-c-brand: #5f67ee;
  --vp-c-brand-light: #7d84f3;
  --vp-c-brand-dark: #4a51d9;
}
```

### 自定义组件样式

在 `.vitepress/theme/styles/custom.css` 中添加：

```css
.demo-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}
```

## 搜索功能

使用 VitePress 内置的本地搜索：

```typescript
themeConfig: {
  search: {
    provider: 'local',
    options: {
      locales: {
        root: {
          translations: {
            button: { buttonText: '搜索' },
            modal: {
              noResultsText: '未找到结果',
              resetButtonTitle: '清空',
              footer: {
                selectText: '选择',
                navigateText: '导航'
              }
            }
          }
        }
      }
    }
  }
}
```

## 常见任务

### 添加新的包文档
1. 在 `docs/packages/` 下创建包目录
2. 添加 `index.md` 和功能文档
3. 更新 `config.ts` 的导航和侧边栏

### 添加新的示例
1. 在 `docs/examples/<package>/` 下创建 `.vue` 文件
2. 在文档中使用 `::: demo` 引用

### 修改主题样式
→ 编辑 `.vitepress/theme/styles/custom.css`

### 添加新的主题组件
→ 在 `.vitepress/theme/components/` 下创建组件

### 修改首页
→ 编辑 `docs/index.md`

## 依赖包

### 核心依赖
- `vitepress`: 文档框架
- `vue`: Vue 3

### 插件
- `vitepress-plugin-llms`: LLM 友好的插件
- `markdown-it-container`: Markdown 容器插件
- `shiki`: 代码语法高亮
- `unplugin-auto-import`: API 自动导入
- `unplugin-vue-components`: 组件自动注册

### UI 库
- `@varlet/ui`: 示例中使用的 UI 组件库
- `@varlet/import-resolver`: Varlet 组件自动导入解析器

## 故障排除

### 示例组件不显示

1. 检查组件路径是否正确
2. 确保组件文件存在于 `examples/` 目录
3. 检查控制台错误

### 构建失败

1. 检查 Markdown 语法
2. 检查示例组件是否有语法错误
3. 运行 `bun install` 确保依赖安装

### 搜索不工作

1. 确保内容已构建
2. 检查搜索配置
3. 清除浏览器缓存

## 最佳实践

### 文档编写

1. **结构清晰**：使用标题层级组织内容
2. **代码示例**：提供完整可运行的代码
3. **API 文档**：包含参数、返回值、示例
4. **交互式演示**：复杂功能提供交互式示例

### 示例组件

1. **简洁明了**：专注于演示单一功能
2. **注释说明**：关键代码添加注释
3. **错误处理**：展示错误处理方式
4. **响应式**：适配不同屏幕尺寸

### 性能优化

1. **图片优化**：使用合适的图片格式和大小
2. **代码分割**：大型示例考虑懒加载
3. **缓存利用**：合理使用浏览器缓存

## 未来改进

建议的改进方向：
1. **API 自动生成**：从 TypeScript 类型自动生成 API 文档
2. **交互式 Playground**：在线编辑和运行代码
3. **多语言支持**：添加英文文档
4. **版本管理**：支持多版本文档
5. **搜索增强**：支持 Algolia 搜索
