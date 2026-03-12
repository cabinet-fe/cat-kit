# @cat-kit/be - 后端工具包

Node.js 专用后端工具包，提供文件系统、日志、配置管理、缓存、网络、调度、系统监控等功能。

**依赖**：`@cat-kit/core`
**可选 peer 依赖**：`smol-toml@^1.5.2`（TOML 解析）、`js-yaml@^4.1.1`（YAML 解析）

## 目录结构

```
packages/be/src/
├── cache/             # 缓存
│   ├── lru-cache.ts   # LRU 缓存
│   ├── file-cache.ts  # 文件缓存
│   ├── memoize.ts     # 函数记忆化
│   └── index.ts
├── config/            # 配置管理
│   ├── config.ts      # 配置加载器
│   ├── env.ts         # 环境变量
│   ├── merge.ts       # 配置合并
│   └── index.ts
├── fs/                # 文件系统工具
│   ├── read-dir.ts    # 递归读取目录
│   ├── write-file.ts  # 安全写文件
│   ├── json.ts        # JSON 读写
│   ├── move.ts        # 文件移动
│   ├── remove.ts      # 文件删除
│   ├── ensure-dir.ts  # 确保目录存在
│   ├── empty-dir.ts   # 清空目录
│   └── index.ts
├── logger/            # 日志
│   ├── logger.ts      # 分级日志
│   ├── transports.ts  # 日志输出
│   └── index.ts
├── net/               # 网络工具
│   ├── ip.ts          # IP 地址
│   ├── port.ts        # 端口检测
│   └── index.ts
├── scheduler/         # 调度器
│   ├── cron.ts        # Cron 表达式
│   ├── scheduler.ts   # 任务调度
│   └── index.ts
├── system/            # 系统监控
│   ├── cpu.ts         # CPU 信息
│   ├── memory.ts      # 内存信息
│   ├── disk.ts        # 磁盘信息
│   ├── network.ts     # 网络信息
│   └── index.ts
└── index.ts           # 主导出文件
```

**当 `be/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- Node.js 内置模块使用 `node:` 协议导入
- 基础工具函数从 `@cat-kit/core` 导入，禁止重复实现
- `smol-toml`、`js-yaml` 运行时惰性加载（`await import(...)`），未安装时抛出可理解的错误提示
- 所有公共 API 通过 `src/index.ts` 统一导出
