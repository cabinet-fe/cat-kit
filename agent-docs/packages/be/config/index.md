---
title: "@cat-kit/be 配置管理"
description: "解析 .env、按 schema 校验环境变量、加载 JSON/YAML/TOML 配置并深合并"
keywords:
  - loadEnv
  - parseEnv
  - parseEnvFile
  - loadConfig
  - mergeConfig
  - EnvDefinition
  - LoadEnvOptions
  - 环境变量
  - 配置加载
  - 深合并
aliases:
  - dotenv
  - env 校验
  - 配置管理
  - js-yaml
  - smol-toml
---

# 配置管理

配置管理覆盖三类需求：解析 `.env` 文件（`parseEnvFile`、`loadEnv`）、按 schema 校验并转换环境变量（`parseEnv`）、加载 JSON/YAML/TOML 配置文件并深度合并（`loadConfig`、`mergeConfig`）。

详情见 [API](apis.md) 与 [示例](examples.md)。

## 注意事项

- `loadEnv`：文件缺失时忽略；默认按 `.env` → `.env.local` → `.env.${mode}` → `.env.${mode}.local` 顺序加载，后文件覆盖前者；`override: false`（默认）不覆盖 `process.env` 已有值；默认注入 `process.env`（`injectToProcess` 控制）
- `parseEnv` 的 `required: true` 在原始值为空时失败，即使定义了 `default`
- `loadConfig` 解析 YAML/TOML 时动态导入 `js-yaml`、`smol-toml`（可选 peer 依赖），未安装会抛出可理解的错误
- `mergeConfig` 深合并普通对象、数组整体替换、不修改入参

## 类型定义

- `parseEnvFile`、`loadEnv`、`parseEnv`、`EnvDefinition`、`LoadEnvOptions`
- `loadConfig`、`LoadConfigOptions`
- `mergeConfig`
