---
title: 浏览器调试示例
description: 在浏览器中直接调试 @cat-kit/http 的请求与插件能力
sidebarOrder: 4
---

# 浏览器调试示例

## 介绍

本页提供可直接运行的浏览器 Demo，用于快速验证 `@cat-kit/http` 的核心能力：

- 基础请求（GET / POST）
- 插件链路（Token、MethodOverride、自定义日志）

## 快速使用

1. 启动文档站点：`pnpm --filter @cat-kit/docs dev`
2. 打开 `HTTP 请求 > 浏览器调试示例`
3. 点击示例按钮并在页面里观察请求结果

### 示例 1：基础请求调试

::: demo http/client-browser-debug.vue
:::

### 示例 2：插件链路调试

::: demo http/plugin-browser-debug.vue
:::

## API参考

上述示例使用到的主要 API：

- `new HTTPClient(prefix?, config?)`
- `http.get(url, config?)`
- `http.post(url, body?, config?)`
- `http.delete(url, config?)`
- `TokenPlugin(options)`
- `MethodOverridePlugin(options?)`

如需查看完整签名与参数说明，请继续阅读：

- [HTTP 客户端](./client)
- [插件系统](./plugins)
- [类型定义](./types)
