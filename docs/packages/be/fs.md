# 文件系统

文件系统模块提供了增强的文件和目录操作功能。

## 目录读取

### readDir

递归读取目录内容，支持过滤和多种返回格式。

```typescript
import { readDir } from '@cat-kit/be'

// 读取目录（返回路径数组）
const files = await readDir('./src', {
  recursive: true,
  includeFiles: true,
  includeDirs: false
})
// ['/path/to/src/index.ts', '/path/to/src/utils.ts', ...]

// 读取目录（返回详细信息）
const entries = await readDir('./src', {
  recursive: true,
  returnType: 'entry'
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
//   ...
// ]

// 使用过滤函数
const tsFiles = await readDir('./src', {
  recursive: true,
  filter: entry => entry.isFile && entry.name.endsWith('.ts')
})

// 返回相对路径
const relativeFiles = await readDir('./src', {
  recursive: true,
  absolute: false
})
// ['index.ts', 'utils.ts', ...]
```

#### API

```typescript
function readDir(
  dir: string,
  options?: ReadDirOptionsWithPaths
): Promise<string[]>

function readDir(
  dir: string,
  options: ReadDirOptionsWithEntries
): Promise<DirEntry[]>
```

**参数：**

- `dir` - 起始目录路径
- `options.recursive` - 是否递归读取，默认 `false`
- `options.filter` - 过滤函数，返回 `true` 表示保留
- `options.includeFiles` - 是否包含文件，默认 `true`
- `options.includeDirs` - 是否包含目录，默认 `true`
- `options.absolute` - 返回的路径是否为绝对路径，默认 `true`
- `options.returnType` - 返回类型：`'path'` 或 `'entry'`，默认 `'path'`

**返回值：**

- `Promise<string[]>` - 当 `returnType` 为 `'path'` 时返回路径数组
- `Promise<DirEntry[]>` - 当 `returnType` 为 `'entry'` 时返回详细信息数组

## 目录操作

### ensureDir

确保目录存在，如果不存在则创建（包括父目录）。

```typescript
import { ensureDir } from '@cat-kit/be'

// 确保目录存在
await ensureDir('./logs/app')
// 如果 ./logs/app 不存在，会自动创建 ./logs 和 ./logs/app
```

#### API

```typescript
function ensureDir(dirPath: string): Promise<void>
```

**参数：**

- `dirPath` - 目标目录路径

**异常：**

- 如果路径已存在但不是目录，会抛出错误

## JSON 文件操作

### readJson

读取 JSON 文件并解析为对象。

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

#### API

```typescript
function readJson<T = unknown>(
  filePath: string,
  options?: ReadJsonOptions
): Promise<T>
```

**参数：**

- `filePath` - JSON 文件路径
- `options.encoding` - 文件编码，默认 `'utf8'`
- `options.reviver` - JSON.parse 的 reviver 函数

**返回值：**

- `Promise<T>` - 解析后的数据

### writeJson

将数据序列化为 JSON 文件。

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

#### API

```typescript
function writeJson(
  filePath: string,
  data: unknown,
  options?: WriteJsonOptions
): Promise<void>
```

**参数：**

- `filePath` - 目标文件路径（如果目录不存在会自动创建）
- `data` - 待写入的数据
- `options.encoding` - 文件编码，默认 `'utf8'`
- `options.replacer` - JSON.stringify 的 replacer 函数
- `options.space` - 缩进空格数，默认 `2`
- `options.eol` - 文件末尾换行符，默认 `'\n'`

## 删除操作

### remove

删除文件或目录。

```typescript
import { remove } from '@cat-kit/be'

// 删除文件
await remove('./temp/file.txt')

// 删除目录（递归删除）
await remove('./temp')

// 忽略不存在的路径
await remove('./maybe-not-exist', { force: true })
```

#### API

```typescript
function remove(
  targetPath: string,
  options?: RemoveOptions
): Promise<void>
```

**参数：**

- `targetPath` - 要删除的路径（文件或目录）
- `options.force` - 是否忽略不存在的路径，默认 `false`

**注意：**

- 删除目录时会递归删除所有内容
- 如果 `force` 为 `false` 且路径不存在，会抛出错误

## 使用示例

### 批量处理文件

```typescript
import { readDir, readJson, writeJson } from '@cat-kit/be'

// 读取所有 JSON 配置文件并合并
const configFiles = await readDir('./config', {
  recursive: true,
  filter: entry => entry.isFile && entry.name.endsWith('.json')
})

const configs = await Promise.all(
  configFiles.map(file => readJson(file))
)

const mergedConfig = configs.reduce((acc, config) => ({
  ...acc,
  ...config
}), {})
```

### 清理临时文件

```typescript
import { readDir, remove } from '@cat-kit/be'

// 删除所有临时文件
const tempFiles = await readDir('./temp', {
  recursive: true,
  filter: entry => entry.isFile && entry.name.startsWith('.tmp')
})

await Promise.all(tempFiles.map(file => remove(file)))
```

### 备份数据

```typescript
import { readJson, writeJson } from '@cat-kit/be'
import { format } from 'date-fns'

// 备份 JSON 数据
const data = await readJson('./data.json')
const backupPath = `./backups/data-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`
await writeJson(backupPath, data)
```

