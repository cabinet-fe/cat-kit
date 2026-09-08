---
title: "@cat-kit/http 文件下载进度监控与请求中止"
description: "用 FetchEngine 的流式 onDownloadProgress 回调监控大文件下载进度，结合 responseType: 'blob' 拿到文件对象，用 timeout 超时自动终止、AbortController signal 手动取消，错误统一走 HTTPError 分流。"
aliases: [下载进度, 下载进度条, 大文件下载, 请求中止, 取消下载]
keywords: [FetchEngine, onDownloadProgress, ProgressInfo, responseType, AbortController, signal, HTTPError, ABORTED, TIMEOUT, abort, blob, percent, loaded, total, 下载进度, 下载进度条, 大文件下载, 请求中止, 超时取消]
---

# @cat-kit/http 文件下载进度监控与请求中止

下载大文件（报表、图片、安装包）时展示实时百分比并支持取消：用 `FetchEngine` 的流式 `onDownloadProgress` 回调拿到 `ProgressInfo`（`loaded` / `total` / `percent`），用 `responseType: 'blob'` 接住文件内容，用 `timeout` 做超时自动终止（`code: 'TIMEOUT'`）、用 `AbortController` 做手动取消（`code: 'ABORTED'`），失败统一走 `HTTPError` 分流。

## 场景

- 何时用本方案：需要下载进度百分比（`percent`）、已下载字节数（`loaded`）或下载中取消的请求；响应体较大、需要 `blob` / `arraybuffer` 结果的下载。
- 何时不用：上传进度监控。`FetchEngine` 忽略 `onUploadProgress`，上传进度改用 `XHREngine`（见 `packages/http/client/apis.md` 的 `ClientConfig.onUploadProgress`）。

## 完整示例

```ts
// src/download.ts
import { FetchEngine, HTTPClient, HTTPError } from '@cat-kit/http'
import type { ProgressInfo } from '@cat-kit/http'

// 显式指定 FetchEngine：下载进度依赖其流式读取能力
const http = new HTTPClient('', {
  engine: new FetchEngine(),
  origin: 'https://files.example.com'
})

function renderProgress(info: ProgressInfo): void {
  // total 取自响应 content-length 头；服务器未返回时 total 为 0、percent 恒为 0
  if (info.total === 0) {
    console.log(`已下载 ${info.loaded} bytes（服务器未返回总大小）`)
    return
  }
  console.log(`${info.percent}% (${info.loaded}/${info.total} bytes)`)
  // => 42% (440401/1048576 bytes)
}

export async function downloadReport(id: string, signal?: AbortSignal): Promise<Blob> {
  try {
    const res = await http.get<Blob>(`/reports/${id}`, {
      responseType: 'blob',
      timeout: 60_000, // 60 秒未完成自动终止，抛 code 'TIMEOUT'
      signal, // 外部手动取消信号，抛 code 'ABORTED'
      onDownloadProgress: renderProgress
    })
    return res.body
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.code === 'TIMEOUT') {
        throw new Error(`下载超时：${error.message}`) // => '下载超时：请求超时'
      }
      if (error.code === 'ABORTED') {
        throw new Error(`下载已取消：${error.message}`) // => '下载已取消：请求被中止'
      }
      if (error.code === 'NETWORK') {
        throw new Error(`下载失败，状态码: ${error.response?.code}`)
      }
    }
    throw error
  }
}

const blob = await downloadReport('2024-annual')
console.log(blob.size) // => 1048576
```

```html
<!-- index.html：页面按钮触发下载与手动取消 -->
<button id="start">开始下载</button>
<button id="cancel">取消</button>
<script type="module">
  import { downloadReport } from './src/download.ts'

  const controller = new AbortController()
  document.getElementById('start').onclick = () =>
    downloadReport('2024-annual', controller.signal).catch((error) => console.error(error.message))
  document.getElementById('cancel').onclick = () => controller.abort()
</script>
```

## 要点说明

- `engine: new FetchEngine()`：`onDownloadProgress` 在 `FetchEngine` 下走流式读取（`response.body.getReader()`）路径，每个分片到达即回调；全局 `fetch` 存在时客户端默认就用 `FetchEngine`，显式传入是为了锁定行为。
- `total` 来源是响应头 `content-length`：缺失或非正数时 `total` 为 `0`，`percent` 固定为 `0`，`loaded` 仍递增，界面须同时兼容两种形态。
- `percent` 计算为 `Math.floor((loaded / total) * 100)` 并收敛到 0-100；流读完后回调一次最终值，最后一段的 `percent` 为 `100`。
- `responseType: 'blob'`：不设置时按响应 `Content-Type` 推断（`application/octet-stream`、`image/*`、`video/*`、`audio/*`、`application/pdf` 推断为 `blob`）；需要稳定类型时显式指定。
- 终止有两种来源且 `code` 不同：`timeout` 到期为 `'TIMEOUT'`（`message` 为 `'请求超时'`），`signal` 中止为 `'ABORTED'`（`message` 为 `'请求被中止'`）；错误分流时两者都要处理。
- 非 2xx 响应同样抛 `HTTPError`（`code: 'NETWORK'`），已下载部分的进度回调会先触发，错误体在 `error.response.body`。
- `res.raw` 是原生 `Response` 对象：需要响应头以外的元信息（如 `res.headers['content-type']`、最终 URL）时从 `res.raw` 读取。
- 未传 `onDownloadProgress` 或响应体不支持流式读取时，引擎退回一次性解析路径（`response.blob()` / `response.text()` / `response.arrayBuffer()`），请求结果不变，只是没有进度回调。

## 注意事项

> [!WARNING]
> - 下载进度只在 `FetchEngine` 且响应体支持流式读取时生效；`FetchEngine` 是 `onDownloadProgress` 生效的前提，不是任何引擎都回调。
> - `total` 依赖服务器返回 `content-length`：分块传输（`Transfer-Encoding: chunked`）时没有该头，`total` 为 `0`、`percent` 恒为 `0`，进度条须回退为已下载字节数展示。
> - 本库的 `onDownloadProgress` 入参是 `ProgressInfo`（`loaded` / `total` / `percent`），不是原生 `ProgressEvent`；不要读 `e.lengthComputable`。
> - `FetchEngine` 忽略 `onUploadProgress`；上传进度须改用 `XHREngine`，参见 `packages/http/client/apis.md`。
> - `timeout` 与 `signal` 可同时配置：超时走 `'TIMEOUT'`，手动中止走 `'ABORTED'`，不要只判断其中一种。
> - `abort()`（客户端方法）会中止该引擎上全部在途请求，`group()` 父子共享引擎时影响面是整组；单请求取消用 `signal`。
