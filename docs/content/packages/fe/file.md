# 文件操作

提供了浏览器端文件读取和保存的简单封装。

## readFile - 分块读取文件

`readFile` 函数可以分块读取 File 或 Blob 对象，适合处理大文件。

### 基本用法

```typescript
import { readFile } from '@cat-kit/fe'

// 简单读取
await readFile(file, {
  onChunk: (chunk, index) => {
    console.log(`读取第 ${index} 块，大小：${chunk.length} 字节`)
  }
})
```

### 完整示例

```typescript
import { readFile } from '@cat-kit/fe'

// 从 input 元素获取文件
const input = document.querySelector<HTMLInputElement>('#fileInput')
input?.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 分块读取文件
  await readFile(file, {
    chunkSize: 1024 * 1024, // 每块 1MB
    offset: 0, // 从文件开始位置读取
    onChunk: (chunk, chunkIndex) => {
      console.log(`读取第 ${chunkIndex} 块`)
      console.log(`数据：`, chunk)

      // 处理每一块数据
      // 例如：上传到服务器、计算哈希等
    }
  })

  console.log('文件读取完成')
})
```

### 计算文件 MD5

```typescript
import { readFile } from '@cat-kit/fe'
import SparkMD5 from 'spark-md5'

async function calculateMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer()

  await readFile(file, {
    chunkSize: 2 * 1024 * 1024, // 2MB 每块
    onChunk: chunk => {
      spark.append(chunk.buffer)
    }
  })

  return spark.end()
}

// 使用
const file = document.querySelector<HTMLInputElement>('#file')?.files?.[0]
if (file) {
  const md5 = await calculateMD5(file)
  console.log('文件 MD5:', md5)
}
```

### 大文件上传

```typescript
import { readFile } from '@cat-kit/fe'

async function uploadLargeFile(file: File, uploadUrl: string) {
  const chunkSize = 5 * 1024 * 1024 // 5MB 每块
  const totalChunks = Math.ceil(file.size / chunkSize)
  let uploadedChunks = 0

  await readFile(file, {
    chunkSize,
    onChunk: async (chunk, chunkIndex) => {
      // 创建 FormData
      const formData = new FormData()
      formData.append('file', new Blob([chunk]))
      formData.append('chunkIndex', String(chunkIndex))
      formData.append('totalChunks', String(totalChunks))
      formData.append('filename', file.name)

      // 上传当前块
      await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      uploadedChunks++
      const progress = (uploadedChunks / totalChunks) * 100
      console.log(`上传进度：${progress.toFixed(2)}%`)
    }
  })

  console.log('上传完成')
}
```

### 参数说明

```typescript
interface ReadFileConfig {
  /** 开始读取的文件偏移量，默认 0 */
  offset?: number

  /** 每次读取的文件大小，默认 10MB */
  chunkSize?: number

  /**
   * 每次读取的文件块回调函数
   * @param chunk 当前读取的文件块数据（Uint8Array）
   * @param chunkIndex 当前块的索引（从 0 开始）
   */
  onChunk?: (chunk: Uint8Array, chunkIndex: number) => void
}
```

## saveFile - 保存文件到本地

`saveFile` 函数可以将 Blob 或 File 对象保存到用户本地。

### 基本用法

```typescript
import { saveFile } from '@cat-kit/fe'

// 保存 File 对象
const file = new File(['Hello World'], 'hello.txt', { type: 'text/plain' })
saveFile(file)

// 保存 Blob 对象（需要指定文件名）
const blob = new Blob(['Hello World'], { type: 'text/plain' })
saveFile(blob, 'hello.txt')
```

### 保存文本文件

```typescript
import { saveFile } from '@cat-kit/fe'

function saveTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveFile(blob, filename)
}

// 使用
saveTextFile('Hello, World!', 'greeting.txt')
```

### 保存 JSON 文件

```typescript
import { saveFile } from '@cat-kit/fe'

function saveJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  saveFile(blob, filename)
}

// 使用
const data = { name: 'Alice', age: 25 }
saveJSON(data, 'user.json')
```

### 保存 Canvas 为图片

```typescript
import { saveFile } from '@cat-kit/fe'

function saveCanvasAsImage(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob(blob => {
    if (blob) {
      saveFile(blob, filename)
    }
  }, 'image/png')
}

// 使用
const canvas = document.querySelector<HTMLCanvasElement>('#myCanvas')
if (canvas) {
  saveCanvasAsImage(canvas, 'drawing.png')
}
```

### 下载远程文件

```typescript
import { saveFile } from '@cat-kit/fe'

async function downloadRemoteFile(url: string, filename: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  saveFile(blob, filename)
}

// 使用
await downloadRemoteFile('https://example.com/file.pdf', 'document.pdf')
```

### 保存 CSV 文件

```typescript
import { saveFile } from '@cat-kit/fe'

function saveCSV(data: any[], filename: string) {
  // 生成 CSV 内容
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveFile(blob, filename)
}

// 使用
const users = [
  { name: 'Alice', age: 25, city: 'Beijing' },
  { name: 'Bob', age: 30, city: 'Shanghai' }
]
saveCSV(users, 'users.csv')
```

## 完整工作流示例

### 文件处理工作流

```typescript
import { readFile, saveFile } from '@cat-kit/fe'

// 1. 读取文件
const input = document.querySelector<HTMLInputElement>('#fileInput')
input?.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 2. 处理文件内容
  const chunks: Uint8Array[] = []
  await readFile(file, {
    chunkSize: 1024 * 1024, // 1MB
    onChunk: (chunk, index) => {
      // 收集所有块
      chunks.push(chunk)
      console.log(
        `处理进度：${(
          ((index + 1) * 100) /
          Math.ceil(file.size / (1024 * 1024))
        ).toFixed(2)}%`
      )
    }
  })

  // 3. 合并数据
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  // 4. 保存处理后的文件
  const processedBlob = new Blob([result], { type: file.type })
  saveFile(processedBlob, `processed_${file.name}`)
})
```

## API 参考

### readFile

```typescript
function readFile(
  file: Blob | File,
  config?: {
    offset?: number
    chunkSize?: number
    onChunk?: (chunk: Uint8Array, chunkIndex: number) => void
  }
): Promise<void>
```

**参数：**

- `file`: 要读取的 File 或 Blob 对象
- `config.offset`: 开始读取的偏移量（字节），默认 0
- `config.chunkSize`: 每块大小（字节），默认 10MB
- `config.onChunk`: 每块读取完成的回调函数

**返回：**

- `Promise<void>`: 所有块读取完成

### saveFile

```typescript
function saveFile(file: File): void
function saveFile(file: Blob, name: string): void
```

**参数：**

- `file`: File 对象或 Blob 对象
- `name`: 文件名（当 file 为 Blob 时必需）

**行为：**

- 触发浏览器下载，将文件保存到用户指定位置
- 使用浏览器原生的下载机制（`<a>` 标签 + `download` 属性）
