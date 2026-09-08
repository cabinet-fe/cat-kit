---
title: "@cat-kit/be 配置模块总览"
description: "@cat-kit/be 配置模块总览：.env 解析与加载、schema 校验环境变量、JSON/YAML/TOML 配置文件加载与深度合并的入口与选型。"
aliases: [config, 配置管理, 环境变量, dotenv, 配置加载]
keywords: [loadEnv, parseEnv, parseEnvFile, loadConfig, mergeConfig, EnvRecord, LoadEnvOptions, EnvDefinition, EnvSchema, ConfigFormat, LoadConfigOptions, 环境变量, 配置文件, 深合并, env 校验, 默认值]
---

# @cat-kit/be 配置模块总览

配置模块从 `@cat-kit/be` 包根导出五个函数：`parseEnvFile`（解析 `.env` 文本）、`loadEnv`（按优先级读取多个 `.env` 文件并注入 `process.env`）、`parseEnv`（按 schema 校验转换环境变量）、`loadConfig`（加载 JSON / YAML / TOML 配置文件）、`mergeConfig`（深度合并多个配置对象）。

## 安装

```bash
bun add @cat-kit/be
```

配置相关导出从包根导入：

```ts
import { loadEnv, parseEnv, loadConfig, mergeConfig } from '@cat-kit/be'
```

YAML 解析依赖 `js-yaml`，TOML 解析依赖 `smol-toml`，两者随 `@cat-kit/be` 一起安装，无需单独安装。JSON 解析无外部依赖。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `parseEnvFile` | 把 `.env` 文件内容解析为键值对，支持 `export` 前缀、引号与注释 | `packages/be/config/apis.md` |
| `loadEnv` | 按优先级读取 `.env` 文件集合，返回聚合结果并注入 `process.env` | `packages/be/config/apis.md` |
| `LoadEnvOptions` | `loadEnv` 选项：`cwd`、`mode`、`files`、`override`、`injectToProcess` | `packages/be/config/apis.md` |
| `EnvRecord` | 环境变量记录类型 `Record<string, string>` | `packages/be/config/apis.md` |
| `parseEnv` | 按 schema 校验并转换环境变量，产出类型安全对象 | `packages/be/config/apis.md` |
| `EnvSchema` | `parseEnv` 的 schema 类型映射 | `packages/be/config/apis.md` |
| `EnvDefinition` | 单个变量定义：`type`、`default`、`required`、`delimiter`、`transform` | `packages/be/config/apis.md` |
| `EnvValueType` | 内置转换类型 `'string' \| 'number' \| 'boolean' \| 'json' \| 'array'` | `packages/be/config/apis.md` |
| `loadConfig` | 读取并解析 JSON / YAML / TOML 配置文件，支持默认值合并与校验 | `packages/be/config/apis.md` |
| `LoadConfigOptions` | `loadConfig` 选项：`cwd`、`format`、`defaults`、`parser`、`validate`、`mergeDefaults` | `packages/be/config/apis.md` |
| `ConfigFormat` | 配置格式 `'json' \| 'yaml' \| 'toml'` | `packages/be/config/apis.md` |
| `mergeConfig` | 深度合并多个配置对象，返回新对象，不改入参 | `packages/be/config/apis.md` |

选型规则：进程环境变量读 `.env` 用 `loadEnv`；要把环境变量转成带类型的配置对象用 `parseEnv`；读取结构化配置文件用 `loadConfig`；合并代码默认值与外部配置用 `mergeConfig`。完整签名见 `packages/be/config/apis.md`，端到端场景见 `packages/be/config/examples.md`。
