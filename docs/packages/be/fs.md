# 文件系统

文件系统模块提供了增强的文件和目录操作功能，简化常见的文件系统任务。所有函数都支持异步操作，并提供完整的 TypeScript 类型支持。

## 概述

文件系统模块包含以下功能：

- **目录读取** - 递归读取目录，支持过滤和多种返回格式
- **目录操作** - 确保目录存在，自动创建父目录
- **JSON 文件操作** - JSON 文件的便捷读写操作
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
  path: string              // 绝对路径
  relativePath: string      // 相对路径
  name: string              // 文件名或目录名
  depth: number             // 深度（从起始目录开始）
  isFile: boolean           // 是否为文件
  isDirectory: boolean      // 是否为目录
  isSymbolicLink: boolean   // 是否为符号链接
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
  space: 4,  // 4 空格缩进
  eol: '\n'  // 换行符
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

const configs = await Promise.all(
  configFiles.map(file => readJson(file))
)

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

### 查找特定文件

```typescript
import { readDir } from '@cat-kit/be'

// 查找所有 TypeScript 文件
const tsFiles = await readDir('./src', {
  recursive: true,
  onlyFiles: true,
  filter: entry =>
    entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')
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

## 最佳实践

1. **使用绝对路径**：在生产环境中使用绝对路径，避免相对路径的问题
2. **错误处理**：始终处理文件操作可能出现的错误
3. **权限检查**：在删除文件前检查权限，避免误删重要文件
4. **批量操作**：使用 `Promise.all` 并行处理多个文件操作
5. **路径安全**：验证用户输入的路径，防止路径遍历攻击
6. **资源清理**：及时清理临时文件和目录，避免磁盘空间浪费
