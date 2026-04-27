# cat-kit 统一技能 — 填充 fe + be 详细 API 文档

> 状态: 已执行

## 目标

为 `skills/cat-kit/packages/fe/` 和 `skills/cat-kit/packages/be/` 下的每个 topic 文件编写精确的 API 文档。

## 内容

### 1. 编写 fe 包 API 文档（virtualizer.md 已有完整内容，需补充其余）

- `packages/fe/file.md`：readChunks（分块读取、abort 控制、进度回调）、fileSaver 等
- `packages/fe/storage.md`：localStorage/sessionStorage 类型化存取、cookie 操作
- `packages/fe/web-api.md`：clipboard（writeText、readText）、permission 等 Web API 封装

### 2. 编写 be 包 API 文档

- `packages/be/fs.md`：ensureDir、readDirRecursive、emptyDir、remove、move、readJson/writeJson 等
- `packages/be/logger.md`：Logger 构造、日志级别、ConsoleTransport、自定义 Transport 接口
- `packages/be/cache.md`：LRUCache、FileCache、memoize 等
- `packages/be/config.md`：env 读取、config 加载/合并
- `packages/be/net.md`：getIP、findAvailablePort 等
- `packages/be/system.md`：cpuUsage、memoryInfo、diskInfo 等
- `packages/be/scheduler.md`：Scheduler、CronJob 等

### 3. 补充示例

完善 `packages/fe/examples.md`（追加 Virtualizer 最小完整示例）和 `packages/be/examples.md`（追加复合使用场景）。

## 影响范围

- 修改文件: `skills/cat-kit/packages/fe/file.md`
- 修改文件: `skills/cat-kit/packages/fe/storage.md`
- 修改文件: `skills/cat-kit/packages/fe/web-api.md`
- 新增文件: `skills/cat-kit/packages/fe/tween.md`
- 修改文件: `skills/cat-kit/packages/fe/index.md`（添加 tween 分类）
- 修改文件: `skills/cat-kit/packages/fe/examples.md`
- 修改文件: `skills/cat-kit/packages/be/fs.md`
- 修改文件: `skills/cat-kit/packages/be/logger.md`
- 修改文件: `skills/cat-kit/packages/be/cache.md`
- 修改文件: `skills/cat-kit/packages/be/config.md`
- 修改文件: `skills/cat-kit/packages/be/net.md`
- 修改文件: `skills/cat-kit/packages/be/system.md`
- 修改文件: `skills/cat-kit/packages/be/scheduler.md`
- 修改文件: `skills/cat-kit/packages/be/examples.md`

## 历史补丁
