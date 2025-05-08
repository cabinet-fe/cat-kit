# MD5 摘要算法

## 使用示例

```ts
import { MD5 } from '@cat-kit/crypto'

MD5.hash('hello world')

// 对大文件进行摘要时，可以传入chunkSize用于分块摘要，可以对超过2G的文件进行摘要
MD5.hash(new File([], 'xxx'), {
  chunkSize: 2 * 1024 * 1024
})
```
