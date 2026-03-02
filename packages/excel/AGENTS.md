# @cat-kit/excel - Excel 文件处理库

本文件为 `@cat-kit/excel` 包提供详细的开发指导。

## 包概述

`@cat-kit/excel` 是一个现代化的 Excel 文件处理库，基于不可变数据结构和 Web Streams API，支持流式读取和写入大型 Excel 文件。

## 核心目标

主要用于替换 `exceljs` 库，提供更现代化的 API 和更好的性能。

- 使用 `fflate` 库替代 `JSZip` 库，提供更快的压缩和解压缩性能。
- 使用 `fast-xml-parser` 库替代 `xml2js` 库，提供更快的 XML 解析性能。
- 使用原生 WebStreams API 替代 `stream` 库，提供更快的流式处理性能。
- 使用 `@cat-kit/core` 库替代 `lodash`、`moment`、`dayjs` 等日期处理库，提供更快的日期处理性能。
- 全面使用现代语法，避免使用过时的语法。
