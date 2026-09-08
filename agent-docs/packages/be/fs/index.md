---
title: "@cat-kit/be 文件系统模块总览"
description: "@cat-kit/be 文件系统模块总览：目录遍历、JSON 与流式文件读写、目录创建/清空/移动/删除的工具函数入口，以及 Node 原生 fs 再导出。"
aliases: [fs, 文件系统, 文件工具, 目录操作, fs-extra]
keywords: [readDir, ensureDir, readJson, writeJson, writeFile, movePath, emptyDir, removePath, DirEntry, ReadDirOptions, WriteFileOptions, 目录遍历, 递归, JSON 读写, 移动文件, 清空目录, 删除路径]
---

# @cat-kit/be 文件系统模块总览

文件系统模块从 `@cat-kit/be` 包根导出八个函数：`readDir`（目录遍历）、`ensureDir`（确保目录存在）、`readJson` / `writeJson`（JSON 文件读写）、`writeFile`（增强版写入，支持流）、`movePath`（移动文件或目录）、`emptyDir`（清空目录）、`removePath`（递归删除）；并再导出 Node 原生 `readFile`、`cp`、`copyFile`、`existsSync`。所有函数除 `existsSync` 外均为异步。

## 安装

```bash
bun add @cat-kit/be
```

文件系统相关导出从包根导入：

```ts
import { readDir, ensureDir, readJson, writeJson, writeFile, movePath, emptyDir, removePath } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `readDir` | 读取目录条目，支持递归、filter 过滤、`onlyFiles: true` 时直接返回文件路径数组 | `packages/be/fs/apis.md` |
| `DirEntry` | 目录条目信息：`path`、`relativePath`、`name`、`depth`、`isFile`、`isDirectory`、`isSymbolicLink` | `packages/be/fs/apis.md` |
| `ReadDirOptions` | `readDir` 选项：`recursive`、`filter`、`onlyFiles` | `packages/be/fs/apis.md` |
| `ensureDir` | 确保目录存在，递归创建；路径被文件占用时抛错 | `packages/be/fs/apis.md` |
| `readJson` | 读取 JSON 文件并解析，支持 `reviver` | `packages/be/fs/apis.md` |
| `ReadJsonOptions` | `readJson` 选项：`encoding`、`reviver` | `packages/be/fs/apis.md` |
| `writeJson` | 数据序列化为 JSON 写入，自动创建父目录，默认 2 空格缩进加换行 | `packages/be/fs/apis.md` |
| `WriteJsonOptions` | `writeJson` 选项：`encoding`、`replacer`、`space`、`eol` | `packages/be/fs/apis.md` |
| `writeFile` | 增强版写文件：自动创建父目录；支持字符串、Buffer、Web/Node 流与可迭代数据 | `packages/be/fs/apis.md` |
| `WriteFileData` | `writeFile` 支持的数据类型联合 | `packages/be/fs/apis.md` |
| `WriteFileOptions` | `writeFile` 选项：`encoding`、`mode`、`flag`（`'w'`/`'a'`/`'wx'`） | `packages/be/fs/apis.md` |
| `movePath` | 移动文件或目录；目标存在默认抛错，跨设备自动回退为复制加删除 | `packages/be/fs/apis.md` |
| `MoveOptions` | `movePath` 选项：`overwrite` | `packages/be/fs/apis.md` |
| `emptyDir` | 清空目录全部内容，目录本身保留；目录不存在则创建 | `packages/be/fs/apis.md` |
| `removePath` | 递归删除文件或目录；`force: true` 时缺失不报错 | `packages/be/fs/apis.md` |
| `RemoveOptions` | `removePath` 选项：`force` | `packages/be/fs/apis.md` |
| `readFile` / `cp` / `copyFile` / `existsSync` | Node `node:fs/promises` 与 `node:fs` 原生函数再导出，行为无增强 | `packages/be/fs/apis.md` |

选型规则：删目录树用 `removePath`，只清空内容保留目录用 `emptyDir`；搬运用 `movePath`，复制用 Node 原生 `cp`；写文本或流用 `writeFile`，写结构化数据用 `writeJson`。完整签名见 `packages/be/fs/apis.md`，端到端场景见 `packages/be/fs/examples.md`。
