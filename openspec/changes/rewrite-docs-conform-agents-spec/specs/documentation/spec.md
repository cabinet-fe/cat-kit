## ADDED Requirements

### Requirement: Index Page Structure

每个包的 `index.md` 页面 SHALL 仅包含以下内容：
1. 当前包的作用介绍（1-2 段，包含适用环境信息）
2. 导航到本包下其他 md 文件的相对链接列表

`index.md` 页面 SHALL NOT 包含：
- 大段 API 说明
- 长篇快速开始或代码示例
- 细节配置或 FAQ

#### Scenario: Core Index Page

- **GIVEN** 用户访问 `docs/content/packages/core/index.md`
- **WHEN** 页面渲染完成
- **THEN** 页面内容不超过 50 行
- **AND** 包含包简介说明
- **AND** 包含到 `data.md`、`data-structure.md`、`date.md`、`env.md`、`optimize.md`、`pattern.md` 的导航链接

#### Scenario: HTTP Index Page

- **GIVEN** 用户访问 `docs/content/packages/http/index.md`
- **WHEN** 页面渲染完成
- **THEN** 页面内容不超过 40 行
- **AND** 包含包简介说明（含浏览器环境适用信息）
- **AND** 包含到 `client.md`、`plugins.md`、`types.md` 的导航链接

---

### Requirement: Feature Page Structure

每个功能页（非 `index.md`）SHALL 包含以下固定二级标题，且顺序固定：
1. `## 介绍`
2. `## 快速使用`
3. `## API参考`

其他标题（如 `## 参数说明`、`## 注意事项`）MAY 按需添加在上述三个标题之后。

#### Scenario: Data Page Structure

- **GIVEN** 用户访问 `docs/content/packages/core/data.md`
- **WHEN** 页面渲染完成
- **THEN** 页面包含 `## 介绍` 二级标题
- **AND** 页面包含 `## 快速使用` 二级标题，位于"介绍"之后
- **AND** 页面包含 `## API参考` 二级标题，位于"快速使用"之后

#### Scenario: Storage Page Structure

- **GIVEN** 用户访问 `docs/content/packages/fe/storage.md`
- **WHEN** 页面渲染完成
- **THEN** 页面包含规范要求的三个固定二级标题
- **AND** 页面包含 `::: demo fe/storage/basic.vue :::` 演示容器

---

### Requirement: Demo Container Placement

对于可在浏览器中运行的功能，功能页 SHALL 优先提供可交互演示。

Demo 容器：
- SHALL 使用 `::: demo <workspace>/<demo-file>.vue :::` 语法
- SHALL 放置在功能页（非 `index.md`）中
- Demo 文件 SHALL 存在于 `docs/examples/<workspace>/` 目录

#### Scenario: HTTP Plugin Demo

- **GIVEN** 用户访问 `docs/content/packages/http/plugins.md`
- **WHEN** 页面包含可浏览器运行的示例
- **THEN** 页面包含 `::: demo http/xxx.vue :::` 容器
- **AND** 对应的 `docs/examples/http/xxx.vue` 文件存在

#### Scenario: Excel Demo in Feature Page

- **GIVEN** 用户访问 excel 包的功能页（如 `workbook.md`）
- **WHEN** 页面需要展示导出示例
- **THEN** 页面包含 `::: demo excel/create-and-download.vue :::` 容器
- **AND** demo 不在 `excel/index.md` 中

---

### Requirement: API Reference Accuracy

所有 API 名称、参数和返回值 SHALL 来自源码：
- 优先参考 `packages/<pkg>/dist/index.d.ts`
- 其次参考 `packages/<pkg>/src/**`

功能页 SHALL NOT 包含臆造的 API。

#### Scenario: Verify Type Export

- **GIVEN** `core/data.md` 中文档描述 `o()` 函数
- **WHEN** 验证 API 准确性
- **THEN** `packages/core/dist/index.d.ts` 中存在 `o` 导出
- **AND** 文档中的方法签名与类型定义一致

#### Scenario: Core Package API Correction

- **GIVEN** 文档使用 `$arr`、`$obj`、`$date`、`$num` 等不存在的导出
- **WHEN** 重写文档
- **THEN** 使用实际导出：`arr()`、`o()`、`Dater/date()`、`$n/n()`
- **AND** 删除不存在的 `Timer` 类相关内容
- **AND** 将 `Observer` 修正为 `Observable`
- **AND** 将 `safe()` 修正为 `safeRun()`

---

### Requirement: Emoji Usage Restriction

文档页面 SHALL 遵循以下 Emoji 使用规范：
- 默认不使用 Emoji
- 必要时一页最多 0-2 个 Emoji
- 不得滥用 Emoji 作为标题装饰

#### Scenario: Index Page Emoji Cleanup

- **GIVEN** `be/index.md` 当前包含 7 个 Emoji（📁⚙️📝💾🌐📊⏰）
- **WHEN** 重写文档
- **THEN** 页面 Emoji 数量减少到 0-2 个
- **AND** 不使用 Emoji 作为模块标题前缀

#### Scenario: Fe Index Emoji Cleanup

- **GIVEN** `fe/index.md` 当前包含 5 个 Emoji
- **WHEN** 重写文档
- **THEN** 页面 Emoji 数量减少到 0-2 个

---

### Requirement: Code Example Format

代码示例 SHALL：
- 使用 TypeScript
- 使用包名导入（如 `import { ... } from '@cat-kit/core'`）
- 能够"复制即用"（包含必要的上下文）

#### Scenario: Importable Example

- **GIVEN** 功能页包含代码示例
- **WHEN** 用户复制代码到项目中
- **THEN** 代码导入语句使用 `@cat-kit/<workspace>` 包名
- **AND** 代码包含必要的类型定义和初始化

