# 浏览器API

浏览器api是一套在浏览器端实现的功能


## 复制功能 clipboard

复制底层基于navigator.clipboard和document.execCommand('copy')

document.execCommand('copy')已经被web标准标记为**废弃**，但目前仍然需要使用它， 因为navigator.clipboard要求在安全URL下访问的网站应用才可访问。

::: demo
render(utils/fe/web-api/clipboard)
:::

## 读取文件 readFile

文件读取操作用于获取文件的二进制内容, 将媒体文件读取后展示在页面上等等。

::: tip
可以在WebWorker中使用

```ts
// read-file.worker.ts
import { readFile } from '@cat/fe'

onmessage = async (e: MessageAccept) {
  const { result } = await readFile(e.data, 'arrayBuffer')
  postMessage(result)

  self.close()
}

```
:::

::: demo
render(utils/fe/web-api/read-file)
:::