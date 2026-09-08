---
title: "clipboard 剪贴板与 queryPermission 权限查询 API"
description: "@cat-kit/fe Web API 模块完整签名：clipboard.copy/read/readText 的行为与拒绝原因（含字符串 reject 的特殊路径）、queryPermission 的 denied/prompt/查询失败三态语义。"
aliases: [clipboard api, queryPermission, 剪贴板签名, 权限查询签名]
keywords: [clipboard, copy, read, readText, queryPermission, WebPermissionName, ClipboardItem, clipboard-write, clipboard-read, 复制文本, 读取剪贴板, 复制图片, 权限预查, execCommand 回退]
---

# clipboard 剪贴板与 queryPermission 权限查询 API

`@cat-kit/fe` 从包根导出 `clipboard`（系统剪贴板读写对象）与 `queryPermission`（权限状态查询函数）。三个剪贴板方法全部异步；失败路径有两类：抛 `Error` 实例，或直接 reject 字符串（见方法与事件与注意事项）。

## 快速上手

```ts
import { clipboard } from '@cat-kit/fe'

try {
  await clipboard.copy('要复制的文本')
  const text = await clipboard.readText()
  console.log(text) // => '要复制的文本'
} catch (err) {
  // 失败路径两类：抛 Error 实例，或直接 reject 字符串（见注意事项）
  console.log('复制失败', String(err))
}
```

## API 签名

```ts
export declare const clipboard: {
  /**
   * 写入系统剪贴板。
   * 有 navigator.clipboard 时查询 clipboard-write 权限后走 Clipboard API；
   * 无 navigator.clipboard 时字符串走 document.execCommand('copy') 回退，
   * 非 string 数据直接 reject。
   */
  copy(data: string | Blob | Array<string | Blob>): Promise<void>
  /** 读取剪贴板全部条目，按 MIME 类型逐个取出 Blob */
  read(): Promise<Blob[]>
  /** 读取剪贴板纯文本 */
  readText(): Promise<string>
}

export type WebPermissionName = PermissionName | 'clipboard-read' | 'clipboard-write'

/** 查询权限状态；仅 'denied' 返回 false，查询异常视为可用。不触发授权弹窗 */
export declare function queryPermission(name: WebPermissionName): Promise<boolean>
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `data`（copy） | `string \| Blob \| Array<string \| Blob>` | — | 是 | `string` 写为 `text/plain`；`Blob` 按其 `type` 写入；数组内每项递归按上述规则生成一个 `ClipboardItem`；其他类型抛 `Error('写入到剪切板的数据类型不正确')` |
| `name`（queryPermission） | `WebPermissionName` | — | 是 | 任意标准 `PermissionName`（如 `'geolocation'`）或 `'clipboard-read'` / `'clipboard-write'` |

## 方法与事件

- `clipboard.copy(data)`：异步，`Promise<void>`。
  - `navigator.clipboard` 存在：先 `queryPermission('clipboard-write')`，为 `false` 时 reject 字符串 `'用户未授权复制到剪切板操作'`；否则经 `ClipboardItem` 调 `clipboard.write`
  - `navigator.clipboard` 不存在：`string` 走隐藏 `textarea` + `document.execCommand('copy')` 回退（文本经 `JSON.stringify` 处理，见注意事项）；非 `string` reject 字符串 `'当前环境无法复制字符串以外的数据'`
- `clipboard.read()`：异步，`Promise<Blob[]>`。
  - `navigator.clipboard.read` 不存在：抛 `Error('当前浏览器不支持从剪切板读取数据')`
  - 权限 `denied`：抛 `Error('用户未授权读取剪切板内容')`
  - 成功：返回全部条目全部 MIME 类型对应的 `Blob` 数组（每个条目的每个类型一个元素）
- `clipboard.readText()`：异步，`Promise<string>`。
  - `navigator.clipboard.readText` 不存在：抛 `Error('当前浏览器不支持从剪切板读取数据')`
  - 读取被拒或失败：reject 字符串 `'无法读取剪切板内容'`
- `queryPermission(name)`：异步，`Promise<boolean>`。`navigator.permissions.query` 结果仅 `state === 'denied'` 返回 `false`，`'granted'` 与 `'prompt'` 都返回 `true`；`query` 抛错时按 `{ state: 'granted' }` 处理即返回 `true`；从不触发浏览器授权弹窗

## 典型示例

### 复制并按失败原因提示

```ts
import { clipboard } from '@cat-kit/fe'

async function copyLink(link: string) {
  try {
    await clipboard.copy(link)
    console.log('已复制')
  } catch (err) {
    // 字符串 reject 路径：'用户未授权复制到剪切板操作'
    console.log(String(err)) // => '用户未授权复制到剪切板操作'（被拒时）
  }
}

await copyLink('https://example.com')
```

### 读取剪贴板全部内容

```ts
import { clipboard } from '@cat-kit/fe'

try {
  const blobs = await clipboard.read()
  for (const blob of blobs) {
    console.log(blob.type, blob.size) // => 'text/plain' 5（剪贴板内容为 'hello' 时）
  }
} catch (err) {
  if (err instanceof Error && err.message === '用户未授权读取剪切板内容') {
    console.log('请在浏览器设置中允许读取剪贴板')
  }
}
```

### 权限预查后复制 Blob 数组

```ts
import { clipboard, queryPermission } from '@cat-kit/fe'

const canWrite = await queryPermission('clipboard-write')
console.log(canWrite) // => true（'granted' 与 'prompt' 都返回 true）

if (canWrite) {
  const png = new Blob([], { type: 'image/png' }) // 实际场景为 canvas.toBlob 的结果
  await clipboard.copy(['文本说明', png]) // 数组：一个 ClipboardItem 存文本，一个存图片
}
```

## 注意事项

> [!WARNING]
> - 本库三个失败路径 reject 的是**字符串**而不是 `Error`：`'用户未授权复制到剪切板操作'`、`'当前环境无法复制字符串以外的数据'`、`'无法读取剪切板内容'`。对这些路径 `err instanceof Error` 为 `false`，判断用 `String(err)` 或字符串比较；`read` / `readText` 的「不支持」与 `read` 的「未授权」则抛真正的 `Error`。
> - 旧浏览器回退路径（无 `navigator.clipboard` 时）对文本执行 `JSON.stringify(data)`：复制纯文本粘贴出来**带双引号**（`复制` 粘贴为 `"复制"`）。本库是 JSON 序列化，不是原文写入。
> - `queryPermission` 是只读预查：`'prompt'` 状态也返回 `true`（视为可用），真正的授权请求发生在调用 `navigator.clipboard` 读写时，本库不会替你弹授权框。
> - `navigator.clipboard` 仅存在于安全上下文（HTTPS / `localhost`）；HTTP 站点上 `copy` 走 `execCommand` 回退（且仅字符串可用），`read` / `readText` 直接抛 `Error('当前浏览器不支持从剪切板读取数据')`。
