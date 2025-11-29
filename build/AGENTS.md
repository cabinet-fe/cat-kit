# build - 构建系统

本文件为 `build` 目录提供详细的开发指导。

## 概述

`build` 目录包含 Cat-Kit monorepo 的自定义构建系统，负责编译和打包所有包。

**目录位置**：`build/`
**构建工具**：tsdown（基于 Rolldown）
**运行环境**：Node.js（使用 Bun）

## 目录结构

```
build/
├── index.ts           # 构建入口（CLI）
├── repo.ts            # MonoRepoLib 类（构建编排）
├── pkgs.ts            # 包配置列表
├── types.ts           # TypeScript 类型定义
├── release.ts         # 发布脚本
├── stats.tsx          # Bundle 分析可视化组件
├── stats.html         # Bundle 分析 HTML 模板
├── package.json
└── tsconfig.json
```

## 核心文件说明

### index.ts - 构建入口

提供命令行接口（CLI）：

```bash
# 构建所有包
bun run build

# 分析 bundle 大小
bun run analyze
```

### repo.ts - 构建编排器

`MonoRepoLib` 类负责整个构建流程的编排：

**核心功能**：
1. 读取所有包的 `package.json`
2. 解析包依赖关系
3. 按依赖顺序分批构建（依赖已满足的包并行构建）
4. 生成 bundle 分析报告

**关键方法**：
```typescript
class MonoRepoLib {
  /** 构建所有包（按依赖顺序） */
  async build(): Promise<void>

  /** 构建单个包 */
  private async buildPackage(pkg: PackageConfig): Promise<void>

  /** 获取待构建包（依赖已满足） */
  private getPkgsToBuild(): PackageConfig[]
}
```

### pkgs.ts - 包配置

定义所有需要构建的包及其配置：

```typescript
export const pkgs: PackageOption[] = [
  {
    dir: pkg('core'),
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: pkg('fe'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  // ... 其他包
]
```

**配置选项**：
- `dir`：包目录的绝对路径
- `deps`：包的依赖列表（用于构建顺序）
- `build`：tsdown 构建选项
  - `input`：入口文件
  - `external`：外部依赖（不打包）
- `output`：（可选）自定义输出配置

### types.ts - 类型定义

定义构建系统使用的 TypeScript 类型：

```typescript
export interface PackageOption {
  /** 包目录 */
  dir: string
  /** 包依赖列表 */
  deps?: string[]
  /** tsdown 构建选项 */
  build: BuildOptions
  /** 输出配置 */
  output?: OutputOptions
}

export interface PackageConfig extends PackageOption {
  /** 包名称（从 package.json 读取） */
  name: string
}
```

## 构建流程

### 1. 初始化

```typescript
await this.initPackages()
```

- 读取所有包的 `package.json`
- 生成 `PackageConfig` 数组
- 验证必要字段（如 `name`）

### 2. 依赖分析

构建系统会自动分析依赖关系，并分批构建：

**批次示例**：
```
批次 1（无依赖）:
  - @cat-kit/core

批次 2（依赖 core）:
  - @cat-kit/fe
  - @cat-kit/http
  - @cat-kit/be
  - @cat-kit/excel
```

每个批次内的包并行构建，批次之间串行执行。

### 3. 包构建

每个包使用 tsdown 进行构建：

```typescript
await build({
  entry: path.resolve(dir, build.input),
  format: 'esm',
  outDir: path.resolve(dir, 'dist'),
  dts: true,
  sourcemap: true,
  minify: true,
  external: build.external || [],
  plugins: [
    visualizer({
      filename: path.resolve(dir, 'dist', 'stats.html'),
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

**构建产物**：
- `dist/index.js` - ES 模块（压缩）
- `dist/index.d.ts` - TypeScript 类型声明
- `dist/index.js.map` - Sourcemap
- `dist/stats.html` - Bundle 分析报告

### 4. Bundle 分析

每个包构建完成后，会生成 `stats.html` 文件，可视化展示：
- 模块大小
- 依赖关系
- Gzip 和 Brotli 压缩大小

## 添加新包到构建系统

### 步骤

1. **在 `pkgs.ts` 中添加配置**：

```typescript
export const pkgs: PackageOption[] = [
  // ... 现有包
  {
    dir: pkg('new-package'),
    deps: ['@cat-kit/core'], // 如果有依赖
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core'] // 外部依赖
    }
  }
]
```

2. **确保包结构正确**：
   - `package.json` 包含 `name` 字段
   - 存在 `src/index.ts` 入口文件
   - `package.json` 配置了正确的 `exports`

3. **运行构建**：
```bash
cd build
bun run build
```

4. **检查产物**：
   - `packages/new-package/dist/` 目录应该包含构建产物
   - 查看 `dist/stats.html` 确认 bundle 大小

## 修改构建配置

### 添加外部依赖

如果包依赖新的外部库，需要添加到 `external` 数组：

```typescript
{
  dir: pkg('my-package'),
  deps: ['@cat-kit/core', 'lodash'],
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core', 'lodash'] // 不打包 lodash
  }
}
```

### 自定义输出格式

虽然默认只输出 ESM，但可以通过 `output` 选项自定义：

```typescript
{
  dir: pkg('my-package'),
  build: {
    input: 'src/index.ts'
  },
  output: {
    format: ['esm', 'cjs'], // 同时输出 ESM 和 CJS
  }
}
```

### 修改入口文件

如果包有多个入口点：

```typescript
{
  dir: pkg('my-package'),
  build: {
    input: {
      index: 'src/index.ts',
      utils: 'src/utils/index.ts'
    }
  }
}
```

## 运行构建

### 构建所有包

```bash
cd build
bun run build
```

输出示例：
```
🚀 开始构建...

批次 1: 1 个包
  ✓ @cat-kit/core (1.2s)

批次 2: 4 个包
  ✓ @cat-kit/fe (0.8s)
  ✓ @cat-kit/http (0.7s)
  ✓ @cat-kit/be (0.6s)
  ✓ @cat-kit/excel (1.5s)

✨ 构建完成！总耗时: 3.8s
```

### 分析 Bundle

```bash
cd build
bun run analyze
```

会在浏览器中打开 bundle 分析页面，展示所有包的大小和依赖关系。

### 清理构建产物

```bash
# 手动清理所有 dist 目录
rm -rf packages/*/dist
```

## 构建优化

### 并行构建

构建系统会自动并行构建同一批次的包，无需手动配置。

### 增量构建

当前不支持增量构建。每次运行都会完全重新构建所有包。

**优化建议**：
- 如果只修改了某个包，可以手动进入该包目录单独构建（需要实现）
- 或者使用 watch 模式（需要实现）

### Bundle 大小优化

1. **Tree-shaking**：默认启用，确保只导出需要的内容
2. **External**：将共享依赖标记为 external
3. **Minify**：默认启用代码压缩

查看 `dist/stats.html` 识别体积大的模块。

## 发布流程

### release.ts

包含包的发布逻辑（待实现）。

**建议流程**：
1. 运行测试确保通过
2. 运行构建生成产物
3. 更新版本号
4. 发布到 npm
5. 创建 Git tag

## 故障排除

### 构建失败

1. **依赖未安装**：
   ```bash
   bun install
   ```

2. **TypeScript 错误**：
   检查包的 `tsconfig.json` 和源代码类型错误

3. **循环依赖**：
   检查 `deps` 配置，确保没有循环依赖

### Bundle 过大

1. 查看 `dist/stats.html` 识别大模块
2. 检查是否有不必要的依赖
3. 考虑代码分割

### 构建速度慢

1. 减少不必要的包
2. 优化 TypeScript 编译（`tsconfig.json`）
3. 使用更快的硬件（SSD、更多 CPU 核心）

## 技术栈

- **tsdown**：基于 Rolldown 的 TypeScript 打包工具
- **rollup-plugin-visualizer**：Bundle 分析插件
- **fs-extra**：增强的文件系统操作
- **picocolors**：终端颜色输出

## 常见任务

### 添加新包
→ 编辑 `pkgs.ts`，添加包配置

### 修改构建选项
→ 编辑 `pkgs.ts`，更新 `build` 字段

### 添加新的构建步骤
→ 编辑 `repo.ts`，在 `build()` 或 `buildPackage()` 中添加逻辑

### 自定义 Bundle 分析
→ 编辑 `stats.tsx`，修改可视化组件

## 配置文件

### package.json

```json
{
  "name": "build",
  "type": "module",
  "scripts": {
    "build": "bun run index.ts",
    "analyze": "bun run index.ts --analyze"
  }
}
```

### tsconfig.json

继承根目录的 TypeScript 配置。

## 未来改进

建议的改进方向：
1. **增量构建**：只重新构建修改的包
2. **Watch 模式**：监听文件变化自动重建
3. **并发限制**：配置最大并发构建数
4. **构建缓存**：缓存未修改包的构建结果
5. **发布自动化**：完善 `release.ts`，自动化发布流程
