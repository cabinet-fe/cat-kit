# 文件系统

文件系统模块提供了增强的文件和目录操作功能，简化常见的文件系统任务。所有函数都支持异步操作，并提供完整的 TypeScript 类型支持。

## 概述

文件系统模块包含以下功能：

- **目录读取** - 递归读取目录，支持过滤和多种返回格式
- **目录操作** - 确保目录存在，清空目录，自动创建父目录
- **文件写入** - 增强的文件写入，支持流和自动创建目录
- **JSON 文件操作** - JSON 文件的便捷读写操作
- **移动操作** - 移动文件或目录，支持覆盖选项
- **删除操作** - 安全删除文件或目录

## 目录读取

### readDir

递归读取目录内容，支持过滤和多种返回格式。可以通过 `onlyFiles` 参数控制返回文件路径数组还是包含文件和目录的详细信息数组。

**适用场景：**

- 批量处理文件
- 查找特定类型的文件
- 目录结构分析
- 文件列表生成

#### 基本用法

```typescript
import { readDir } from '@cat-kit/be'

// 返回包含文件和目录的详细信息数组（默认）
const entries = await readDir('./src', {
  recursive: true
})
// [
//   {
//     path: '/path/to/src/index.ts',
//     relativePath: 'index.ts',
//     name: 'index.ts',
//     depth: 0,
//     isFile: true,
//     isDirectory: false,
//     isSymbolicLink: false
//   },
//   {
//     path: '/path/to/src/utils',
//     relativePath: 'utils',
//     name: 'utils',
//     depth: 0,
//     isFile: false,
//     isDirectory: true,
//     isSymbolicLink: false
//   },
//   ...
// ]

// 只返回文件路径数组
const files = await readDir('./src', {
  recursive: true,
  onlyFiles: true
})
// ['/path/to/src/index.ts', '/path/to/src/utils.ts', ...]

// 使用过滤函数
const tsFiles = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: entry => entry.name.endsWith('.ts')
})
```

#### API 参考

```typescript
// 返回详细信息数组（默认）
function readDir(
  dir: string,
  options?: ReadDirOptions & { onlyFiles?: false }
): Promise<DirEntry[]>

// 返回文件路径数组
function readDir(
  dir: string,
  options: ReadDirOptions & { onlyFiles: true }
): Promise<string[]>
```

**参数说明：**

- `dir` - 起始目录路径
- `options.recursive` - 是否递归读取，默认 `false`
- `options.filter` - 过滤函数，返回 `true` 表示保留
- `options.onlyFiles` - 是否只返回文件路径，默认 `false`
  - 当为 `true` 时，返回文件路径数组（string[]）
  - 当为 `false` 时，返回包含文件和目录的详细信息数组（DirEntry[]）

**返回值：**

- `Promise<DirEntry[]>` - 当 `onlyFiles` 为 `false` 时返回详细信息数组
- `Promise<string[]>` - 当 `onlyFiles` 为 `true` 时返回文件路径数组（绝对路径）

**DirEntry 接口：**

```typescript
interface DirEntry {
  path: string // 绝对路径
  relativePath: string // 相对路径
  name: string // 文件名或目录名
  depth: number // 深度（从起始目录开始）
  isFile: boolean // 是否为文件
  isDirectory: boolean // 是否为目录
  isSymbolicLink: boolean // 是否为符号链接
}
```

## 目录操作

### ensureDir

确保目录存在，如果不存在则创建（包括父目录）。这是一个非常实用的函数，可以避免手动检查目录是否存在。

**适用场景：**

- 创建日志目录
- 创建缓存目录
- 创建输出目录
- 确保工作目录存在

#### 基本用法

```typescript
import { ensureDir } from '@cat-kit/be'

// 确保目录存在（自动创建父目录）
await ensureDir('./logs/app')
// 如果 ./logs/app 不存在，会自动创建 ./logs 和 ./logs/app
```

#### API 参考

```typescript
function ensureDir(dirPath: string): Promise<void>
```

**参数说明：**

- `dirPath` - 目标目录路径

**异常：**

- 如果路径已存在但不是目录，会抛出错误

### emptyDir

确保目录为空。如果目录不为空，则删除目录内容。如果目录不存在，则创建该目录。目录本身不会被删除。

**适用场景：**

- 清空临时目录
- 清空缓存目录
- 清空构建输出目录
- 准备干净的工作目录

#### 基本用法

```typescript
import { emptyDir } from '@cat-kit/be'

// 清空目录内容
await emptyDir('./temp')
// 如果目录不为空，会删除所有内容；如果不存在，会创建空目录

// 清空缓存目录
await emptyDir('./cache')

// 清空构建输出目录
await emptyDir('./dist')
```

#### API 参考

```typescript
function emptyDir(dirPath: string): Promise<void>
```

**参数说明：**

- `dirPath` - 目标目录路径

**异常：**

- 如果路径已存在但不是目录，会抛出错误
- 如果目录操作失败，会抛出错误

**注意事项：**

- 目录本身不会被删除，只删除目录内容
- 如果目录不存在，会自动创建
- 会递归删除子目录和所有文件

## 文件写入

### writeFile

增强的文件写入函数，相比 Node.js 原生 `fs.writeFile` 提供以下增强功能：

- **自动创建父目录** - 目标路径的父目录不存在时自动创建
- **支持流写入** - 支持 Web ReadableStream、Node.js Readable 流
- **支持可迭代对象** - 支持 AsyncIterable 和 Iterable

**适用场景：**

- 下载文件保存（支持流式写入）
- 日志文件追加
- 数据文件写入
- 自动创建目录结构

#### 基本用法

```typescript
import { writeFile } from '@cat-kit/be'

// 写入字符串
await writeFile('./logs/app.log', 'Hello World')

// 写入 Buffer
await writeFile('./data/binary.dat', Buffer.from([0x00, 0x01, 0x02]))

// 写入 Web ReadableStream（如 fetch 响应体）
const response = await fetch('https://example.com/file.zip')
await writeFile('./downloads/file.zip', response.body!)

// 追加模式
await writeFile('./logs/app.log', 'New line\n', { flag: 'a' })

// 指定编码
await writeFile('./data/utf16.txt', 'Unicode 文本', { encoding: 'utf16le' })

// 指定文件权限
await writeFile('./scripts/run.sh', '#!/bin/bash\necho "Hello"', {
  mode: 0o755
})
```

#### 流式下载示例

```typescript
import { writeFile } from '@cat-kit/be'

// 下载大文件（流式写入，内存友好）
async function downloadFile(url: string, savePath: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`)
  }

  // 直接将响应体流写入文件
  await writeFile(savePath, response.body!)
}

await downloadFile(
  'https://example.com/large-file.zip',
  './downloads/large-file.zip'
)
```

#### API 参考

```typescript
function writeFile(
  filePath: string,
  data: WriteFileData,
  options?: WriteFileOptions
): Promise<void>
```

**参数说明：**

- `filePath` - 目标文件路径（如果父目录不存在会自动创建）
- `data` - 要写入的数据，支持以下类型：
  - `string` - 文本内容
  - `Buffer` - 二进制数据
  - `ArrayBufferView` - TypedArray 等
  - `ReadableStream<Uint8Array>` - Web Streams API（如 fetch 响应体）
  - `Readable` - Node.js 流
  - `AsyncIterable` / `Iterable` - 可迭代对象
- `options.encoding` - 文件编码，默认 `'utf8'`
- `options.mode` - 文件权限模式，默认 `0o666`
- `options.flag` - 文件系统标志：
  - `'w'`（默认）- 写入，如果文件存在则截断
  - `'a'` - 追加，如果文件不存在则创建
  - `'wx'` - 写入，如果文件存在则失败

**支持的数据类型：**

```typescript
type WriteFileData =
  | string
  | Buffer
  | NodeJS.ArrayBufferView
  | ReadableStream<Uint8Array>
  | Readable
  | AsyncIterable<string | Buffer | NodeJS.ArrayBufferView>
  | Iterable<string | Buffer | NodeJS.ArrayBufferView>
```

## JSON 文件操作

### readJson

读取 JSON 文件并解析为对象。支持自定义 reviver 函数进行数据转换。

**适用场景：**

- 读取配置文件
- 读取数据文件
- 读取缓存文件

#### 基本用法

```typescript
import { readJson } from '@cat-kit/be'

// 读取 JSON 文件
const config = await readJson<{ port: number; host: string }>('./config.json')

// 使用自定义 reviver
const data = await readJson('./data.json', {
  reviver: (key, value) => {
    if (key === 'date') {
      return new Date(value)
    }
    return value
  }
})
```

#### API 参考

```typescript
function readJson<T = unknown>(
  filePath: string,
  options?: ReadJsonOptions
): Promise<T>
```

**参数说明：**

- `filePath` - JSON 文件路径
- `options.encoding` - 文件编码，默认 `'utf8'`
- `options.reviver` - JSON.parse 的 reviver 函数

**返回值：**

返回解析后的数据，类型由泛型参数指定。

### writeJson

将数据序列化为 JSON 文件。支持自定义格式化和 replacer 函数。

**适用场景：**

- 保存配置文件
- 保存数据文件
- 保存缓存文件

#### 基本用法

```typescript
import { writeJson } from '@cat-kit/be'

// 写入 JSON 文件
await writeJson('./data.json', {
  name: 'CatKit',
  version: '1.0.0'
})

// 自定义格式
await writeJson('./config.json', config, {
  space: 4, // 4 空格缩进
  eol: '\n' // 换行符
})

// 使用 replacer
await writeJson('./data.json', data, {
  replacer: (key, value) => {
    if (key === 'password') {
      return undefined // 排除密码字段
    }
    return value
  }
})
```

#### API 参考

```typescript
function writeJson(
  filePath: string,
  data: unknown,
  options?: WriteJsonOptions
): Promise<void>
```

**参数说明：**

- `filePath` - 目标文件路径（如果目录不存在会自动创建）
- `data` - 待写入的数据
- `options.encoding` - 文件编码，默认 `'utf8'`
- `options.replacer` - JSON.stringify 的 replacer 函数
- `options.space` - 缩进空格数，默认 `2`
- `options.eol` - 文件末尾换行符，默认 `'\n'`

## 移动操作

### movePath

移动文件或目录到新位置。支持覆盖选项，自动创建目标父目录。

**适用场景：**

- 文件重命名
- 文件归档
- 目录重组
- 备份文件

#### 基本用法

```typescript
import { movePath } from '@cat-kit/be'

// 移动文件
await movePath('./old/file.txt', './new/file.txt')

// 移动目录
await movePath('./old-dir', './new-dir')

// 覆盖已存在的目标
await movePath('./source.txt', './target.txt', { overwrite: true })

// 自动创建目标父目录
await movePath('./file.txt', './nested/deep/dir/file.txt')
```

#### 跨分区移动

```typescript
import { movePath } from '@cat-kit/be'

// 跨分区移动时会自动使用复制+删除策略
await movePath('C:/temp/file.txt', 'D:/backup/file.txt')
```

#### API 参考

```typescript
function movePath(
  src: string,
  dest: string,
  options?: MoveOptions
): Promise<void>
```

**参数说明：**

- `src` - 源路径（文件或目录）
- `dest` - 目标路径（必须与源路径类型一致）
- `options.overwrite` - 是否覆盖已存在的目标，默认 `false`

**异常：**

- 当源路径不存在时抛出错误
- 当源路径和目标路径类型不一致时抛出错误（一个是文件，一个是目录）
- 当目标路径已存在且 `overwrite` 为 `false` 时抛出错误

**注意事项：**

- 源路径和目标路径类型必须一致（都是文件或都是目录）
- 目标父目录不存在时会自动创建
- 同一文件系统上使用 `rename`（高效），跨文件系统使用复制+删除

## 删除操作

### removePath

删除文件或目录。支持递归删除目录，可以忽略不存在的路径。

**适用场景：**

- 清理临时文件
- 删除缓存目录
- 清理旧数据

#### 基本用法

```typescript
import { removePath } from '@cat-kit/be'

// 删除文件
await removePath('./temp/file.txt')

// 删除目录（递归删除）
await removePath('./temp')

// 忽略不存在的路径
await removePath('./maybe-not-exist', { force: true })
```

#### API 参考

```typescript
function removePath(targetPath: string, options?: RemoveOptions): Promise<void>
```

**参数说明：**

- `targetPath` - 要删除的路径（文件或目录）
- `options.force` - 是否忽略不存在的路径，默认 `false`

**注意事项：**

- 删除目录时会递归删除所有内容
- 如果 `force` 为 `false` 且路径不存在，会抛出错误

## 使用示例

### 批量处理文件

```typescript
import { readDir, readJson, writeJson } from '@cat-kit/be'

// 读取所有 JSON 配置文件并合并
const configFiles = await readDir('./config', {
  recursive: true,
  onlyFiles: true,
  filter: entry => entry.name.endsWith('.json')
})

const configs = await Promise.all(configFiles.map(file => readJson(file)))

const mergedConfig = configs.reduce(
  (acc, config) => ({ ...acc, ...config }),
  {}
)

await writeJson('./config/merged.json', mergedConfig)
```

### 清理临时文件

```typescript
import { readDir, removePath } from '@cat-kit/be'

// 删除所有临时文件
const tempFiles = await readDir('./temp', {
  recursive: true,
  onlyFiles: true,
  filter: entry => entry.name.startsWith('.tmp')
})

await Promise.all(tempFiles.map(file => removePath(file)))
```

### 备份数据

```typescript
import { readJson, writeJson } from '@cat-kit/be'
import { format } from 'date-fns'

// 备份 JSON 数据
const data = await readJson('./data.json')
const backupPath = `./backups/data-${format(
  new Date(),
  'yyyy-MM-dd-HH-mm-ss'
)}.json`
await writeJson(backupPath, data)
```

### 流式下载文件

```typescript
import { writeFile } from '@cat-kit/be'

// 下载大文件（流式写入，内存友好）
async function downloadFile(url: string, savePath: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`)
  }

  // 直接将响应体流写入文件，无需全部加载到内存
  await writeFile(savePath, response.body!)
}

// 下载多个文件
const downloads = [
  { url: 'https://example.com/file1.zip', path: './downloads/file1.zip' },
  { url: 'https://example.com/file2.zip', path: './downloads/file2.zip' }
]

await Promise.all(downloads.map(({ url, path }) => downloadFile(url, path)))
```

### 日志文件追加

```typescript
import { writeFile } from '@cat-kit/be'

// 追加日志到文件
async function appendLog(message: string) {
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`

  await writeFile('./logs/app.log', logLine, { flag: 'a' })
}

await appendLog('应用启动')
await appendLog('用户登录: user123')
```

### 查找特定文件

```typescript
import { readDir } from '@cat-kit/be'

// 查找所有 TypeScript 文件
const tsFiles = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: entry => entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')
})

// 查找所有测试文件
const testFiles = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: entry =>
    entry.name.includes('.test.') || entry.name.includes('.spec.')
})
```

### 目录结构分析

```typescript
import { readDir } from '@cat-kit/be'

// 分析目录结构（返回详细信息）
const entries = await readDir('./src', {
  recursive: true
})

const stats = {
  totalFiles: 0,
  totalDirs: 0,
  byExtension: {} as Record<string, number>,
  maxDepth: 0
}

for (const entry of entries) {
  if (entry.isFile) {
    stats.totalFiles++
    const ext = entry.name.split('.').pop() || 'no-ext'
    stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1
  } else if (entry.isDirectory) {
    stats.totalDirs++
  }
  stats.maxDepth = Math.max(stats.maxDepth, entry.depth)
}

console.log('目录统计:', stats)
```

### 确保工作目录存在

```typescript
import { ensureDir } from '@cat-kit/be'

// 应用启动时确保必要的目录存在
async function initializeApp() {
  await ensureDir('./logs')
  await ensureDir('./cache')
  await ensureDir('./uploads')
  await ensureDir('./temp')

  console.log('目录初始化完成')
}
```

### 清空构建输出目录

```typescript
import { emptyDir } from '@cat-kit/be'

// 构建前清空输出目录
async function build() {
  // 清空 dist 目录，确保干净的构建
  await emptyDir('./dist')

  // 执行构建...
  console.log('开始构建...')
}
```

### 文件归档

```typescript
import { movePath, ensureDir } from '@cat-kit/be'
import { format } from 'date-fns'

// 将日志文件归档到按日期命名的目录
async function archiveLog(logFile: string) {
  const date = format(new Date(), 'yyyy-MM-dd')
  const archiveDir = `./archives/${date}`

  await ensureDir(archiveDir)
  await movePath(logFile, `${archiveDir}/app.log`)
}
```

### 批量移动文件

```typescript
import { movePath, readDir } from '@cat-kit/be'
import { basename } from 'node:path'

// 将所有 .txt 文件移动到指定目录
async function moveTextFiles(srcDir: string, destDir: string) {
  const files = await readDir(srcDir, {
    onlyFiles: true,
    filter: entry => entry.name.endsWith('.txt')
  })

  await Promise.all(
    files.map(file =>
      movePath(file, `${destDir}/${basename(file)}`, { overwrite: true })
    )
  )
}
```

### 临时目录管理

```typescript
import { emptyDir, removePath } from '@cat-kit/be'

// 使用临时目录进行工作
async function processWithTempDir() {
  const tempDir = './temp-work'

  // 确保临时目录为空
  await emptyDir(tempDir)

  try {
    // 在临时目录中进行工作...
    console.log('处理中...')
  } finally {
    // 清理临时目录
    await removePath(tempDir, { force: true })
  }
}
```

## 最佳实践

1. **使用绝对路径**：在生产环境中使用绝对路径，避免相对路径的问题
2. **错误处理**：始终处理文件操作可能出现的错误
3. **权限检查**：在删除文件前检查权限，避免误删重要文件
4. **批量操作**：使用 `Promise.all` 并行处理多个文件操作
5. **路径安全**：验证用户输入的路径，防止路径遍历攻击
6. **资源清理**：及时清理临时文件和目录，避免磁盘空间浪费
