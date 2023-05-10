# 文件系统

提供更加简易和提示更加友好的文件系统 api

## readDir

读取目录, 可以递归读取或指定读取类别

### 参数

- dir <string | URL>要读取的目录, 必须是绝对路径
- options [ReadDirOptions] 读取选项
  - recursive [boolean] 是否递归读取, 默认 false
  - readType ['all' | 'file' | 'dir'] 读取的类型, all 表示全部, file 表示仅文件, dir 表示目录, 当指定为 file 时, recursive 选项不再生效
  - exclude [(string | RegExp)[]] 排除的项, 可以是字符串或者正则表达式, 默认['node_modules']
  - include [(string | RegExp)[]] 包含的项, 可以是字符串或者正则表达式, 默认[]
  - callback [(item: Dir | DirFile) => void] 读取到每一项时执行的回调

### 快速使用

::: code-group

```ts [仅读取文件]
import { readDir } from 'cat-kit'

const dirs = await readDir(targetURL, {
  readType: 'file'
})
```

```ts [仅读取目录]
import { readDir } from 'cat-kit'

const dirs = await readDir(target, {
  readType: 'dir'
})
```

```ts [递归目录和文件]
import { readDir } from 'cat-kit'

const dirs = await readDir(target, {
  recursive: true
})
```

```ts [递归目录]
import { readDir } from 'cat-kit'

const dirs = await readDir(target, {
  recursive: true,
  readType: 'dir'
})
```

```ts [排除]
import { readDir } from 'cat-kit'

const dirs = await readDir(target, {
  recursive: true,
  exclude: [/dist/] // 文件或者文件夹包含dist名称时则排除
  // exclude: ['dist'] // 文件或者文件夹等于dist名称时则排除
})
```

```ts [仅包含]
import { readDir } from 'cat-kit'

// 如果同时指定了exclude则exclude优先生效, 也就是说被排除的文件无法被包含
const dirs = await readDir(target, {
  recursive: true,
  include: [/dist/] // 文件或者文件夹包含dist名称时则包含
  // include: ['dist'] // 文件或者文件夹等于dist名称时则包含
})
```
:::
