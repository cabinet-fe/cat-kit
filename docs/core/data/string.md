# 字符串工具

提供常用的字符串处理函数，包括格式化、转换、验证等功能。

## 快速开始

```typescript
import {
  capitalize,
  camelCase,
  snakeCase,
  kebabCase,
  truncate,
  template
} from '@cat-kit/core'
```

## 大小写转换

### capitalize

首字母大写。

```typescript
import { capitalize } from '@cat-kit/core'

console.log(capitalize('hello')) // 'Hello'
console.log(capitalize('HELLO')) // 'Hello'
console.log(capitalize('hello world')) // 'Hello world'
```

### camelCase

转换为驼峰命名。

```typescript
import { camelCase } from '@cat-kit/core'

console.log(camelCase('hello-world')) // 'helloWorld'
console.log(camelCase('hello_world')) // 'helloWorld'
console.log(camelCase('hello world')) // 'helloWorld'
console.log(camelCase('HelloWorld')) // 'helloWorld'
```

### snakeCase

转换为下划线命名。

```typescript
import { snakeCase } from '@cat-kit/core'

console.log(snakeCase('helloWorld')) // 'hello_world'
console.log(snakeCase('HelloWorld')) // 'hello_world'
console.log(snakeCase('hello-world')) // 'hello_world'
console.log(snakeCase('hello world')) // 'hello_world'
```

### kebabCase

转换为短横线命名。

```typescript
import { kebabCase } from '@cat-kit/core'

console.log(kebabCase('helloWorld')) // 'hello-world'
console.log(kebabCase('HelloWorld')) // 'hello-world'
console.log(kebabCase('hello_world')) // 'hello-world'
console.log(kebabCase('hello world')) // 'hello-world'
```

## 字符串操作

### truncate

截断字符串并添加省略号。

```typescript
import { truncate } from '@cat-kit/core'

const text = 'This is a very long text'

console.log(truncate(text, 10))
// 'This is...'

console.log(truncate(text, 10, '...'))
// 'This is...'

console.log(truncate(text, 20, ' [更多]'))
// 'This is a very[更多]'
```

### template

简单的模板字符串替换。

```typescript
import { template } from '@cat-kit/core'

const tpl = 'Hello, {{name}}! You are {{age}} years old.'

console.log(
  template(tpl, {
    name: '张三',
    age: 25
  })
)
// 'Hello, 张三! You are 25 years old.'

// 嵌套对象
const tpl2 = 'User: {{user.name}}, Email: {{user.email}}'

console.log(
  template(tpl2, {
    user: {
      name: '李四',
      email: 'li@example.com'
    }
  })
)
// 'User: 李四, Email: li@example.com'
```

### repeat

重复字符串。

```typescript
import { repeat } from '@cat-kit/core'

console.log(repeat('*', 5)) // '*****'
console.log(repeat('ab', 3)) // 'ababab'
console.log(repeat('hello ', 2)) // 'hello hello '
```

### pad

填充字符串到指定长度。

```typescript
import { padStart, padEnd } from '@cat-kit/core'

// 左填充
console.log(padStart('5', 3, '0')) // '005'
console.log(padStart('123', 5, '0')) // '00123'

// 右填充
console.log(padEnd('5', 3, '0')) // '500'
console.log(padEnd('123', 5, '0')) // '12300'
```

## 字符串验证

### isEmpty

检查字符串是否为空。

```typescript
import { isEmpty } from '@cat-kit/core'

console.log(isEmpty('')) // true
console.log(isEmpty('  ')) // true
console.log(isEmpty('hello')) // false
console.log(isEmpty(null)) // true
console.log(isEmpty(undefined)) // true
```

### isEmail

检查是否为有效的邮箱地址。

```typescript
import { isEmail } from '@cat-kit/core'

console.log(isEmail('user@example.com')) // true
console.log(isEmail('invalid.email')) // false
console.log(isEmail('user@domain')) // false
```

### isUrl

检查是否为有效的 URL。

```typescript
import { isUrl } from '@cat-kit/core'

console.log(isUrl('https://example.com')) // true
console.log(isUrl('http://localhost:3000')) // true
console.log(isUrl('not-a-url')) // false
```

### isPhoneNumber

检查是否为有效的手机号（中国）。

```typescript
import { isPhoneNumber } from '@cat-kit/core'

console.log(isPhoneNumber('13800138000')) // true
console.log(isPhoneNumber('12345678901')) // false
```

## 字符串解析

### parseJSON

安全地解析 JSON。

```typescript
import { parseJSON } from '@cat-kit/core'

const result = parseJSON('{"name":"张三"}')
console.log(result) // { name: '张三' }

// 解析失败返回默认值
const result2 = parseJSON('invalid json', { default: true })
console.log(result2) // { default: true }
```

### parseQueryString

解析查询字符串。

```typescript
import { parseQueryString } from '@cat-kit/core'

const params = parseQueryString('?name=张三&age=25&tags[]=a&tags[]=b')
console.log(params)
// { name: '张三', age: '25', tags: ['a', 'b'] }
```

## 使用场景

### 1. 表单验证

```typescript
import { isEmpty, isEmail, isPhoneNumber } from '@cat-kit/core'

function validateForm(data: { name: string; email: string; phone: string }) {
  const errors: string[] = []

  if (isEmpty(data.name)) {
    errors.push('姓名不能为空')
  }

  if (!isEmail(data.email)) {
    errors.push('邮箱格式不正确')
  }

  if (!isPhoneNumber(data.phone)) {
    errors.push('手机号格式不正确')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 2. API 字段转换

```typescript
import { camelCase, snakeCase } from '@cat-kit/core'

// 将 API 响应的 snake_case 转为 camelCase
function transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys)
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[camelCase(key)] = transformKeys(value)
      return acc
    }, {} as any)
  }

  return obj
}

// 将前端数据转为 snake_case 发送给 API
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[snakeCase(key)] = toSnakeCase(value)
      return acc
    }, {} as any)
  }

  return obj
}
```

### 3. 文本预览

```typescript
import { truncate } from '@cat-kit/core'

function generatePreview(content: string, maxLength: number = 100) {
  return truncate(content, maxLength, '... [阅读更多]')
}

// 使用
const article = '这是一篇很长的文章内容...'
const preview = generatePreview(article, 50)
```

### 4. 模板渲染

```typescript
import { template } from '@cat-kit/core'

function sendEmail(user: { name: string; email: string }, order: any) {
  const emailTemplate = `
    尊敬的 {{user.name}}：

    您的订单 {{order.id}} 已确认。
    订单金额：¥{{order.amount}}

    感谢您的购买！
  `

  const content = template(emailTemplate, { user, order })

  // 发送邮件
  return content
}
```

## 性能建议

1. **避免频繁转换**：如果需要多次转换，考虑缓存结果
2. **正则表达式**：验证函数内部使用正则表达式，注意性能
3. **大字符串**：对于大字符串操作，考虑使用 Worker

```typescript
// ✅ 推荐：缓存转换结果
const cache = new Map()

function cachedCamelCase(str: string): string {
  if (cache.has(str)) {
    return cache.get(str)
  }

  const result = camelCase(str)
  cache.set(str, result)
  return result
}
```

## 相关 API

- [数组工具](/core/data/array) - 数组操作
- [对象工具](/core/data/object) - 对象操作
- [数字工具](/core/data/number) - 数字处理
