# 文件操作

## 介绍

本页介绍 `@cat-kit/fe` 的文件能力，包含分块读取本地文件与 Blob 保存。

## 快速使用

```typescript
import { readChunks, saveBlob } from '@cat-kit/fe'

for await (const chunk of readChunks(file, { chunkSize: 1024 * 1024 })) {
  console.log(chunk.byteLength)
}

saveBlob(new Blob(['hello']), 'output.txt')
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## readChunks - 分块读取文件

`readChunks` 返回 `AsyncGenerator<Uint8Array>`，支持 `for await...of` 遍历，可 `break` 提前退出。

### 基本用法

```typescript
import { readChunks } from '@cat-kit/fe'

for await (const chunk of readChunks(file)) {
  console.log(`块大小：${chunk.byteLength} 字节`)
}
```

### 完整示例

```typescript
import { readChunks } from '@cat-kit/fe'

const input = document.querySelector<HTMLInputElement>('#fileInput')
input?.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  let index = 0
  for await (const chunk of readChunks(file, { chunkSize: 1024 * 1024 })) {
    console.log(`读取第 ${index++} 块，数据：`, chunk)
  }

  console.log('文件读取完成')
})
```

### 计算文件 MD5

```typescript
import { readChunks } from '@cat-kit/fe'
import SparkMD5 from 'spark-md5'

async function calculateMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer()

  for await (const chunk of readChunks(file, { chunkSize: 2 * 1024 * 1024 })) {
    spark.append(chunk.buffer)
  }

  return spark.end()
}

const file = document.querySelector<HTMLInputElement>('#file')?.files?.[0]
if (file) {
  const md5 = await calculateMD5(file)
  console.log('文件 MD5:', md5)
}
```

### 大文件上传

```typescript
import { readChunks } from '@cat-kit/fe'

async function uploadLargeFile(file: File, uploadUrl: string) {
  const chunkSize = 5 * 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)
  let chunkIndex = 0

  for await (const chunk of readChunks(file, { chunkSize })) {
    const formData = new FormData()
    formData.append('file', new Blob([chunk]))
    formData.append('chunkIndex', String(chunkIndex))
    formData.append('totalChunks', String(totalChunks))
    formData.append('filename', file.name)

    await fetch(uploadUrl, { method: 'POST', body: formData })

    chunkIndex++
    console.log(`上传进度：${((chunkIndex / totalChunks) * 100).toFixed(2)}%`)
  }

  console.log('上传完成')
}
```

### 手动控制迭代

```typescript
import { readChunks } from '@cat-kit/fe'

const reader = readChunks(file, { chunkSize: 1024 * 1024 })
const { value, done } = await reader.next()

// 提前终止
await reader.return(undefined)
```

## saveBlob - 保存文件到本地

`saveBlob` 通过 Blob 触发浏览器下载，适用于小到中等大小的文件（< 500MB）。

### 基本用法

```typescript
import { saveBlob } from '@cat-kit/fe'

const file = new File(['Hello World'], 'hello.txt', { type: 'text/plain' })
saveBlob(file, file.name)

const blob = new Blob(['Hello World'], { type: 'text/plain' })
saveBlob(blob, 'hello.txt')
```

### 保存文本文件

```typescript
import { saveBlob } from '@cat-kit/fe'

function saveTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveBlob(blob, filename)
}

saveTextFile('Hello, World!', 'greeting.txt')
```

### 保存 JSON 文件

```typescript
import { saveBlob } from '@cat-kit/fe'

function saveJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  saveBlob(blob, filename)
}

const data = { name: 'Alice', age: 25 }
saveJSON(data, 'user.json')
```

### 保存 Canvas 为图片

```typescript
import { saveBlob } from '@cat-kit/fe'

function saveCanvasAsImage(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (blob) {
      saveBlob(blob, filename)
    }
  }, 'image/png')
}

const canvas = document.querySelector<HTMLCanvasElement>('#myCanvas')
if (canvas) {
  saveCanvasAsImage(canvas, 'drawing.png')
}
```

### 保存 CSV 文件

```typescript
import { saveBlob } from '@cat-kit/fe'

function saveCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => row[h]).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveBlob(blob, filename)
}

const users = [
  { name: 'Alice', age: 25, city: 'Beijing' },
  { name: 'Bob', age: 30, city: 'Shanghai' }
]
saveCSV(users, 'users.csv')
```

## 完整工作流示例

### 文件处理工作流

```typescript
import { readChunks, saveBlob } from '@cat-kit/fe'

const input = document.querySelector<HTMLInputElement>('#fileInput')
input?.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 收集所有块
  const chunks: Uint8Array[] = []
  for await (const chunk of readChunks(file, { chunkSize: 1024 * 1024 })) {
    chunks.push(chunk)
  }

  // 合并数据
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  // 保存处理后的文件
  const processedBlob = new Blob([result], { type: file.type })
  saveBlob(processedBlob, `processed_${file.name}`)
})
```

## API详解

### readChunks

```typescript
function readChunks(
  file: Blob | File,
  options?: {
    chunkSize?: number
    offset?: number
  }
): AsyncGenerator<Uint8Array>
```

**参数：**

- `file`: 要读取的 File 或 Blob 对象
- `options.chunkSize`: 每块大小（字节），默认 10MB
- `options.offset`: 开始读取的偏移量（字节），默认 0

### saveBlob

```typescript
function saveBlob(blob: Blob, filename: string): void
```

**参数：**

- `blob`: 需要保存的 Blob 或 File 对象
- `filename`: 下载文件名

**行为：**

- 触发浏览器下载，将文件保存到用户指定位置
- 使用浏览器原生的下载机制（`<a>` 标签 + `download` 属性）
