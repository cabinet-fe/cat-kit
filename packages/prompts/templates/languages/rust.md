# Rust 代码风格指南

## 文件命名

遵循**snake_case**命名法，例如：`user_service.rs`

## 项目约定

### 类型设计

- 考虑使用 newtype 模式增加类型安全

### 构造函数命名

- 主构造函数：`new`
- 替代构造函数：`from_*`、`with_*`

### Trait 派生

- 公共类型应派生 `Debug`
- 数据类型考虑派生 `Clone`、`PartialEq`

### 错误处理

- 使用 `thiserror` 定义错误类型
- 使用 `?` 操作符传播错误
