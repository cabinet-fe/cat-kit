# 数据操作

## 快速使用

::: demo
render(utils/common/data/quick)
:::

## 通用操作

提供了一些各个数据类型公用的方法

### isEmpty

判断一个值是否为空值, 其中**0**和**false**会被视作空值. 通常判断对象或者数组尤其是对象使用此方法.

::: demo
render(utils/common/data/empty)
:::

### getChainValue

通过一个字符串属性链来获取一个嵌套的对象的值

::: demo
render(utils/common/data/get-chain-value)
:::

### oneOf

判断是否为给定值中的一种

::: demo
render(utils/common/data/one-of)
:::

### equal

判断两个值的结构是否"相等".

通常用来判断对象和数组是否在结构上相等, 也可使用第三个参数通过比较相同属性来确定相等.

比如从服务器过来的对象总是和你程序的对象不相等, 而我们可以通过约定的结构或者属性标识来确定其是否相等, 在与后端对接时, 该方法或许会很有用.

::: demo
render(utils/common/data/equal)
:::

::: danger
你不能够用它来判断两个值是否相等!

:::

::: danger 错误用法

```ts
if (equal(1, 3)) {
  console.log('相等')
}
```

:::

::: tip 正确用法

```ts
let a = { name: '张三' }
let b = { name: '张三' }

if (equal(a, b)) {
  console.log('或许是同一个人')
}
```

:::

### deepCopy

深拷贝, 此函数能够深拷贝数组, 对象, 函数, 日期这四种常用的引用类型

::: demo
render(utils/common/data/deep-copy)
:::

### merge

合并对象.
合并的策略是会比较每个相同属性的类型, 类型不一致直接覆盖最后被合并进来的对象, 类型一致时, 如果是直接类型直接覆盖, 如果是对象或数组则直接递归合并.

::: tip
合并生成的内容是深度拷贝的, 因此它不会改变原生合并的对象.

这意味着如果 merge 只传入一个参数时, 是和 [deepCopy](#deepcopy) 等效的.
:::

::: demo
render(utils/common/data/merge)
:::

### serialize & deserialize 对象序列化 & 反序列化为对象

对象序列化: 将对象转化为可传输的字符串

反序列化: 将字符串转化为对象

::: demo
render(utils/common/data/serialize)
:::

## array 操作

提供常用的数组操作

### last

直接获取数组最后一个元素

```ts
last([1, 2, 3])
// return 3
```

### union

合并多个数组，并去重（简单类型）

```ts
union([1, 2], [2, 3], [3, 4])
//return [1, 2, 3, 4]
```

### unionBy

合并多个数组，并按照指定字段进行去重

```ts
unionBy(
  'name',
  [
    { name: '张三', score: 78 },
    { name: '李四', score: 65 }
  ],
  [
    { name: '王五', score: 82 },
    { name: '李四', score: 65 }
  ]
)
//return [{ name: '张三', score: 78 },{ name: '李四', score: 65 },{ name: '王五', score: 82 }]
```

### omitArr

丢弃指定索引的数组

```ts
omitArr([1, 2, 3], 1)
// return [1, 3]

omit([1, 2, 3], [0, 2])
// return [2]
```

## object 操作

提供常用的对象操作

### omit

丢弃对象的某些属性, 并根据剩余属性生成一个新的对象

```ts
omit({ name: '张三', age: 20, id: 1 }, ['id'])
// return { name: '张三', age: 20 }
```

### pick

选取对象的某些属性, 并根选取的属性生成一个新的对象

```ts
pick({ name: '张三', age: 20, id: 1 }, ['id'])
// return { id: 1 }
```

### objMap

对象的映射

```ts
objMap({ a: 1, b: 2 }, v => v * 2)
// return { a: 2, b: 4 }
```

### objEach

对象的遍历

```ts
objEach({ a: 1, b: 2 }, (v, k) => console.log(`${k}: ${v}`))
// log a: 1
// log b: 2
```

### extend

对象继承

```ts
extend({ name: '张三', age: 10 }, { name: '李四', age: 21 }, { name: '王五' })
// return { name: '王五', age: 21 }
```

### 包装器

对象包装器，使用会更加地符合直觉, 所有的对象操作，
在对象包装器中都有对应的实现。

```ts
import { obj } from 'cat-kit'

obj({ name: '张三', age: 10 }).pick(['name'])
// return { name: '张三' }
obj({ name: '李四', age: 20 }).omit(['name'])
// return { age: 20 }
```

## 数字操作

数字操作通常用来恢复精度, 转化不同的使用方式(比如货币, 使用货币时会被转化为字符串, 并用分隔符分割千分位)

cat-kit 中提供了一个包装函数**n**来包裹数字.

### 数字计算
函数**n**提供了4个用于计算的静态属性：
- n.plus 加
- n.minus 减
- n.mul 乘
- n.div 除

::: demo
render(utils/common/data/number)
:::

### 遍历

使用n(n: number).each进行数字遍历。

```ts
n(3).each(v => {
  console.log(v)
})
//log 1,2,3
```
### 货币
使用n(n: number).currency()进行数字货币化。

::: demo
render(utils/common/data/number-currency)
:::

## 字符串操作

### kebabCase 大小驼峰转kebab-case

```ts
import { str } from 'cat-kit/fe'
// import { str } from 'cat-kit/be' node.js

str('aaBbCc').kebabCase()
// 返回aa-bb-cc
str('AaBbCc').kebabCase()
// 返回aa-bb-cc
```

### camelCase kebab-case转大小驼峰

```ts
import { str } from 'cat-kit/fe'
// import { str } from 'cat-kit/be' node.js

str('aa-bb-cc').camelCase()
// 返回aaBbCc
str('aa-bb-cc').camelCase('lower')
// 返回aaBbCc
str('aa-bb-cc').camelCase('upper')
// 返回AaBbCc
```

### joinPath路径拼接

路径通常用于路由, url之类的拼接, 解析

joinPath 方法用于拼接各个路径片段, 拼接成一个以 '/' 开头的路径字符串.

```ts
import { str } from 'cat-kit/fe'

const url = str.joinPath('a', 'b', 'c')
// return '/a/b/c'

const url = str.joinPath('/a', '/b', '/c')
// return '/a/b/c'

const url = str.joinPath('/a', 'b', '/c')
// return '/a/b/c'
```

## 静态资源

### requireImg

引入本地静态图片

```ts
requireImg('ship')
//return http://localhost:2001/src/assets/ship.jpg

requireImg('ship.png', '/test', 'png')
//return http://localhost:2001/test/ship.png

requireImg(['ship', 'train'])
//return ['http://localhost:2001/src/assets/ship.jpg','http://localhost:2001/src/assets/train.jpg']
```
