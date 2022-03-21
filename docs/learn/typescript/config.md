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