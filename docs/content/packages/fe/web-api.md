# Web API

## 介绍

本页介绍 `@cat-kit/fe` 对常用 Web API 的封装，包含剪贴板读写与权限查询。

## 快速使用

```typescript
import { clipboard, queryPermission } from '@cat-kit/fe'

await clipboard.copy('hello cat-kit')
const text = await clipboard.readText()
const hasClipboardRead = await queryPermission('clipboard-read')

console.log(text, hasClipboardRead)
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## Clipboard - 剪贴板

统一的剪贴板读写 API，支持文本和 Blob 数据。

### 复制文本

```typescript
import { clipboard } from '@cat-kit/fe'

// 复制简单文本
await clipboard.copy('Hello, World!')

// 复制按钮示例
button.addEventListener('click', async () => {
  try {
    await clipboard.copy('复制的内容')
    alert('复制成功')
  } catch (error) {
    alert('复制失败：' + error.message)
  }
})
```

### 复制 Blob 数据

```typescript
import { clipboard } from '@cat-kit/fe'

// 复制图片
const response = await fetch('image.png')
const blob = await response.blob()
await clipboard.copy(blob)

// 复制 Canvas 内容
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
canvas?.toBlob(async blob => {
  if (blob) {
    await clipboard.copy(blob)
    console.log('Canvas 内容已复制到剪贴板')
  }
})
```

### 复制多个项目

```typescript
import { clipboard } from '@cat-kit/fe'

// 同时复制文本和图片
const text = '图片描述'
const imageBlob = await fetch('image.png').then(r => r.blob())

await clipboard.copy([text, imageBlob])
```

### 读取剪贴板

```typescript
import { clipboard } from '@cat-kit/fe'

// 读取文本
const text = await clipboard.readText()
console.log('剪贴板内容：', text)

// 读取所有数据（返回 Blob 数组）
const blobs = await clipboard.read()
for (const blob of blobs) {
  console.log('类型：', blob.type)
  if (blob.type.startsWith('image/')) {
    // 处理图片
    const url = URL.createObjectURL(blob)
    console.log('图片 URL：', url)
  } else if (blob.type === 'text/plain') {
    // 处理文本
    const text = await blob.text()
    console.log('文本：', text)
  }
}
```

### 粘贴事件处理

```typescript
import { clipboard } from '@cat-kit/fe'

// 监听粘贴事件
document.addEventListener('paste', async e => {
  e.preventDefault()

  try {
    const blobs = await clipboard.read()

    for (const blob of blobs) {
      if (blob.type.startsWith('image/')) {
        // 处理粘贴的图片
        const img = document.createElement('img')
        img.src = URL.createObjectURL(blob)
        document.body.appendChild(img)
      } else if (blob.type === 'text/plain') {
        // 处理粘贴的文本
        const text = await blob.text()
        console.log('粘贴的文本：', text)
      }
    }
  } catch (error) {
    console.error('读取剪贴板失败：', error)
  }
})
```

### 图片编辑器复制功能

```typescript
import { clipboard } from '@cat-kit/fe'

class ImageEditor {
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async copyToClipboard() {
    return new Promise<void>((resolve, reject) => {
      this.canvas.toBlob(async blob => {
        if (!blob) {
          reject(new Error('无法生成图片'))
          return
        }

        try {
          await clipboard.copy(blob)
          resolve()
        } catch (error) {
          reject(error)
        }
      }, 'image/png')
    })
  }

  async pasteFromClipboard(): Promise<HTMLImageElement> {
    const blobs = await clipboard.read()
    const imageBlob = blobs.find(b => b.type.startsWith('image/'))

    if (!imageBlob) {
      throw new Error('剪贴板中没有图片')
    }

    const img = new Image()
    img.src = URL.createObjectURL(imageBlob)
    await new Promise(resolve => (img.onload = resolve))

    return img
  }
}
```

### 权限处理

```typescript
import { clipboard, queryPermission } from '@cat-kit/fe'

async function copyWithPermissionCheck(text: string) {
  // 检查写入权限
  const hasWritePermission = await queryPermission('clipboard-write')

  if (!hasWritePermission) {
    alert('需要剪贴板写入权限')
    return
  }

  try {
    await clipboard.copy(text)
    console.log('复制成功')
  } catch (error) {
    console.error('复制失败：', error)
  }
}

async function readWithPermissionCheck() {
  // 检查读取权限
  const hasReadPermission = await queryPermission('clipboard-read')

  if (!hasReadPermission) {
    alert('需要剪贴板读取权限')
    return
  }

  try {
    const text = await clipboard.readText()
    console.log('读取成功：', text)
  } catch (error) {
    console.error('读取失败：', error)
  }
}
```

## Permission - 权限查询

查询浏览器 Web API 权限状态。

### 基本用法

```typescript
import { queryPermission } from '@cat-kit/fe'

// 查询剪贴板读取权限
const canReadClipboard = await queryPermission('clipboard-read')
console.log('可以读取剪贴板：', canReadClipboard)

// 查询剪贴板写入权限
const canWriteClipboard = await queryPermission('clipboard-write')
console.log('可以写入剪贴板：', canWriteClipboard)

// 查询通知权限
const canNotify = await queryPermission('notifications')
console.log('可以发送通知：', canNotify)

// 查询地理位置权限
const canUseGeo = await queryPermission('geolocation')
console.log('可以使用地理位置：', canUseGeo)
```

### 支持的权限类型

```typescript
type WebPermissionName =
  | 'geolocation'
  | 'notifications'
  | 'persistent-storage'
  | 'push'
  | 'screen-wake-lock'
  | 'xr-spatial-tracking'
  | 'clipboard-read' // 剪贴板读取（扩展）
  | 'clipboard-write' // 剪贴板写入（扩展）
```

### 权限状态

权限查询返回布尔值：

- `true`: 权限已授予（`granted`）
- `false`: 权限被拒绝（`denied`）或需要提示（`prompt`）

### 实用示例

#### 条件渲染 UI

```typescript
import { queryPermission } from '@cat-kit/fe'

async function setupUI() {
  const canUseNotifications = await queryPermission('notifications')

  const notificationButton = document.querySelector('#notifyButton')
  if (notificationButton) {
    notificationButton.disabled = !canUseNotifications
    notificationButton.title = canUseNotifications
      ? '发送通知'
      : '通知权限未授予'
  }
}
```

#### 功能降级

```typescript
import { queryPermission, clipboard } from '@cat-kit/fe'

async function copyText(text: string) {
  const hasClipboardAPI = await queryPermission('clipboard-write')

  if (hasClipboardAPI) {
    // 使用 Clipboard API
    await clipboard.copy(text)
  } else {
    // 降级到旧方法
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
```

#### 权限请求流程

```typescript
import { queryPermission } from '@cat-kit/fe'

async function requestNotificationPermission() {
  // 先查询当前状态
  const hasPermission = await queryPermission('notifications')

  if (hasPermission) {
    console.log('已有通知权限')
    return true
  }

  // 请求权限
  const result = await Notification.requestPermission()

  if (result === 'granted') {
    console.log('用户授予了通知权限')
    return true
  } else {
    console.log('用户拒绝了通知权限')
    return false
  }
}
```

## API详解

### clipboard.copy

```typescript
function copy(data: string | Blob | Array<string | Blob>): Promise<void>
```

**参数：**

- `data`: 要复制的数据，可以是文本、Blob 或它们的数组

**返回值：**

- `Promise<void>`: 复制完成

**异常：**

- 用户拒绝权限
- 浏览器不支持 Clipboard API
- 数据类型不正确

### clipboard.read

```typescript
function read(): Promise<Blob[]>
```

**返回值：**

- `Promise<Blob[]>`: 剪贴板中的所有项目（Blob 数组）

**异常：**

- 用户拒绝权限
- 浏览器不支持 Clipboard API

### clipboard.readText

```typescript
function readText(): Promise<string>
```

**返回值：**

- `Promise<string>`: 剪贴板中的文本内容

**异常：**

- 用户拒绝权限
- 浏览器不支持 Clipboard API

### queryPermission

```typescript
function queryPermission(name: WebPermissionName): Promise<boolean>
```

**参数：**

- `name`: 权限名称

**返回值：**

- `Promise<boolean>`: 是否有权限（`true` 表示已授予，`false` 表示未授予或被拒绝）

## 浏览器兼容性

### Clipboard API

- **Chrome**: 66+（文本），76+（图片）
- **Firefox**: 63+（文本），90+（图片）
- **Safari**: 13.1+
- **Edge**: 79+

### Permissions API

- **Chrome**: 43+
- **Firefox**: 46+
- **Safari**: 16+（部分支持）
- **Edge**: 79+

## 注意事项

1. **HTTPS 要求**：Clipboard API 需要在 HTTPS 环境或 localhost 下使用
2. **用户手势**：某些浏览器要求在用户手势（如点击）触发的事件中调用
3. **权限提示**：首次使用会提示用户授权
4. **跨域限制**：只能在同源页面中使用
5. **焦点要求**：某些浏览器要求页面必须获得焦点才能读写剪贴板
