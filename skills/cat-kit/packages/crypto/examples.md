# @cat-kit/crypto 示例

## 基础用法

```ts
import { nanoid } from '@cat-kit/crypto'

const id = nanoid()
const shortId = nanoid(8)
```

## 自定义字符集

```ts
import { customAlphabet } from '@cat-kit/crypto'

const createOrderNo = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

createOrderNo()
```

## 随机字节

```ts
import { random } from '@cat-kit/crypto'

const bytes = random(16)
```
