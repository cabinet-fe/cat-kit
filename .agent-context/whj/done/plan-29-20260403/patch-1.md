# 审查问题修复

## 补丁内容

修复代码审查中发现的 4 个低优先级问题：

1. **提取 `ReadChunksOptions` 接口并导出** — `readChunks` 的选项类型从内联改为独立接口，方便消费者引用
2. **移除 `remove<T>` 无用泛型参数** — 既有 lint 警告，泛型 `T` 从未使用
3. **docs storage 过期示例统一使用 `storageKey()`** — 裸字符串键改为 `storageKey<string>('otp')` 保持文档一致性
4. **docs file.md 移除重复 API 签名** — "参数说明" 节与 "API详解" 节内容重复，移除前者

## 影响范围

- 修改文件: `packages/fe/src/file/read.ts`
- 修改文件: `packages/fe/src/storage/storage.ts`
- 修改文件: `docs/content/packages/fe/storage.md`
- 修改文件: `docs/content/packages/fe/file.md`
