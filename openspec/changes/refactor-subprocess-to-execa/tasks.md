# 任务清单: 重构子进程操作

## 1. 重构 Git 命令执行

- [x] 1.1 更新 `utils.ts` 中的 `execGit()` 函数
  - 使用 `$` 模板字符串语法：`$({ cwd })\`git ${args}\``
  - 静默模式，返回 stdout
  - 保持 `GitError` 异常类型不变
  - 移除 `node:child_process` 导入

## 2. 重构 NPM 发布

- [x] 2.1 更新 `release/publish.ts` 中的 `publishPackage()` 函数
  - 使用 `$` 模板字符串语法
  - 使用 `stdio: 'inherit'` 实时输出发布进度
  - 保持 `PublishError` 异常类型不变
  - 移除 `node:child_process` 导入
  - 移除冗余的 `execNpm` 辅助函数

## 3. 验证

- [ ] 3.1 验证 git 操作正常（版本更新流程）
- [ ] 3.2 验证 npm 发布（dry-run 模式）
- [x] 3.3 确认无 `node:child_process` 残留导入
