# @cat-kit/excel - Excel 文件处理库

现代化的 Excel 文件处理库，基于 Web Streams API，支持流式读取和写入大型 Excel 文件。用于替换 `exceljs`。

**依赖**：`@cat-kit/core`、`fflate`（压缩）、`fast-xml-parser`（XML 解析）
**运行环境**：通用

## 目录结构

```
packages/excel/src/
├── model/             # 数据模型
│   ├── workbook.ts    # 工作簿
│   ├── worksheet.ts   # 工作表
│   ├── row.ts         # 行
│   ├── cell.ts        # 单元格
│   ├── style.ts       # 样式
│   ├── shared-string.ts # 共享字符串
│   └── index.ts
├── read/              # 读取
│   ├── read-workbook.ts       # 完整读取
│   ├── read-workbook-stream.ts # 流式读取
│   └── xml-reader.ts          # XML 解析器
├── write/             # 写入
│   ├── write-workbook.ts      # 工作簿写入
│   └── xml-writer.ts          # XML 生成器
├── zip/               # ZIP 处理
│   ├── zip-reader.ts  # ZIP 解压
│   └── zip-writer.ts  # ZIP 压缩
├── utils/             # 工具函数
│   ├── guards.ts      # 类型守卫
│   └── xml.ts         # XML 工具
├── address.ts         # 单元格地址解析
├── date.ts            # Excel 日期转换
├── errors.ts          # 错误类型
├── types.ts           # 类型定义
└── index.ts           # 主导出文件
```

**当 `excel/src` 中添加文件、文件意义变更时同步上面的目录结构！**

## 约束

- 使用 `fflate` 替代 JSZip，`fast-xml-parser` 替代 xml2js
- 使用原生 Web Streams API
- 日期/工具函数从 `@cat-kit/core` 导入
- 全面使用现代语法
- 所有公共 API 通过 `src/index.ts` 统一导出
