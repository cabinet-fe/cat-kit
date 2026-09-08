---
name: docs-search
description: >
  检索企业内部库文档。写代码或回答问题时需要查阅内部库 API、用法、约束，
  或用户要求搜索/阅读内部库文档时使用。运行本技能内嵌查询脚本：先列出已收录库，
  再搜索（可限定单库），再取全文或章节。不要为每个库单独建技能。
---

# docs-search 文档检索

企业内部库文档检索：一个通用技能覆盖全部已收录库，动态发现，不做每库一技能。

需要内部库事实时，**直接运行本技能内嵌脚本**，不要凭训练数据猜测私有 API。

脚本：`scripts/query.mjs`（Node ≥ 26，零依赖）。从本技能根目录运行，或对该文件使用绝对路径。服务地址只读环境变量 `DOCS_SERVER_URL`（结尾斜杠由脚本去掉）；不要把地址写入本技能、配置文件或代码。

## 流程

按顺序：`libraries` 发现库 → `search` 命中目标（可选 `--library` 限定单库）→ `get` 取全文或章节。搜索为空则换关键词重试。

```bash
node scripts/query.mjs libraries
node scripts/query.mjs search --q <关键词> [--library <slug>]
node scripts/query.mjs get --library <slug> --path <path> [--section <章节>]
```

stdout 为服务端 JSON。缺 `DOCS_SERVER_URL` 或 HTTP 非 2xx 时脚本非零退出，把 stderr 原文转述给用户；不要编造服务地址。

## 反模式

- 为单个库复制/新建检索技能
- 把 `DOCS_SERVER_URL` 写进技能副本或项目配置文件
- 未检索就按训练数据实现内部库调用
