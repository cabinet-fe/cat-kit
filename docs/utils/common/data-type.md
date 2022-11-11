# 数据类型
提供常用的类型判断函数, 和原生实现相比, 它更加统一的api让代码可以更加容易维护, 并且无需为恶心的'=='和'==='付出心智负担. 如果项目使用typescript开发, 他能够起到类型保护的作用.

## 快速使用

```ts
import { isArray } from 'fe-dk'

let result = Math.random() * 10 > 5 ? [1, 2, 3] : 'failed'

if (isArray(result)) {
  result.forEach(item => console.log(item))
} else {
  console.log(result)
}
```

## api

### isString
是否是字符串
```ts
isString('hello')
// return true

isString(0)
// return false
```

### isNumber
是否是数字
```ts
isNumber(0)
// return true

isNumber('')
// return false
```

### isArray
是否是数组
```ts
isArray([0, 1, 2])
// return true

isArray({})
// return false
```

### isUndef
是否是undefined
```ts
isUndef(undefined)
// return true

isString(1)
// return false
```

### isDate
是否是日期
```ts
isDate(new Date())
// return true

isDate(0)
// return false
```

### isNull
是否是null
```ts
isNull(null)
// return true

isNull(0)
// return false
```

### isFunction
是否是函数
```ts
isFunction(function fn() {})
// return true

isFunction(0)
// return false
```

### isObj
是否是对象
```ts
isObj({})
// return true

isObj(0)
// return false
```

### isBol
是否是布尔值
```ts
isBol(true)
// return true

isBol(0)
// return false
```

### isPromise
是否是Promise
```ts
isPromise(Promise.resolve())
// return true

isPromise(0)
// return false
```

### isBlob
是否是blob对象
Blob表示一个二进制大对象(Binary Large Object). 通常可以用来做文件的分片(File类继承了Blob, 因此更多的时候会使用File来做分片上传, 断点续传).

```ts
isBlob(new Blob())
// return true

isBlob(0)
// return false
```

### isSymbol
是否是symbol
```ts
isSymbol(Symbol())
// return true

isSymbol(0)
// return false
```

### isFile
是否是文件
```ts
isFile(new File([], '文件.txt'))
// return true

isFile(0)
// return false
```

### isArrayBuffer
是否是二进制缓冲区缓冲
ArrayBuffer数据表示缓冲区即一段内存. 可以通过TypedArray视图和DataView视图来进行操作.

视图的概念指的是对同一片内存的数据用不同叫角度去看而得出的数据结构.
> 计算机概念中一个内存能够存储8位二进制数也就是一个字节的数据. 假设有一段长度为4的连续内存(可以存储4字节数据), 并且每个内存里存的都是1111111, 那么我们把片内存展现成什么数据这就是**视图**. 如果以Uint8Array(无符号, 也就是最高位不用来表示正负数)视图来表示这段内存, 他展现出来的数据就是[255, 255, 255, 255]; 如果以Int8Array视图来表示, 那么它展现出来的数据就是[-127, -127, -127, -127]; 如果以Uint32Array视图来表示, 那么它展现出来的数据就是[4294967295]

TypedArray指的是以下构造函数的总称:
- Int8Array
- Uint8Array
- Uint8ClampedArray
- Int16Array
- Uint16Array
- Int32Array
- Uint32Array
- Float32Array
- Float64Array
```ts
isArrayBuffer(new ArrayBuffer())
// return true

isArrayBuffer(0)
// return false
```

### isInt16Array
是否是Int16Array
```ts
isInt16Array(new Int16Array())
// return true

isInt16Array(0)
// return false
```

### isInt32Array
是否是Int32Array
```ts
isInt32Array(new Int32Array())
// return true

isInt32Array(0)
// return false
```

### isInt8Array
是否是Int8Array
```ts
isInt8Array(new Int8Array())
// return true

isInt8Array(0)
// return false
```

### isUint16Array
是否是Uint16Array
```ts
isUint16Array(new Uint16Array())
// return true

isUint16Array(0)
// return false
```

### isUint32Array
是否是Uint32Array
```ts
isUint32Array(new Uint32Array())
// return true

isUint32Array(0)
// return false
```

### isUint8Array
是否是Uint8Array
```ts
isUint8Array(new Uint8Array())
// return true

isUint8Array(0)
// return false
```