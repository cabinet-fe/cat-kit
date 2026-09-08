---
title: "@cat-kit/fe 文件导入流水线与日志列表组合场景"
description: 组合 @cat-kit/fe 的 storage、readChunks、clipboard 与 Virtualizer：用户选择文件后记录上传历史、分块读取统计字节、复制结果摘要，并把日志行渲染在虚拟列表里。
aliases: [fe examples, 组合用法, 上传文件示例, use case]
keywords: [storageKey, storage, readChunks, clipboard, copy, Virtualizer, subscribe, measureElement, destroy, 文件上传, 分块读取, 复制文本, 虚拟列表, 上传记录]
---

# @cat-kit/fe 文件导入流水线与日志列表组合场景

场景：用户在页面选择大文件后，前端要记录上传历史（刷新后仍可见）、分块读取文件做校验或分片上传、把处理摘要复制给用户分享，同时在日志面板里实时滚动展示处理进度。方案组合 `@cat-kit/fe` 的四个模块：`storage.local` 记历史、`readChunks` 分块读、`clipboard.copy` 写剪贴板、`Virtualizer` 渲染日志列表。

## 场景

- 何时用本方案：一个业务流程里同时需要「持久化记录 + 大文件分块处理 + 结果输出 + 大量日志渲染」，且这些能力都在浏览器端完成
- 何时不用：只用其中单一能力时，直接读对应模块文档即可——存储见 `packages/fe/storage/index.md`，文件见 `packages/fe/file/index.md`，剪贴板见 `packages/fe/web-api/index.md`，虚拟列表见 `packages/fe/virtualizer/index.md`

## 完整示例

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-CN">
  <body>
    <input id="picker" type="file" />
    <button id="copy-summary">复制摘要</button>
    <div id="log" style="height: 300px; overflow: auto; position: relative">
      <div id="log-content"></div>
    </div>
    <script type="module" src="/src/upload-log.ts"></script>
  </body>
</html>
```

```ts
// src/upload-log.ts
import { clipboard, readChunks, storage, storageKey, Virtualizer } from '@cat-kit/fe'

// 类型化存储键：最近一次上传的文件名，7 天过期
const LAST_FILE = storageKey<string>('last-file-name')

const logs: string[] = []
const logList = new Virtualizer({ count: 0, estimateSize: () => 24 })
const logEl = document.querySelector<HTMLElement>('#log')!
const logContent = document.querySelector<HTMLElement>('#log-content')!

logList.connect(logEl)

function appendLog(line: string) {
  logs.push(line)
  logList.setCount(logs.length) // 收缩/扩张都会自动重算并通知订阅
}

logList.subscribe(({ items, beforeSize, afterSize }) => {
  logContent.style.paddingTop = `${beforeSize}px`
  logContent.style.paddingBottom = `${afterSize}px`
  logContent.replaceChildren(
    ...items.map((item) => {
      const div = document.createElement('div')
      div.textContent = logs[item.index]
      logList.measureElement(item.index, div) // 日志行高随文本长度回灌
      return div
    })
  )
})

async function handleFile(file: File) {
  appendLog(`开始处理：${file.name}（${file.size} 字节）`)

  // 1. 记录文件名，7 天后过期（exp 单位是秒）
  storage.local.set(LAST_FILE, file.name, 7 * 24 * 3600)

  // 2. 分块读取并累计字节数，模拟逐块处理
  let read = 0
  for await (const chunk of readChunks(file, { chunkSize: 512 * 1024 })) {
    read += chunk.byteLength
  }
  appendLog(`分块读取完成：${read} 字节`)

  // 3. 摘要写入剪贴板；失败路径 reject 的是字符串，不能只判 instanceof Error
  try {
    await clipboard.copy(`已处理 ${file.name}，共 ${read} 字节`)
    appendLog('摘要已复制到剪贴板')
  } catch (err) {
    appendLog(`复制失败：${String(err)}`)
  }

  appendLog(`上次上传：${storage.local.get(LAST_FILE)}`)
}

document.querySelector<HTMLInputElement>('#picker')!.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) void handleFile(file)
})

document.querySelector<HTMLButtonElement>('#copy-summary')!.addEventListener('click', () => {
  void clipboard.copy(logs.join('\n'))
})

// 页面卸载销毁虚拟列表，释放事件与观察器
window.addEventListener('beforeunload', () => {
  logList.destroy()
})
```

## 要点说明

- `storageKey<string>('last-file-name')`：键携带类型信息，`storage.local.get(LAST_FILE)` 返回 `string | null`；`exp` 参数 `7 * 24 * 3600` 是**秒**，`0` 或缺省表示永不过期
- `readChunks(file, { chunkSize: 512 * 1024 })`：`for await` 逐块产出 `Uint8Array`；`chunkSize` 必须大于 0，否则本库会无限产出空块死循环
- `clipboard.copy` 的失败路径 reject 的是字符串（如 `'用户未授权复制到剪切板操作'`），用 `String(err)` 统一处理，不要依赖 `instanceof Error`
- `logList.setCount(logs.length)`：日志只增不减，每次 `setCount` 触发结构性重算；`subscribe` 回调里用 `beforeSize` / `afterSize` 撑起滚动高度、`measureElement` 回灌行高
- `logList.destroy()`：`connect` 过的实例卸载时必须销毁，否则 `scroll` 监听与 `ResizeObserver` 泄漏

## 注意事项

> [!WARNING]
> - `storage.local` 的值类型仅接受 `string` / `number` / `object`（含数组）/ `boolean`；`null`、`undefined`、`function`、`symbol` 静默跳过不写入，`bigint` 抛 `TypeError`。`File` 对象本身不能存，本方案只存 `file.name`。
> - `navigator.clipboard` 仅在安全上下文（HTTPS / `localhost`）可用；HTTP 环境下 `copy(string)` 走 `execCommand` 回退且文本经 `JSON.stringify`，粘贴结果带双引号。
> - 虚拟列表快照在纯滚动帧引用不变，禁止用 `===` 判断是否重渲染；本方案的渲染统一走 `subscribe` 回调。
> - `read` / `readText` 需要浏览器支持并授权剪贴板读取；被拒时 `read` 抛 `Error('用户未授权读取剪切板内容')`。
