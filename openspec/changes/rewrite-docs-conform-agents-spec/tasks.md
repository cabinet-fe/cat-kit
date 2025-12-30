## 1. 准备工作

- [ ] 1.1 确认所有现有 demo 文件（`docs/examples/`）可正常工作
- [ ] 1.2 导出各包的 API 清单（从 `packages/<pkg>/dist/index.d.ts`）
- [ ] 1.3 建立"文档 vs 实际导出"对照表，标记所有不一致项

## 2. core 包文档重写（差异最大，需重点核实）

- [ ] 2.1 重写 `core/index.md`：仅保留介绍 + 导航链接，移除 Emoji
- [ ] 2.2 重构 `core/data.md`：修正 API（`$arr`→`arr()`，`$obj`→`o()`，`$num`→`$n/n()`）
- [ ] 2.3 重构 `core/data-structure.md`：核实 `Tree/Forest` API
- [ ] 2.4 重构 `core/date.md`：修正 API（`$date`→`Dater/date()`）
- [ ] 2.5 重构 `core/env.md`：核实环境检测 API
- [ ] 2.6 重构 `core/optimize.md`：修正 API（`safe`→`safeRun`，删除不存在的 `Timer`）
- [ ] 2.7 重构 `core/pattern.md`：修正 API（`Observer`→`Observable`）
- [ ] 2.8 新增 `core/validator.md`：补充 `Validator` 相关文档

## 3. http 包文档重写

- [ ] 3.1 重写 `http/index.md`：仅保留介绍 + 导航链接
- [ ] 3.2 重构 `http/client.md`：添加规范结构
- [ ] 3.3 重构 `http/plugins.md`：仅保留 TokenPlugin 和 MethodOverridePlugin
- [ ] 3.4 重构 `http/types.md`：添加规范结构

## 4. fe 包文档重写

- [ ] 4.1 重写 `fe/index.md`：仅保留介绍 + 导航链接，移除过多 Emoji（5→0-2）
- [ ] 4.2 重构 `fe/file.md`：修正 API（`saveFile`→`saveFromBlob/saveFromStream/saveFromURL`）
- [ ] 4.3 重构 `fe/storage.md`：修正 API（确认 `IDB` 而非 `Store`），保留现有 demo
- [ ] 4.4 重构 `fe/virtualizer.md`：添加规范结构
- [ ] 4.5 重构 `fe/web-api.md`：添加规范结构

## 5. be 包文档重写

- [ ] 5.1 重写 `be/index.md`：仅保留介绍 + 导航链接，移除过多 Emoji（7→0-2）
- [ ] 5.2 重构 `be/cache.md`：添加规范结构
- [ ] 5.3 重构 `be/config.md`：添加规范结构
- [ ] 5.4 重构 `be/fs.md`：添加规范结构
- [ ] 5.5 重构 `be/logger.md`：添加规范结构
- [ ] 5.6 重构 `be/net.md`：添加规范结构
- [ ] 5.7 重构 `be/scheduler.md`：添加规范结构
- [ ] 5.8 重构 `be/system.md`：添加规范结构

## 6. excel 包文档重写

- [ ] 6.1 重写 `excel/index.md`：仅保留介绍 + 导航链接
- [ ] 6.2 新增 `excel/workbook.md`：工作簿相关 API（从 index.md 迁移）
- [ ] 6.3 新增 `excel/reader.md`：读取相关 API（从 index.md 迁移）
- [ ] 6.4 新增 `excel/writer.md`：写入相关 API（从 index.md 迁移）
- [ ] 6.5 新增 `excel/helpers.md`：辅助工具 API（从 index.md 迁移）

## 7. maintenance 包文档重写

- [ ] 7.1 重写 `maintenance/index.md`：仅保留介绍 + 导航链接，移除过多 Emoji（5→0-2）
- [ ] 7.2 重构 `maintenance/build.md`：添加规范结构
- [ ] 7.3 重构 `maintenance/deps.md`：添加规范结构
- [ ] 7.4 重构 `maintenance/guide.md`：添加规范结构（或作为特殊指南页）
- [ ] 7.5 重构 `maintenance/monorepo.md`：添加规范结构
- [ ] 7.6 重构 `maintenance/release.md`：添加规范结构
- [ ] 7.7 重构 `maintenance/version.md`：添加规范结构

## 8. 验证

- [ ] 8.1 本地启动 VitePress 验证所有页面渲染正常
- [ ] 8.2 确认所有 demo 容器正常工作
- [ ] 8.3 检查所有内部链接有效
- [ ] 8.4 按 `docs/AGENTS.md` 验收清单自检
