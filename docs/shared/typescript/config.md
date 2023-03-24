---
title: 配置文件 tsconfig.json
---

# 配置文件 tsconfig.json

配置文件告诉ts编译器如何对待你的ts文件, 包括如何编译, 如何提示, 作用范围等等.

## 顶层属性


### 继承 extends
继承一个配置文件, 继承配置文件中的属性, 当前文件的优先级会更高, 这和继承类的形式类似.
继承中的相对路径以继承base中的为准.


tsconfig.base.json
```json
{
  "include": ["./global.d.ts", "src/**/*"]
}
```

```json
{
  "extends": "./tsconfig.base.json"
}
```

### 包含 include
指定当前项目的编译范围, 包括声明文件, 指定的好处是为了优化编译器的性能. 但是一旦指定了,
或许会让项目出现报错. 你可以使用include来替代, 把你不想包含进去的文件排除掉.


### 排除 exclude
排除掉你不想编译的目录或者文件, 比如说node_modules(node_modules已经默认被排除了). 你也可以使用include和files属性, 来最大化地优化编译, 但是前提是你需要对项目有足够的了解.

```json
{
  "exclude": ["node_modules"]
}
```

### 文件 files
和include类似, 可以把你想要编辑的文件包含进去, 但是只能支持文件, 而且不支持glob匹配, 所以不建议使用

```json
{
  "files": ["src/main.ts"]
}
```

### 编译选项 compilerOptions

```json
{
  // 指定输出的js的版本
  "target": "es6",
  // 指定输出文件的模块标准, 常用的就是UMD, CommonJs, ESxxx
  "module": "ESNext",
  // 是否允许导入js文件
  "allowJs": false,
  // 是否允许合并成默认导入, 例如
  // import * as Space from 'xx' -> import Space from 'xx'
  "allowSyntheticDefaultImports": false,
  // 指定基础路径
  "baseUrl": ".",
  // 指定路径的别名, 比如指定@作为src目录的别名
  "paths": {
    "foo":  ["node_modules/foo"]
  },
  // 严格模式
  "strict": true,
  // 严格模式之bind调用, call调用. apply调用
  "strictBindCallApply": true,
  // 严格模式之不能有隐式的this, 即强制声明this
  "noImplicitThis": true,
  // 严格模式之不能有隐式的any, 即强制为any类型声明注解
  "noImplicitAny": false,
  // 使用的类型库, 指定你需要使用的类型库
  "lib": [],
  // 编译报错时是否继续输出, 建议false因为很多迁移项目会有问题
  "noEmitOnError": false,

  // 模块解析 默认为classic, 一般指定为node的解析方式 支持node, nodenext, classic
  "moduleResolution": "node",
  // 指定编译后的输出目录, 不指定则在源文件同目录下输出
  "outDir": "",
  "lib": [],
  // 是否删除文件中的注释
  "removeComments": false,
  // 是否始终以严格模式检查每个模块，并且在编译后的结果中加入"use strict"
  "alwaysStrict": false,
  // 是否生成声明文件, 如果当前项目是个类库或者模块建议指定为true
  "declaration": false,
  // 指定额外的类型
  "types": ["vite"]
}
```