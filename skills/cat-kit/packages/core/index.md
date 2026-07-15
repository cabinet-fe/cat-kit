# @cat-kit/core

通用基础工具包，提供数据处理、日期、环境探测、树结构和执行控制等公开能力。

## 如何选择

- 数组、对象、字符串和数值等通用数据任务优先使用本包。
- 需要 LRU、文件缓存或记忆化时使用 [`@cat-kit/be` 缓存](../be/cache.md)，这些能力不属于 core。
- 需要安全随机 ID 时使用 [`@cat-kit/crypto`](../crypto/nanoid.md)。

## 主题

- [数组与对象](array-object.md)：合并去重、尾元素、挑选、忽略和对象更新。
- [字符串与类型检测](string-type.md)：命名转换、URL 路径和类型守卫。
- [转换与校验](transform-validation.md)：字节编码、查询串、转换链和 schema 校验。
- [数值](number.md)：小数运算、表达式、格式化和范围限制。
- [日期](date.md)：解析、格式化、加减、对齐、比较和区间。
- [环境检测](env.md)：运行时、系统、浏览器、设备和环境摘要。
- [树与森林](data-structure.md)：遍历、查找、扁平化和节点关系。
- [执行控制](optimize.md)：防抖、节流、延时、限并发和安全同步执行。
- [可观察状态](pattern.md)：浅层状态订阅。
- [组合示例](examples.md)：只有跨主题组合时再读取。

## 边界

所有运行时 API 均从 `@cat-kit/core` 包根导入。浏览器专属类型守卫和环境信息依赖对应全局能力；按主题文档中的边界使用。

精确导出总表见 [generated/core/index.d.ts](../../generated/core/index.d.ts)。
