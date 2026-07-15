# @cat-kit/fe

浏览器专用工具包，提供虚拟列表、数值补间、文件处理、客户端存储和剪贴板等公开能力。

## 适用场景

- 大数据列表或表格只渲染可见区域
- 用回调驱动数值动画或可控时间轴
- 分块读取 `Blob` / `File`，或触发 Blob 下载
- 类型化使用 Web Storage、管理可由 JavaScript 访问的 Cookie
- 读写剪贴板、预查浏览器权限状态

该包依赖 DOM 和浏览器 Web API，不适用于 Node.js 服务端逻辑。

## 选择文档

| 任务                                 | 读取                             |
| ------------------------------------ | -------------------------------- |
| 虚拟滚动、动态尺寸、滚动到指定项     | [virtualizer.md](virtualizer.md) |
| 数值补间、缓动、暂停/恢复/跳转       | [tween.md](tween.md)             |
| 分块读取文件、保存 Blob              | [file.md](file.md)               |
| localStorage、sessionStorage、Cookie | [storage.md](storage.md)         |
| 剪贴板和权限预查                     | [web-api.md](web-api.md)         |

## 公共导入

包只公开根入口：

```ts
import { Virtualizer, storage, clipboard } from '@cat-kit/fe'
```

不要导入 `src`、`dist` 或包内文件。

## 类型入口

[公共声明](../../generated/fe/index.d.ts)
