# release 指南

构建发布入口，负责编译、打包、发布 Cat-Kit 的所有子包。

**构建工具**：tsdown（基于 Rolldown）
**运行环境**：Node.js（使用 Bun）

## 目录结构

```
release/
├── build.ts           # 构建入口脚本
├── bundle.ts          # 打包配置
├── copy-assets.ts     # 资源文件复制
├── release.ts         # 发布流程
├── repo.ts            # Monorepo 实例化
├── stats.tsx           # 构建产物分析
├── stats.html          # 构建产物分析报告
├── package.json
└── tsconfig.json
```

## 常用命令

```bash
# 构建所有包
bun run build.ts

# 发布
bun run release.ts
```
