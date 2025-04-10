# @cat-kit/crypto 加解密

按照[要求](#要求)帮我编写这个库。

## 要求

- 这是 cat-kit 下的一个加密库。本项目中的 src 目录中已经创建好文件，base 文件是算法的基础部分，导出算法的基类，该类提供了一些通用的基础方法，例如分组计算等等。

- 本库要同时支持浏览器端和 node 端。浏览器端要求判断是否为 https 环境，如果不是 https 环境，则不能使用 crypto.subtle 模块实现算法而是单独实现具体的算法。

- 本库一定要注意模块化，以便于构建工具可以对加密库进行 treeshaking 优化，例如 aes 加密的模式，我们可以导入模式和 AES 算法核心组合，这样没有用到的模式最终就没必要打包到构建物中去了。

- 其他的请根据具体算法要求。

### aes 算法

- aes 算法实现 gcm 和 cbc 模式加密，并且根据传入的密钥自动判断使用多少位加密(128, 192, 256)。

- AES 要将模式和填充模块单独抽取出来，具体的代码放在 aes 目录下。

填充模块

实现

使用示例:

```ts
import { AES, AES_CBC, AES_GCM, AESPadding } from '@cat-kit/crypto'

const aes = new AES({
  // 模式的具体实现类
  mode: AESMode.CBC,
  // 填充，如果需要
  padding: AESPadding.PKCS7
})

const key = 'xxxxxxxxxxxxxxxx'
const iv = 'xxxxxxxxxxxxxxxx'
const ciphertext = aes.encode('message', {
  // 可以是Int8Array或者字符串
  key,
  // 可以是Int8Array或者字符串
  iv,
  // hex / buffer
  output: 'hex'
})

aes.decode(ciphertext, { key, iv })
```

### md5

使用示例

```ts
import { MD5 } from '@cat-kit/crypto'

const md5 = new MD5()

// 获取字符串摘要
md5.hash('string')

// 获取文件摘要，支持超过2g的大文件
md5.hash(file)
```

## 测试验证环节

test.ts 文件是对算法进行正确性校验的脚本，本机安装了 bun 环境，可以使用 bun 直接执行此文件。因此不需要对该库进行构建操作，也不需要写单独的单元测试了。
