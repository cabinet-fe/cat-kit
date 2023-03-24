# 浏览器API

浏览器api是一套在浏览器端实现的功能


## 复制功能 clipboard

复制底层基于navigator.clipboard和document.execCommand('copy')

::: demo
render(utils/fe/web-api/clipboard)
:::

## 读取文件 readFile

文件读取操作用于获取文件的二进制内容, 将媒体文件读取后展示在页面上等等

::: demo
render(utils/fe/web-api/read-file)
:::