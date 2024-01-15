# 哈希函数(信息摘要)
本工具整合了两种最常用的哈希函数。

sha256比md5的安全性更高，但性能略低。

如果是计算大文件，不管是使用md5还是sha256，都推荐在Web Worker中执行他们。

## MD5

用于获取信息或者文件的摘要数据。

### API

```ts
import { MD5 } from 'cat-kit/crypto'

MD5('你好').then(md5 => {
  console.log(md5)
})

MD5(file, {
  // 默认尺寸
  chunkSize: 2 * 1024 * 1024,
  // 进度回调
  onProgress(p) {}
})
```

### 示例

::: demo
render(utils/crypto/hash/md5)
:::

## SHA256

用于获取信息或者文件的摘要数据，比md5更加安全

### API

```ts
import { SHA256 } from 'cat-kit/crypto'

SHA256('你好').then(hex => {
  console.log(hex)
})

SHA256(file, {
  // 默认尺寸
  chunkSize: 2 * 1024 * 1024,
  // 进度回调
  onProgress(p) {}
})
```

### 示例

::: demo
render(utils/crypto/hash/sha256)
:::
