---
title: "@cat-kit/be 文件系统 API"
description: "readDir、readJson、writeJson、writeFile、movePath、emptyDir、removePath、ensureDir 签名"
keywords:
  - readDir
  - readJson
  - writeJson
  - writeFile
  - movePath
  - emptyDir
  - removePath
  - ensureDir
  - DirEntry
  - 递归遍历
aliases:
  - 文件系统 API
  - fs API
  - 目录遍历
  - 删除文件
---

# 文件系统 API

文件系统全部函数的 TypeScript 签名。

```ts
declare function readDir(
  dir: string,
  options?: ReadDirOptions & { onlyFiles?: false }
): Promise<DirEntry[]>
declare function readDir(
  dir: string,
  options: ReadDirOptions & { onlyFiles: true }
): Promise<string[]>

declare function ensureDir(path: string): Promise<void>
declare function readJson<T = unknown>(
  path: string,
  options?: ReadJsonOptions
): Promise<T>
declare function writeJson(
  path: string,
  data: unknown,
  options?: WriteJsonOptions
): Promise<void>
declare function writeFile(
  path: string,
  data: WriteFileData,
  options?: WriteFileOptions
): Promise<void>
declare function movePath(
  src: string,
  dest: string,
  options?: MoveOptions
): Promise<void>
declare function emptyDir(path: string): Promise<void>
declare function removePath(
  path: string,
  options?: RemoveOptions
): Promise<void>
```

另导出 Node 的 `readFile`、`copyFile`、`cp`、`existsSync`。

## 参数说明

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `ReadDirOptions` | `recursive` | 递归子目录，默认 `false` |
| `ReadDirOptions` | `filter` | `(entry: DirEntry) => boolean`，返回 `true` 保留 |
| `ReadDirOptions` | `onlyFiles` | `true` 时返回 `string[]`，否则返回 `DirEntry[]` |
| `DirEntry` | — | `path`（绝对）、`relativePath`、`name`、`depth`、`isFile`、`isDirectory`、`isSymbolicLink` |
| `WriteFileOptions` | `encoding` / `mode` / `flag` | 编码默认 `'utf8'`；`flag` 支持 `'w'`、`'a'`、`'wx'` |
| `WriteFileData` | — | 字符串、`Buffer`、Web `ReadableStream`、Node `Readable`、可迭代对象 |
| `MoveOptions` | `overwrite` | 目标已存在时是否覆盖，默认 `false` |
| `RemoveOptions` | `force` | 是否忽略不存在的路径，默认 `false` |
