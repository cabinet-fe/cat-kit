# @cat-kit/core 示例

## 数组

```ts
import { arr, union } from '@cat-kit/core'

const xs = union([1, 2], [2, 3])
```

## 树

```ts
import { TreeManager } from '@cat-kit/core'

const tree = new TreeManager({ id: '1', children: [] })
```

## 高精度运算

```ts
import { $n } from '@cat-kit/core'

// 精确四则运算（支持 number | string）
$n.plus(0.1, 0.2) // 0.3
$n.mul('19.9', 100) // 1990

// 大数精度（建议用 string 避免 number 解析丢失精度）
$n.plus('1234567890123456.1', '0.1') // 1234567890123456.2

// 表达式计算
$n.calc('0.1 + 0.2') // 0.3
```

完整导出见 [`generated/index.d.ts`](generated/index.d.ts)。
