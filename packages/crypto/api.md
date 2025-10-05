# crypto

crypto 是一个包含了**生成器**, **数据摘要**, **数据加密(解密)**的库。

## 生成器模块

生成器模块是一个用于生成随机数据的方法集。

下面是主要的用法示例:

```ts
import { nanoid, random } from '@cat-kit/crypto/key-gen'

// 生成通用唯一识别码
const uid = nanoid(16)

// 生成随机值
const randomVal = random(14)
```

## 对称加密模块

### AES 加密

该加密支持 128 位, 192 位, 256 位长度的加密，暂时只支持 CBC 和 GCM 加密模式，填充支持 PKCS7， Zero, None。

下面是一个使用的示例:

```ts
import { AES, AES_MODE, AES_PADDING } from '@cat-kit/crypto/symmetric'
import { random } from '@cat-kit/crypto/key-gen'

// 密钥, 根据长度自动判断使用128位还是192位还是256位加密
const key = 'abcdabcdabcdabcd'
//  初始化向量，CBC模式长度为16(分组大小)，GCM模式推荐长度为12字节
// 生成一个随机的16字节的 Uint8Array 数组
const iv = random(16)

const options = {
  key,
  iv,
  // 加密模式，支持CBC和GCM
  mode: AES_MODE.CBC,
  // 填充，支持PKCS7, Zero, None
  padding: AES_PADDING.PKCS7
}

const cipherText = AES.encrypt('hello world', options)

const hex = cipherText.toHex()
const base64 = cipherText.toBase64()

// 直接解密cipherText, 实际上是读取cipherText实例上的data属性，这是一个Uint8Array数据，因此也可以传入 cipherText.data 来解密
AES.decrypt(cipherText, options)

// 如果是hex或base64需要将数据转换一下
AES.decrypt(hex2u8a(hex), options)
AES.decrypt(base642u8a(base64), options)
```

## 信息摘要模块

### MD5

md5 是最常用的数据摘要算法，它不仅可以普通字符串数值等进行摘要，还能对超大文件(单个文件大于 2G)进行分片计算。

下面是关于 MD5 的使用示例:

```ts
import { md5 } from '@cat-kit/crypto/hash'

// 普通摘要
const hashed = md5('hello world').hex()

// 文件摘要简易写法
const fileHashed = md5(file, { chunkSize: 2 * 1024 * 1024 }).hex()

// 文件摘要自定义写法, 实际上简易写法内部也是继续下面的写法
const hasher = md5.hasher()

function getFileMD5(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    let offset = 0
    let chunkSize = 2 * 1024 * 1024

    function readChunk() {
      if (offset >= file.size) return true
      const nextOffset = Math.min(offset + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(offset, nextOffset))
      offset = nextOffset
      return false
    }

    reader.onload = function (e) {
      const result = e.target.result as ArrayBuffer
      hasher.update(result)
      const finished = readChunk()
      if (finished) {
        resolve(hasher.finish())
      }
    }

    reader.onerror = function (err) {
      reject(err)
    }

    readChunk()
  })
}

const hash = (await getFileMD5()).hex()
```
