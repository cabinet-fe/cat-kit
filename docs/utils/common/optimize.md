# 优化

通过优化方法能够让你的程序性能更好

## 节流

::: demo
render(utils/common/optimize/throttle)
:::

## 防抖

::: demo
render(utils/common/optimize/debounce)
:::

## 并发控制

在一些大量并发, 例如文件分片上传时很有用

### API

```ts
import { ConcurrenceController } from 'cat-kit/fe'

const cc = new ConcurrenceController({
  // 队列
  queue: [],
  // 队列中的每一个元素的并发操作(异步)
  async action(item) {},
  // 最大并发数量（同时）
  max: 3,
  // 并发模式, continue:并发任务中有部分失败继续执行剩余任务, end:并发任务中有1个失败立马结束所有并发, 默认end
  mode: 'continue'
})

// 并发全部成功后的回调
cc.on('success', e => {})
// 并发完成后的回调，可能会有失败的任务
cc.on('complete', e => {})
// 并发失败时的回调
cc.on('failed', e => {})

// 开始任务
cc.start()
// 暂停任务
cc.pause()

// 继续任务
cc.continue()
```

::: demo
render(utils/common/optimize/concurrent)
:::

## 安全执行

::: demo
render(utils/common/optimize/safe-run)
:::
