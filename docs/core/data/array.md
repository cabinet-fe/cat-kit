---
outline: deep
---

<script setup>
import { ref } from 'vue'
import { chunk, unique, group, sortBy, shuffle } from '@cat-kit/core'

// 示例数据
const numbers = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
const chunkSize = ref(3)
const chunked = ref([])

const duplicates = ref([1, 2, 2, 3, 3, 3, 4, 4, 4, 4])
const uniqueResult = ref([])

const users = ref([
  { id: 1, name: '张三', age: 25, role: 'admin' },
  { id: 2, name: '李四', age: 30, role: 'user' },
  { id: 3, name: '王五', age: 25, role: 'user' },
  { id: 4, name: '赵六', age: 35, role: 'admin' }
])
const grouped = ref({})
const sorted = ref([])

function doChunk() {
  chunked.value = chunk(numbers.value, chunkSize.value)
}

function doUnique() {
  uniqueResult.value = unique(duplicates.value)
}

function doGroup() {
  grouped.value = group(users.value, u => u.role)
}

function doSort() {
  sorted.value = sortBy(users.value, 'age')
}

function doShuffle() {
  numbers.value = shuffle([...numbers.value])
}
</script>

# 数组工具

提供丰富的数组操作工具函数，包括分块、去重、分组、排序等常用操作。

## chunk

将数组分割成指定大小的块。

### 类型签名

```typescript
function chunk<T>(array: T[], size: number): T[][]
```

### 参数

| 参数  | 类型     | 说明         |
| ----- | -------- | ------------ |
| array | `T[]`    | 要分割的数组 |
| size  | `number` | 每块的大小   |

### 返回值

返回一个二维数组，每个子数组的长度不超过 `size`。

### 示例

<Demo>
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label>原始数组: </label>
      <code>{{ numbers }}</code>
    </div>
    <div style="margin-bottom: 1rem;">
      <label>块大小: </label>
      <input
        v-model.number="chunkSize"
        type="number"
        min="1"
        max="10"
        style="width: 80px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>
    <button
      @click="doChunk"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      执行分块
    </button>
    <div v-if="chunked.length" style="margin-top: 1rem;">
      <strong>结果:</strong>
      <pre style="background: #f6f6f7; padding: 1rem; border-radius: 4px; margin-top: 0.5rem;">{{ JSON.stringify(chunked, null, 2) }}</pre>
    </div>
  </div>
</template>

<template #code>

```typescript
import { chunk } from '@cat-kit/core'

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 分割成每块3个元素
const result = chunk(numbers, 3)
console.log(result)
// [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]

// 分割成每块2个元素
const result2 = chunk(numbers, 2)
console.log(result2)
// [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
```

</template>
</Demo>

### 使用场景

- 分页展示数据
- 批量处理大量数据
- 将一维数组转为多列布局

## unique

数组去重，支持基本类型和对象类型。

### 类型签名

```typescript
function unique<T>(array: T[], key?: keyof T | ((item: T) => any)): T[]
```

### 参数

| 参数  | 类型                            | 说明                         |
| ----- | ------------------------------- | ---------------------------- |
| array | `T[]`                           | 要去重的数组                 |
| key   | `keyof T \| ((item: T) => any)` | 可选，指定用于去重的键或函数 |

### 返回值

返回去重后的新数组。

### 示例

<Demo>
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label>原始数组: </label>
      <code>{{ duplicates }}</code>
    </div>
    <button
      @click="doUnique"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      执行去重
    </button>
    <div v-if="uniqueResult.length" style="margin-top: 1rem;">
      <strong>结果:</strong>
      <code>{{ uniqueResult }}</code>
    </div>
  </div>
</template>

<template #code>

```typescript
import { unique } from '@cat-kit/core'

// 基本类型去重
const numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
const result = unique(numbers)
console.log(result) // [1, 2, 3, 4]

// 对象数组按属性去重
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三' }
]
const uniqueUsers = unique(users, 'id')
console.log(uniqueUsers)
// [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]

// 使用函数去重
const uniqueByName = unique(users, u => u.name)
```

</template>
</Demo>

## group

将数组按照指定规则分组。

### 类型签名

```typescript
function group<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]>
```

### 参数

| 参数  | 类型             | 说明             |
| ----- | ---------------- | ---------------- |
| array | `T[]`            | 要分组的数组     |
| keyFn | `(item: T) => K` | 返回分组键的函数 |

### 返回值

返回一个对象，键为分组名，值为该组的元素数组。

### 示例

<Demo>
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <strong>用户列表:</strong>
      <table style="width: 100%; margin-top: 0.5rem; border-collapse: collapse;">
        <thead>
          <tr style="background: #f6f6f7;">
            <th style="padding: 8px; border: 1px solid #ddd;">ID</th>
            <th style="padding: 8px; border: 1px solid #ddd;">姓名</th>
            <th style="padding: 8px; border: 1px solid #ddd;">年龄</th>
            <th style="padding: 8px; border: 1px solid #ddd;">角色</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td style="padding: 8px; border: 1px solid #ddd;">{{ user.id }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ user.name }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ user.age }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      @click="doGroup"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      按角色分组
    </button>
    <div v-if="Object.keys(grouped).length" style="margin-top: 1rem;">
      <strong>分组结果:</strong>
      <pre style="background: #f6f6f7; padding: 1rem; border-radius: 4px; margin-top: 0.5rem;">{{ JSON.stringify(grouped, null, 2) }}</pre>
    </div>
  </div>
</template>

<template #code>

```typescript
import { group } from '@cat-kit/core'

const users = [
  { id: 1, name: '张三', age: 25, role: 'admin' },
  { id: 2, name: '李四', age: 30, role: 'user' },
  { id: 3, name: '王五', age: 25, role: 'user' },
  { id: 4, name: '赵六', age: 35, role: 'admin' }
]

// 按角色分组
const byRole = group(users, u => u.role)
console.log(byRole)
// {
//   admin: [
//     { id: 1, name: '张三', age: 25, role: 'admin' },
//     { id: 4, name: '赵六', age: 35, role: 'admin' }
//   ],
//   user: [
//     { id: 2, name: '李四', age: 30, role: 'user' },
//     { id: 3, name: '王五', age: 25, role: 'user' }
//   ]
// }

// 按年龄分组
const byAge = group(users, u => u.age)
```

</template>
</Demo>

## sortBy

按指定字段或函数对数组排序。

### 类型签名

```typescript
function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => any),
  order?: 'asc' | 'desc'
): T[]
```

### 参数

| 参数  | 类型                            | 说明                     |
| ----- | ------------------------------- | ------------------------ |
| array | `T[]`                           | 要排序的数组             |
| key   | `keyof T \| ((item: T) => any)` | 排序依据的键或函数       |
| order | `'asc' \| 'desc'`               | 排序方向，默认为 `'asc'` |

### 返回值

返回排序后的新数组，不修改原数组。

### 示例

<Demo>
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <strong>原始用户列表:</strong>
      <div style="margin-top: 0.5rem;">
        <span v-for="(user, i) in users" :key="user.id" style="margin-right: 8px;">
          {{ user.name }}({{ user.age }}岁){{ i < users.length - 1 ? ',' : '' }}
        </span>
      </div>
    </div>
    <button
      @click="doSort"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      按年龄排序
    </button>
    <div v-if="sorted.length" style="margin-top: 1rem;">
      <strong>排序结果:</strong>
      <div style="margin-top: 0.5rem;">
        <span v-for="(user, i) in sorted" :key="user.id" style="margin-right: 8px;">
          {{ user.name }}({{ user.age }}岁){{ i < sorted.length - 1 ? ',' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<template #code>

```typescript
import { sortBy } from '@cat-kit/core'

const users = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 20 }
]

// 按年龄升序
const sorted = sortBy(users, 'age')
// [{ age: 20 }, { age: 25 }, { age: 30 }]

// 按年龄降序
const sorted2 = sortBy(users, 'age', 'desc')
// [{ age: 30 }, { age: 25 }, { age: 20 }]

// 使用函数排序
const sorted3 = sortBy(users, u => u.name.length)
```

</template>
</Demo>

## shuffle

随机打乱数组元素顺序。

### 类型签名

```typescript
function shuffle<T>(array: T[]): T[]
```

### 参数

| 参数  | 类型  | 说明         |
| ----- | ----- | ------------ |
| array | `T[]` | 要打乱的数组 |

### 返回值

返回打乱后的新数组。

### 示例

<Demo>
<template #demo>
  <div style="padding: 1rem;">
    <div style="margin-bottom: 1rem;">
      <label>当前数组: </label>
      <code>{{ numbers }}</code>
    </div>
    <button
      @click="doShuffle"
      style="padding: 8px 16px; background: #5f67ee; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      随机打乱
    </button>
  </div>
</template>

<template #code>

```typescript
import { shuffle } from '@cat-kit/core'

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const shuffled = shuffle(numbers)
console.log(shuffled) // [3, 7, 1, 9, 2, 5, 10, 4, 6, 8] (随机结果)

// 洗牌算法，适用于抽奖、随机排序等场景
const cards = ['A', 'K', 'Q', 'J', '10']
const shuffledCards = shuffle(cards)
```

</template>
</Demo>

## 更多函数

### flatten

将多维数组扁平化。

```typescript
import { flatten } from '@cat-kit/core'

const nested = [1, [2, [3, [4]]]]
const flat = flatten(nested)
console.log(flat) // [1, 2, 3, 4]

// 指定深度
const flat2 = flatten(nested, 2)
console.log(flat2) // [1, 2, 3, [4]]
```

### difference

计算数组差集。

```typescript
import { difference } from '@cat-kit/core'

const a = [1, 2, 3, 4, 5]
const b = [3, 4, 5, 6, 7]

const diff = difference(a, b)
console.log(diff) // [1, 2]
```

### intersection

计算数组交集。

```typescript
import { intersection } from '@cat-kit/core'

const a = [1, 2, 3, 4, 5]
const b = [3, 4, 5, 6, 7]

const inter = intersection(a, b)
console.log(inter) // [3, 4, 5]
```

### union

计算数组并集。

```typescript
import { union } from '@cat-kit/core'

const a = [1, 2, 3]
const b = [3, 4, 5]

const u = union(a, b)
console.log(u) // [1, 2, 3, 4, 5]
```

## 类型定义

```typescript
// 数组元素类型
type ArrayElement<T> = T extends (infer E)[] ? E : never

// 分组结果类型
type GroupResult<T, K extends string | number> = Record<K, T[]>

// 排序方向
type SortOrder = 'asc' | 'desc'
```

## 性能建议

1. **大数组操作**：对于大数组（> 10000 元素），考虑使用 `parallel` 函数并行处理
2. **频繁排序**：如果需要频繁排序，考虑使用索引或缓存排序结果
3. **去重优化**：对于基本类型，使用 `Set` 性能更好

```typescript
// ✅ 推荐：基本类型去重
const numbers = [1, 2, 2, 3, 3, 3]
const unique = [...new Set(numbers)]

// ✅ 推荐：复杂对象去重
const users = [...]
const uniqueUsers = unique(users, 'id')
```
