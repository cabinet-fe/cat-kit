# 优化 docs 数据处理文档

> 状态: 已执行

## 目标

将 `@cat-kit/core` 数据处理文档从单文件改造为左侧两级菜单结构，并为数字操作增加可交互的 Web 示例，提升文档的可读性和体验。

## 内容

1. **文档拆分**：将 `docs/content/packages/core/data.md` 拆分为 `docs/content/packages/core/data/` 子目录：
   - `index.md`：介绍与页面导航
   - `type-check.md`：类型判断
   - `object.md`：对象操作
   - `array.md`：数组操作
   - `string.md`：字符串操作
   - `number.md`：数字操作（增加 demo 引用）
   - `convert.md`：数据转换
   保持原有内容完整，为每个子文件补充 `sidebarOrder` frontmatter 以控制排序。

2. **数字操作 Web 示例**：创建两个 Vue demo 文件：
   - `docs/examples/core/number-calc-demo.vue`：表达式计算器，支持输入数学表达式实时计算（如 `0.1 + 0.2`、`1 + 2 * (3 + 4)`），展示 `$n.calc()` 能力，同时提供浮点数精度问题对比（JS 原生 vs `$n.calc`）。
   - `docs/examples/core/number-format-demo.vue`：数字格式化演示，支持输入数字选择格式化类型（货币 CNY/CNY_HAN、精确小数、千分位等），实时展示 `n().currency()`、`n().fixed()`、`$n.formatter()` 的结果。

3. **导航更新**：
   - 更新 `docs/content/packages/core/index.md` 的导航链接，指向 `data/` 子目录
   - 删除旧的 `docs/content/packages/core/data.md`

## 影响范围

- `docs/content/packages/core/index.md`（更新导航链接）
- `docs/content/packages/core/data.md`（删除）
- `docs/content/packages/core/data/index.md`（新增）
- `docs/content/packages/core/data/type-check.md`（新增）
- `docs/content/packages/core/data/object.md`（新增）
- `docs/content/packages/core/data/array.md`（新增）
- `docs/content/packages/core/data/string.md`（新增）
- `docs/content/packages/core/data/number.md`（新增）
- `docs/content/packages/core/data/convert.md`（新增）
- `docs/examples/core/number-calc-demo.vue`（新增）
- `docs/examples/core/number-format-demo.vue`（新增）
- `docs/examples/core/number-calc-demo.vue`（修改：替换 eval 为 new Function）
- `docs/examples/core/number-format-demo.vue`（修改：修复 showPrecision 逻辑）
- `docs/content/packages/core/data/object.md`（修改：补充表单验证综合示例）
- `docs/content/packages/core/data/array.md`（修改：补充 API 响应处理综合示例）
- `docs/content/packages/core/data/string.md`（修改：补充 URL 构建综合示例）

## 历史补丁

- patch-1: review 后补丁修复
