# 图片操作

## 快速使用
```ts
import { compressImage } from 'fe-dk'
```

## api

### compressImage
压缩图片

```ts
import { compressImage } from 'fe-dk'

// 第一个参数是图片的文
// 第二个参数是压缩的目标大小
// 如果文件本身大小小于目标大小, 将不会压缩
compressImage(file, 2  * 1024 * 1024).then(result => {
  console.log(result.size)
})
```