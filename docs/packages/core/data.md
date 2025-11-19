# 数据处理

Core 包提供了丰富的数据处理工具，包括类型判断、对象操作、数组操作、字符串处理、数字处理和数据转换。

## 类型判断

提供了一系列类型判断函数，比 `typeof` 更准确。

### 基础类型判断

```typescript
import {
  isObj,
  isArray,
  isString,
  isNumber,
  isBol,
  isDate,
  isFunction,
  isNull,
  isUndef,
  isEmpty,
  getDataType
} from '@cat-kit/core'

// 获取精确的类型字符串
getDataType([]) // 'array'
getDataType({}) // 'object'
getDataType(null) // 'null'

// 类型判断（带类型守卫）
isObj({}) // true
isArray([]) // true
isString('hello') // true
isNumber(123) // true
isBol(true) // true
isDate(new Date()) // true
isFunction(() => {}) // true
isNull(null) // true
isUndef(undefined) // true

// 空值判断
isEmpty(null) // true
isEmpty(undefined) // true
isEmpty('') // false
isEmpty(0) // false
```

### 特殊类型判断

```typescript
import {
  isBlob,
  isFile,
  isFormData,
  isSymbol,
  isPromise,
  isArrayBuffer,
  isUint8Array,
  isUint16Array,
  isUint32Array,
  isInt8Array,
  isInt16Array,
  isInt32Array
} from '@cat-kit/core'

// 浏览器类型
isBlob(new Blob()) // true
isFile(new File([], 'test.txt')) // true
isFormData(new FormData()) // true

// ES6+ 类型
isSymbol(Symbol('test')) // true
isPromise(Promise.resolve()) // true

// TypedArray 类型
isArrayBuffer(new ArrayBuffer(8)) // true
isUint8Array(new Uint8Array()) // true
isInt32Array(new Int32Array()) // true
```

## 对象操作

使用 `CatObject` 类或 `o()` 工厂函数进行对象操作。

### 基本用法

```typescript
import { o } from '@cat-kit/core'

const user = {
  id: 1,
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
}

const obj = o(user)

// 获取所有键
obj.keys() // ['id', 'name', 'age', 'email']

// 遍历对象
obj.each((key, value) => {
  console.log(`${key}: ${value}`)
})

// 挑选属性
const picked = obj.pick(['id', 'name'])
// { id: 1, name: 'Alice' }

// 忽略属性
const omitted = obj.omit(['age', 'email'])
// { id: 1, name: 'Alice' }
```

### 对象继承

```typescript
import { o } from '@cat-kit/core'

const defaults = {
  theme: 'light',
  fontSize: 14,
  language: 'zh-CN'
}

const userSettings = {
  theme: 'dark',
  fontSize: 16
}

// 从 userSettings 继承属性（只继承已存在的属性）
o(defaults).extend(userSettings)
// { theme: 'dark', fontSize: 16, language: 'zh-CN' }
```

### 深度继承

```typescript
import { o } from '@cat-kit/core'

const defaults = {
  ui: {
    theme: 'light',
    fontSize: 14
  },
  data: {
    cache: true
  }
}

const userConfig = {
  ui: {
    theme: 'dark'
  }
}

// 深度继承
o(defaults).deepExtend(userConfig)
// { ui: { theme: 'dark', fontSize: 14 }, data: { cache: true } }
```

### 对象操作

```typescript
import { o } from '@cat-kit/core'

const obj = o({ a: 1, b: 2, c: 3 })

// 结构化拷贝
const copied = obj.copy()

// 合并对象
const merged = obj.merge({ d: 4, e: 5 })
// { a: 1, b: 2, c: 3, d: 4, e: 5 }
```

## 数组操作

提供了丰富的数组操作函数和 `Arr` 类。

### 数组工具函数

```typescript
import { last, union, unionBy, eachRight, omitArr } from '@cat-kit/core'

// 获取最后一个元素
last([1, 2, 3]) // 3
last([]) // undefined

// 合并数组并去重
union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]

// 按指定字段去重合并
const arr1 = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' }
]
const arr2 = [
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]
unionBy('id', arr1, arr2)
// [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]

// 从右向左遍历
eachRight([1, 2, 3], (item, index) => {
  console.log(item, index)
})
// 输出：3, 2  |  2, 1  |  1, 0

// 移除指定索引的元素
omitArr([1, 2, 3, 4], [1, 3]) // [1, 3]
```

### Arr 类操作

```typescript
import { arr } from '@cat-kit/core'

const list = arr([1, 2, 3, 4, 5])

// 从右向左遍历
list.eachRight((item, index) => {
  console.log(item, index)
})

// 忽略索引
list.omit([0, 2]) // [2, 4, 5]

// 查找元素
const users = arr([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
])

users.find({ age: 25 }) // [{ id: 1, name: 'Alice', age: 25 }]

// 移动元素
list.move(0, 2) // 将索引 0 的元素移动到索引 2

// 分组
users.groupBy(item => (item.age > 25 ? 'old' : 'young'))
// { young: [...], old: [...] }
```

## 字符串操作

提供字符串命名转换和路径拼接等功能。

### 命名转换

```typescript
import { str, CatString } from '@cat-kit/core'

// 转换为小驼峰
str('hello-world').camelCase() // 'helloWorld'
str('hello_world').camelCase() // 'helloWorld'

// 转换为大驼峰
str('hello-world').camelCase('upper') // 'HelloWorld'

// 转换为连字符命名
str('helloWorld').kebabCase() // 'hello-world'
str('HelloWorld').kebabCase() // 'hello-world'
```

### URL 路径拼接

```typescript
import { $str } from '@cat-kit/core'

// 简单路径
$str.joinUrlPath('/api', 'users', '123')
// '/api/users/123'

// 带协议的 URL
$str.joinUrlPath('https://api.example.com', 'v1', 'users')
// 'https://api.example.com/v1/users'

// 处理多余斜杠
$str.joinUrlPath('https://api.example.com/', '/v1/', '/users/')
// 'https://api.example.com/v1/users/'

// 保留尾部斜杠
$str.joinUrlPath('/api', 'users', 'list/')
// '/api/users/list/'
```

## 数字操作

提供货币格式化和精确计算等功能。

### 货币格式化

```typescript
import { Num } from '@cat-kit/core'

const amount = new Num(1234567.89)

// 格式化为人民币
amount.format('CNY') // '¥1,234,567.89'
amount.format('CNY', { decimals: 0 }) // '¥1,234,568'

// 格式化为中文大写金额
amount.format('CNY_HAN')
// '壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分'
```

### 精确小数

```typescript
import { Num } from '@cat-kit/core'

const num = new Num(3.14159)

// 精确到指定小数位
num.toFixed(2) // 3.14
num.toFixed(0) // 3
```

## 数据转换

提供各种数据格式之间的转换。

### 二进制转换

```typescript
import {
  str2u8a,
  u8a2str,
  u8a2hex,
  hex2u8a,
  u8a2base64,
  base642u8a
} from '@cat-kit/core'

// 字符串 ↔ Uint8Array
const uint8 = str2u8a('Hello') // Uint8Array
const text = u8a2str(uint8) // 'Hello'

// Uint8Array ↔ 十六进制
const hex = u8a2hex(uint8) // '48656c6c6f'
const uint8FromHex = hex2u8a(hex) // Uint8Array

// Uint8Array ↔ Base64
const base64 = u8a2base64(uint8) // 'SGVsbG8='
const uint8FromBase64 = base642u8a(base64) // Uint8Array
```

### URL 查询字符串

```typescript
import { obj2query, query2obj } from '@cat-kit/core'

// 对象转查询字符串
obj2query({ name: 'Alice', age: 25 })
// 'name=Alice&age=25'

// 查询字符串转对象
query2obj('name=Alice&age=25')
// { name: 'Alice', age: 25 }
```

### 链式转换

```typescript
import { transform } from '@cat-kit/core'

// 创建转换链
const result = transform('Hello').pipe(str2u8a).pipe(u8a2base64).value()
// 'SGVsbG8='
```

## 完整示例

### 表单数据处理

```typescript
import { o, isString, isNumber, isEmpty } from '@cat-kit/core'

interface FormData {
  name: string
  age: number
  email: string
  phone?: string
}

function validateForm(data: Partial<FormData>): boolean {
  const required = o(data).pick(['name', 'age', 'email'])

  // 检查必填项
  for (const [key, value] of Object.entries(required)) {
    if (isEmpty(value)) {
      console.error(`${key} 不能为空`)
      return false
    }
  }

  // 类型验证
  if (!isString(data.name)) {
    console.error('name 必须是字符串')
    return false
  }

  if (!isNumber(data.age) || data.age < 0 || data.age > 150) {
    console.error('age 必须是有效的数字')
    return false
  }

  return true
}
```

### API 响应处理

```typescript
import { arr, o } from '@cat-kit/core'

interface User {
  id: number
  name: string
  email: string
  role: string
}

function processUsers(users: User[]) {
  const userList = arr(users)

  // 按角色分组
  const grouped = userList.groupBy(u => u.role)

  // 只保留需要的字段
  const simplified = users.map(u => o(u).pick(['id', 'name']))

  return { grouped, simplified }
}
```

### URL 构建

```typescript
import { $str, obj2query } from '@cat-kit/core'

function buildApiUrl(
  baseUrl: string,
  path: string,
  params: Record<string, any>
): string {
  const url = $str.joinUrlPath(baseUrl, path)
  const query = obj2query(params)
  return query ? `${url}?${query}` : url
}

buildApiUrl('https://api.example.com', 'users/search', {
  name: 'Alice',
  age: 25
})
// 'https://api.example.com/users/search?name=Alice&age=25'
```

## API 索引

### 类型判断

- `getDataType(value)` - 获取值的类型字符串
- `isObj/isArray/isString/isNumber` - 基础类型判断
- `isDate/isFunction/isBol` - 特殊类型判断
- `isNull/isUndef/isEmpty` - 空值判断
- `isBlob/isFile/isFormData/isPromise` - 浏览器和 ES6+ 类型判断
- TypedArray 判断系列

### 对象操作

- `o(obj)` - 创建 CatObject 实例
- `keys()` - 获取键数组
- `each(callback)` - 遍历
- `pick(keys)` - 挑选属性
- `omit(keys)` - 忽略属性
- `extend(source)` - 继承属性
- `deepExtend(source)` - 深度继承
- `copy()` - 结构化拷贝
- `merge(source)` - 合并对象

### 数组操作

- `last(arr)` - 获取最后元素
- `union(...arrs)` - 合并去重
- `unionBy(key, ...arrs)` - 按字段去重合并
- `eachRight(arr, callback)` - 从右遍历
- `omitArr(arr, indices)` - 移除指定索引
- `arr(array)` - 创建 Arr 实例
- Arr 类方法：`find/move/groupBy`

### 字符串操作

- `str(string)` - 创建 CatString 实例
- `camelCase(type)` - 驼峰命名转换
- `kebabCase()` - 连字符命名转换
- `$str.joinUrlPath(...paths)` - URL 路径拼接

### 数字操作

- `Num` 类
- `format(type, options)` - 货币格式化
- `toFixed(decimals)` - 精确小数

### 数据转换

- `str2u8a/u8a2str` - 字符串与 Uint8Array
- `u8a2hex/hex2u8a` - Uint8Array 与十六进制
- `u8a2base64/base642u8a` - Uint8Array 与 Base64
- `obj2query/query2obj` - 对象与查询字符串
- `transform(value)` - 链式转换
