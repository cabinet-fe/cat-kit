# 日期文档规范

## ADDED Requirements

### Requirement: 交互式日期格式化演示

文档 SHALL 提供交互式日期格式化演示组件，允许用户实时体验 `Dater.format()` 方法的效果。

#### Scenario: 用户选择不同格式模板

- **WHEN** 用户在格式化演示中选择不同的格式模板（如 `yyyy-MM-dd`、`yyyy年M月d日`）
- **THEN** 系统立即显示当前日期按该模板格式化后的结果

#### Scenario: 用户切换 UTC 模式

- **WHEN** 用户在格式化演示中启用 UTC 选项
- **THEN** 格式化结果按 UTC 时间显示而非本地时间

---

### Requirement: 交互式日期计算演示

文档 SHALL 提供交互式日期计算演示组件，允许用户体验日期加减操作。

#### Scenario: 用户进行日期加减计算

- **WHEN** 用户输入基准日期和偏移量（如 +7 天）
- **THEN** 系统显示计算后的日期结果

#### Scenario: 展示不可变操作特性

- **WHEN** 用户执行 `addDays()` 等不可变操作
- **THEN** 演示同时显示原日期和新日期，证明原日期未被修改

---

### Requirement: 交互式日期比较演示

文档 SHALL 提供交互式日期比较演示组件，允许用户体验日期比较和范围判断。

#### Scenario: 用户比较两个日期

- **WHEN** 用户选择两个日期进行比较
- **THEN** 系统显示 `compare()` 和 `diff()` 的结果（天数差、其他单位差值）

#### Scenario: 用户进行范围判断

- **WHEN** 用户输入一个日期和一个日期区间
- **THEN** 系统显示 `isBetween()` 的判断结果

---

### Requirement: 交互式日期解析演示

文档 SHALL 提供交互式日期解析演示组件，允许用户体验 `Dater.parse()` 方法。

#### Scenario: 用户解析有效日期字符串

- **WHEN** 用户输入日期字符串和对应的格式模板
- **THEN** 系统显示解析后的 Dater 对象属性（年、月、日等）

#### Scenario: 用户输入无效日期

- **WHEN** 用户输入无法解析的日期字符串（如 `2024-02-30`）
- **THEN** 系统显示 "Invalid Date" 提示，并说明 `timestamp` 为 `NaN`
