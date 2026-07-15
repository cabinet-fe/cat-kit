# @cat-kit/be

仅用于 Node.js。所有下列 API 都从 `@cat-kit/be` 包根导入。

## 如何选择

- 遍历、写入、移动或清理文件：[fs.md](fs.md)
- 读取 `.env`、校验环境变量或合并配置：[config.md](config.md)
- 选择进程内、文件持久化或函数结果缓存：[cache.md](cache.md)
- 输出结构化控制台或文件日志：[logger.md](logger.md)
- 检查监听端口或获取本机地址：[net.md](net.md)
- 安排 Cron、延迟或周期任务：[scheduler.md](scheduler.md)
- 获取 CPU、内存、磁盘或网卡快照：[system.md](system.md)

不要在浏览器代码中使用本包，也不要导入 `src` 或 `dist` 深路径。精确签名在各主题末尾按需链接到对应声明文件。
