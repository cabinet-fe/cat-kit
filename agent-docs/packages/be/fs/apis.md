---
title: "@cat-kit/be 文件系统 API（readDir writeJson movePath）"
description: "@cat-kit/be 文件系统模块 API 参考：readDir 目录遍历、ensureDir 建目录、readJson/writeJson JSON 读写、writeFile 流式写入、movePath 移动、emptyDir 清空、removePath 删除。"
aliases: [文件系统 API, fs API, 目录遍历, 文件操作]
keywords: [readDir, ensureDir, readJson, writeJson, writeFile, movePath, emptyDir, removePath, DirEntry, ReadDirOptions, ReadJsonOptions, WriteJsonOptions, WriteFileData, WriteFileOptions, MoveOptions, RemoveOptions, onlyFiles, 递归遍历, 目录清单, 跨设备移动]
---

# @cat-kit/be 文件系统 API（readDir writeJson movePath）

`@cat-kit/be` 导出八个文件系统函数：`readDir`、`ensureDir`、`readJson`、`writeJson`、`writeFile`、`movePath`、`emptyDir`、`removePath`，并再导出 Node 原生 `readFile`、`cp`、`copyFile`、`existsSync`。除 `existsSync` 为同步外全部返回 `Promise`；`writeJson` 与 `writeFile` 写入前自动创建父目录。

## 快速上手

```ts
import { readJson, writeJson } from '@cat-kit/be'

// 父目录 ./output 不存在时自动创建
await writeJson('./output/user.json', { id: 1, tags: ['a', 'b'] })

const user = await readJson<{ id: number; tags: string[] }>('./output/user.json')
console.log(user.tags) // => ['a', 'b']
```

## API 签名

```ts
export interface DirEntry {
  /** 绝对路径 */
  path: string
  /** 相对于根目录的路径 */
  relativePath: string
  /** 文件名或目录名 */
  name: string
  /** 目录深度，根目录为 0 */
  depth: number
  isFile: boolean
  isDirectory: boolean
  isSymbolicLink: boolean
}

export interface ReadDirOptions {
  /** 是否递归读取子目录。默认 false */
  recursive?: boolean
  /** 过滤函数，返回 true 保留该条目；不影响递归遍历范围 */
  filter?: (entry: DirEntry) => boolean
  /** true 时返回文件绝对路径数组；false 时返回 DirEntry[]。默认 false */
  onlyFiles?: boolean
}

export function readDir(
  dir: string,
  options?: ReadDirOptions & { onlyFiles?: false }
): Promise<DirEntry[]>
export function readDir(
  dir: string,
  options: ReadDirOptions & { onlyFiles: true }
): Promise<string[]>

/** 目录已存在时直接通过；路径存在但不是目录时抛错 */
export function ensureDir(dirPath: string): Promise<void>

export interface ReadJsonOptions {
  /** 文件编码。默认 'utf8' */
  encoding?: BufferEncoding
  /** JSON.parse 的 reviver 函数 */
  reviver?: Parameters<typeof JSON.parse>[1]
}

export function readJson<T = Record<string, any>>(
  filePath: string,
  options?: ReadJsonOptions
): Promise<T>

export interface WriteJsonOptions {
  /** 文件编码。默认 'utf8' */
  encoding?: BufferEncoding
  /** JSON.stringify 的 replacer 函数 */
  replacer?: Parameters<typeof JSON.stringify>[1]
  /** 缩进空格数。默认 2 */
  space?: Parameters<typeof JSON.stringify>[2]
  /** 文件末尾追加的换行符。默认 '\n' */
  eol?: string
}

/** 序列化写入 JSON；父目录不存在自动创建 */
export function writeJson(
  filePath: string,
  data: unknown,
  options?: WriteJsonOptions
): Promise<void>

export type WriteFileData =
  | string
  | Buffer
  | NodeJS.ArrayBufferView
  | ReadableStream<Uint8Array>
  | Readable
  | AsyncIterable<string | Buffer | NodeJS.ArrayBufferView>
  | Iterable<string | Buffer | NodeJS.ArrayBufferView>

export interface WriteFileOptions {
  /** 文件编码。默认 'utf8' */
  encoding?: BufferEncoding
  /** 权限模式，如 0o644。默认 0o666 */
  mode?: number
  /** 'w' 截断写入；'a' 追加；'wx' 已存在则失败。默认 'w' */
  flag?: 'w' | 'a' | 'wx'
}

/** 增强版写文件：父目录不存在自动创建；流数据经 pipeline 写入 */
export function writeFile(
  filePath: string,
  data: WriteFileData,
  options?: WriteFileOptions
): Promise<void>

export interface MoveOptions {
  /** 目标已存在时是否覆盖。默认 false */
  overwrite?: boolean
}

/** 移动文件或目录；源与目标类型必须一致；跨设备自动回退为复制加删除 */
export function movePath(src: string, dest: string, options?: MoveOptions): Promise<void>

/** 清空目录内容；目录本身保留，不存在则创建 */
export function emptyDir(dirPath: string): Promise<void>

export interface RemoveOptions {
  /** 是否忽略不存在的路径。默认 false */
  force?: boolean
}

/** 递归删除文件或目录 */
export function removePath(targetPath: string, options?: RemoveOptions): Promise<void>

// Node 原生再导出，行为无增强：
export { readFile, cp, copyFile } from 'node:fs/promises'
export { existsSync } from 'node:fs'
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `recursive` | `boolean` | `false` | 否 | `true` 时递归进入全部子目录，含被 `filter` 过滤掉的目录 |
| `filter` | `(entry: DirEntry) => boolean` | 无 | 否 | 返回 `true` 保留；返回 `false` 的目录其子项仍会被递归遍历 |
| `onlyFiles` | `boolean` | `false` | 否 | `true` 时返回 `string[]`（文件绝对路径），否则返回 `DirEntry[]` |
| `encoding`（readJson） | `BufferEncoding` | `'utf8'` | 否 | 传其他编码时按该编码读取后解析 |
| `reviver` | 函数 | 无 | 否 | 透传给 `JSON.parse` |
| `space` | `number` | `2` | 否 | 传给 `JSON.stringify` 的缩进 |
| `eol` | `string` | `'\n'` | 否 | 追加在 JSON 文本末尾 |
| `mode`（writeFile） | `number` | `0o666` | 否 | 受进程 `umask` 影响 |
| `flag` | `'w' \| 'a' \| 'wx'` | `'w'` | 否 | `'wx'` 时目标已存在直接失败；流写入同样支持 |
| `overwrite` | `boolean` | `false` | 否 | `false` 且目标已存在时抛 `Error('目标路径 "x" 已存在')` |
| `force` | `boolean` | `false` | 否 | `false` 且路径不存在时抛错误码 `ENOENT`；`true` 时静默通过 |

## 方法与事件

本模块全部为独立函数，无实例方法。错误路径汇总：

- `ensureDir`：路径存在但不是目录时抛 `Error('路径 "x" 存在但不是目录')`
- `readJson`：文件不存在抛错误码 `ENOENT`；JSON 非法抛 `SyntaxError`
- `movePath`：源不存在抛 `Error('源路径 "x" 不存在')`；源与目标类型不一致抛 `Error('源路径是文件，但目标路径是目录，类型不一致')`（文件 / 目录措辞互换同理）；目标已存在且未开 `overwrite` 抛 `Error('目标路径 "x" 已存在')`
- `removePath`：`force: false` 且路径不存在时抛错误码 `ENOENT`
- `writeFile` / `writeJson`：写入失败（权限、磁盘满）时抛底层 `Error`；`flag: 'wx'` 且目标存在时抛 `EEXIST`

## 典型示例

### 递归收集指定后缀文件

```ts
import { readDir } from '@cat-kit/be'

// filter 过滤 + onlyFiles 输出字符串路径数组
const files = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: (entry) => entry.name.endsWith('.ts')
})

console.log(files.every((f) => f.endsWith('.ts'))) // => true

// 完整条目：绝对路径、相对路径与深度
const entries = await readDir('./src', { recursive: true })
const first = entries.find((e) => e.isDirectory)
console.log(first?.depth) // => 0（根目录的直接子项深度为 0，孙项依次加 1）
```

### 下载文件写入磁盘

```ts
import { writeFile } from '@cat-kit/be'

const response = await fetch('https://example.com/archive.zip')
if (!response.ok || !response.body) {
  throw new Error(`下载失败：${response.status}`)
}

// response.body 是 Web ReadableStream，自动创建父目录后流式写入
await writeFile('./downloads/archive.zip', response.body)
console.log('done') // => 'done'
```

### movePath 移动并处理目标冲突

```ts
import { movePath } from '@cat-kit/be'

try {
  // 目标已存在时默认抛错
  await movePath('./data/old.json', './archive/old.json')
} catch (err) {
  const message = (err as Error).message
  if (message.includes('已存在')) {
    // 确认要覆盖时显式传 overwrite: true
    await movePath('./data/old.json', './archive/old.json', { overwrite: true })
  } else if (message.includes('不存在')) {
    console.warn('源文件不存在，跳过归档')
  } else {
    throw err // 类型不一致等错误原样上抛
  }
}
```

## 注意事项

> [!WARNING]
> - 本库 `writeJson` / `writeFile` 自动创建父目录，不是要求父目录先存在；原生 `fs.writeFile` 在父目录缺失时抛 `ENOENT`。
> - 本库 `readDir` 的 `filter` 只影响返回列表，不影响遍历范围：被过滤掉的目录其子项仍会被 `recursive` 遍历到。
> - 本库 `writeJson` 末尾恒追加一个换行符（默认 `'\n'`），文件字节数比纯 `JSON.stringify` 结果多，做内容哈希比对时要计入。
> - 本库 `movePath` 跨设备（`EXDEV`）自动回退为复制加删除；原生 `rename` 跨设备直接抛错。
> - 本库再导出的 `readFile`、`cp`、`copyFile`、`existsSync` 是 Node 原生函数，无任何增强；需要自动建目录等能力时用本库函数。

## 常见问题

### 报错 `路径 "./x" 存在但不是目录`

原因：`ensureDir` / `emptyDir` 的目标路径已被一个文件占用。修复：先删除或改名该文件，或换一个目录路径。

```ts
import { ensureDir, removePath } from '@cat-kit/be'

await removePath('./x', { force: true }) // 删除同名文件后重建目录
await ensureDir('./x')
```

### `readJson` 抛错误码 `ENOENT`

原因：目标 JSON 文件不存在。修复：先判断存在或捕获后写默认值。

```ts
import { existsSync } from '@cat-kit/be'
import { readJson, writeJson } from '@cat-kit/be'

interface Settings {
  theme: string
}

async function loadSettings(path: string): Promise<Settings> {
  if (!existsSync(path)) {
    const fallback: Settings = { theme: 'light' }
    await writeJson(path, fallback) // 写入默认值，下次直接命中
    return fallback
  }
  return readJson<Settings>(path)
}
```
