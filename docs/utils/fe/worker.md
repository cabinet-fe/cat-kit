# WebWorker 工作线程

工作线程的引入是为了防止js主线程被阻塞的， **大多数情况下**你不需要用到，因为js是异步非阻塞的，只有在主线程涉及到大量计算时你需要用到它。

工作线程在大量计算场景下可以更好地利用多核CPU的性能。

本工具基于web worker封装了一些对多线程有要求的API。

## getFileMD5

获取文件的md5值。

::: demo
render(utils/fe/worker/file)
:::
