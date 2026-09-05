---
title: "@cat-kit/be 文件系统工具"
description: "目录遍历、JSON 读写、安全写文件、移动、清空与删除路径"
---

# 文件系统工具

文件系统工具覆盖目录遍历、JSON 与普通文件读写、确保目录、移动路径、清空与删除。核心 API：`readDir`、`ensureDir`、`readJson`、`writeJson`、`writeFile`、`movePath`、`emptyDir`、`removePath`；同时再导出 Node 的 `readFile`、`copyFile`、`cp`、`existsSync`。

详情见 [API](apis.md) 与 [示例](examples.md)。

## 约束

- `readDir` 返回解析后的绝对路径；过滤掉的目录在 `recursive` 时仍会遍历
- `emptyDir` 删除目录内容但保留（不存在则创建）目录本身；`removePath` 递归删除
- `movePath` 目标已存在时默认报错，仅 `overwrite: true` 时覆盖；跨设备（`EXDEV`）时回退为复制 + 删除
- `writeJson` / `writeFile` 自动创建不存在的父目录

## 类型声明

- [read-dir.d.ts](../../../../packages/be/dist/fs/read-dir.d.ts) —— `readDir`、`DirEntry`、`ReadDirOptions`
- [json.d.ts](../../../../packages/be/dist/fs/json.d.ts) —— `readJson`、`writeJson`
- [write-file.d.ts](../../../../packages/be/dist/fs/write-file.d.ts) —— `writeFile`
- [move.d.ts](../../../../packages/be/dist/fs/move.d.ts) —— `movePath`
- [remove.d.ts](../../../../packages/be/dist/fs/remove.d.ts) —— `removePath`
- [empty-dir.d.ts](../../../../packages/be/dist/fs/empty-dir.d.ts) —— `emptyDir`
- [ensure-dir.d.ts](../../../../packages/be/dist/fs/ensure-dir.d.ts) —— `ensureDir`
- [index.d.ts](../../../../packages/be/dist/fs/index.d.ts) —— Node 再导出 `readFile`、`copyFile`、`cp`、`existsSync`
