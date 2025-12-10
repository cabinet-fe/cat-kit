# parallel-publish Specification

## Purpose

支持并行发布同组内的多个包，提高发布效率。

## MODIFIED Requirements

### Requirement: 并行发布包

系统 SHALL 将 `WorkspaceGroup.publish()` 方法修改为并行执行，同时发布组内的所有非私有包。

返回类型变更为 `PublishGroupResult`，包含每个包的发布结果。

#### Scenario: 并行发布多个包

- **GIVEN** main 组包含 5 个包
- **WHEN** 调用 `main.publish()`
- **THEN** 5 个包同时开始发布（并行）
- **AND** 返回结果包含每个包的成功/失败状态

#### Scenario: 单个包失败不影响其他包

- **GIVEN** main 组包含 5 个包
- **WHEN** 发布过程中 `@cat-kit/be` 失败
- **THEN** 其他 4 个包继续发布
- **AND** 返回结果中 `hasFailure` 为 `true`
- **AND** 结果数组包含失败包的错误信息

### Requirement: 发布结果类型

系统 SHALL 提供 `PublishGroupResult` 接口：

```typescript
interface PublishGroupResult {
  results: Array<{
    name: string
    success: boolean
    error?: Error
  }>
  hasFailure: boolean
}
```

#### Scenario: 获取详细发布结果

- **GIVEN** 调用 `main.publish()` 完成
- **WHEN** 检查返回的 `PublishGroupResult`
- **THEN** 可以遍历 `results` 获取每个包的状态
- **AND** 可以通过 `hasFailure` 快速判断是否有失败
