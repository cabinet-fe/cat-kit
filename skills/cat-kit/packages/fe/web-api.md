# fe — 剪贴板与权限

## 适用场景

- 复制文本或带 MIME 类型的 Blob
- 读取剪贴板中的文本或所有可读格式
- 在调用受权限控制的浏览器能力前做一次“未明确拒绝”的预查

## 如何选择

| 需求                                            | 选择                         |
| ----------------------------------------------- | ---------------------------- |
| 复制字符串或 Blob                               | `clipboard.copy`             |
| 只读取纯文本                                    | `clipboard.readText`         |
| 读取剪贴板中所有可读 MIME 数据                  | `clipboard.read`             |
| 判断权限是否不是 `denied`                       | `queryPermission`            |
| 需要精确的 `granted` / `prompt` / `denied` 状态 | 直接使用原生 Permissions API |

## 公共 API

```ts
clipboard.copy(
  data: string | Blob | Array<string | Blob>
): Promise<void>

clipboard.read(): Promise<Blob[]>
clipboard.readText(): Promise<string>

queryPermission(
  name: PermissionName | 'clipboard-read' | 'clipboard-write'
): Promise<boolean>
```

`queryPermission` 返回 `state !== 'denied'`，因此 `prompt` 也返回 `true`。`clipboard.read()` 会把所有 ClipboardItem 的所有可读类型展开为一个 `Blob[]`。

## 最小示例

```ts
import { clipboard, queryPermission } from '@cat-kit/fe'

if (await queryPermission('clipboard-write')) {
  await clipboard.copy('https://example.com')
}

const text = await clipboard.readText()
```

## 必要边界

- 剪贴板 API 通常要求安全上下文、页面焦点和用户手势；权限预查返回 `true` 不保证后续操作成功，调用方仍须处理拒绝。
- `queryPermission` 依赖 `navigator.permissions.query`。查询 Promise 被浏览器拒绝时会按“未明确拒绝”返回 `true`；Permissions API 本身缺失时调用可能抛错。
- 传给 `clipboard.copy` 的 Blob 应带有效 `type`。数组表示多个独立 `ClipboardItem`，不是同一条内容的多种 MIME 表示；浏览器可能限制一次写入的 item 数量。
- `clipboard.read()` 返回扁平 Blob 数组，不保留原 ClipboardItem 的分组关系。
- 没有现代 Clipboard API 时，`copy` 只对字符串提供旧式回退；该回退按 JSON 字符串写入，可能包含引号，不适合要求严格原样文本的场景。Blob 不会回退。
- `read` / `readText` 没有旧式回退，不支持或未授权时会拒绝。
- 只有根入口 `@cat-kit/fe` 是公开导入路径。

## 类型入口

- [剪贴板](../../generated/fe/web-api/clipboard.d.ts)
- [权限](../../generated/fe/web-api/permission.d.ts)
