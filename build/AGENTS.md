# build - 构建系统

本文件为 `build` 目录提供详细的开发指导。

## 概述

`build` 目录包含 Cat-Kit monorepo 的构建入口，负责编译和打包所有包。

**目录位置**：`build/`
**构建工具**：tsdown（基于 Rolldown）
**运行环境**：Node.js（使用 Bun）

> **注意**：核心构建逻辑（`Monorepo` 类）已迁移至 `@cat-kit/maintenance` 包。
> 本目录现在主要作为构建入口和配置文件存放处。
