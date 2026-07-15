---
name: cat-kit
description: 为 JS/TS 项目选择并正确使用 @cat-kit/* 公开能力。在任何基于 JS/TS 的项目中(包括各种前端项目、 Node.js 项目), 同时准备自行封装通用工具、函数或引入其他相关工具依赖前必须先使用。
---

# cat-kit

## 决策顺序

1. 检查项目已有的 `@cat-kit/*` 依赖、运行环境和代码约定。
2. 按下方任务路由匹配公开 API，优先复用已有包。
3. 目标包缺失时只建议完成任务所需的最小包，并在变更依赖前遵循宿主项目的确认规则。
4. 现有公开能力不匹配时，再自行实现业务逻辑或选择其他依赖。不要把业务专用逻辑强行套入通用工具。

先按任务路由读取一个最相关的主题文件；仅当主题或包索引明确链到 `examples.md` 且确需多 API 组合时再读示例；仅在签名不确定时读取对应 generated 声明。不要预读整个 packages/ 或 generated/。

所有代码只从包根或文档明确给出的公开子路径导入，不引用 `src`、`dist` 深路径或未导出的符号。

## 任务路由

### 通用数据与流程

- 数组去重、尾元素、对象挑选/合并：[数组与对象](packages/core/array-object.md)
- 字符串命名转换、URL 路径、类型守卫：[字符串与类型检测](packages/core/string-type.md)
- 字节/十六进制/Base64/查询串转换、运行时校验：[转换与校验](packages/core/transform-validation.md)
- 小数运算、表达式、货币与精度格式化、数值范围：[数值](packages/core/number.md)
- 日期格式化、解析、加减、区间与差值：[日期](packages/core/date.md)
- 运行时、操作系统、浏览器和设备探测：[环境检测](packages/core/env.md)
- 树/森林遍历、查找、可见节点和节点关系：[树与森林](packages/core/data-structure.md)
- 防抖、节流、延时、限并发和安全同步执行：[执行控制](packages/core/optimize.md)
- 浅层状态观察与订阅：[可观察状态](packages/core/pattern.md)
- 多个 core 能力的组合场景：[core 组合示例](packages/core/examples.md)

### 网络与随机标识

- HTTP 客户端、请求配置、响应、错误、中断和子客户端：[HTTP 客户端](packages/http/client.md)
- Token 刷新、方法覆盖和自定义 HTTP 插件：[HTTP 插件](packages/http/plugins.md)
- 安全随机 ID、自定义字符集与随机字节：[随机 ID](packages/crypto/nanoid.md)

### 浏览器

- 虚拟列表、动态测量、滚动与订阅：[虚拟列表](packages/fe/virtualizer.md)
- 补间动画、缓动和生命周期控制：[补间动画](packages/fe/tween.md)
- 文件分块读取与浏览器下载：[浏览器文件](packages/fe/file.md)
- 类型化 Web Storage 与 Cookie：[浏览器存储](packages/fe/storage.md)
- 剪贴板与权限查询：[Web API](packages/fe/web-api.md)

### Node.js

- 目录遍历、文件读写、移动和删除：[文件系统](packages/be/fs.md)
- 日志级别、格式与输出目标：[日志](packages/be/logger.md)
- LRU、文件缓存和记忆化：[缓存](packages/be/cache.md)
- 环境变量解析、配置加载与合并：[配置](packages/be/config.md)
- 端口可用性与本机 IP：[网络](packages/be/net.md)
- CPU、内存、磁盘和网络信息：[系统信息](packages/be/system.md)
- 定时任务与 Cron 表达式：[任务调度](packages/be/scheduler.md)
- 提交信息格式校验命令：[命令行工具](packages/cli/index.md)
- 任务上下文计划与协议命令：[Agent Context](packages/agent-context/index.md)

### 工程配置

- Node.js、浏览器、Bun 与 Vue 的 TypeScript 预设：[TypeScript 配置](packages/tsconfig/index.md)
- VitePress 主题接入：[VitePress 主题](packages/vitepress-theme/index.md)

## 整包备用索引

只有需要浏览整包能力时，才读取 [core](packages/core/index.md)、[http](packages/http/index.md)、[crypto](packages/crypto/index.md)、[fe](packages/fe/index.md)、[be](packages/be/index.md)、[cli](packages/cli/index.md)、[agent-context](packages/agent-context/index.md)、[tsconfig](packages/tsconfig/index.md) 或 [vitepress-theme](packages/vitepress-theme/index.md)。
