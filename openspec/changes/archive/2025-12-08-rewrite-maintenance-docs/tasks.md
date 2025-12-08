# 任务清单: 重写 @cat-kit/maintenance 文档

## 1. 准备工作

- [x] 1.1 确认所有源代码模块的最新 API 签名
- [x] 1.2 备份现有文档（如需要可回滚）

## 2. 核心文档重写

- [x] 2.1 重写 `index.md`
  - 更新功能模块列表
  - 更新快速示例代码使用 `Monorepo` 类
  - 保留前置知识章节（库构建 vs 应用构建）

- [x] 2.2 重写 `deps.md`
  - 更新 `checkCircularDependencies` 为新签名 `(packages: PackageInfo[])`
  - 更新 `checkVersionConsistency` 为新签名 `(packages: PackageInfo[])`
  - 更新 `buildDependencyGraph` 签名
  - 更新类型定义章节

- [x] 2.3 重写 `version.md`
  - 更新 `bumpVersion` 签名 `(pkgPath: string, options: BumpOptions)`
  - 更新 `syncPeerDependencies` 和 `syncDependencies` 签名
  - 验证其他函数签名正确性

- [x] 2.4 创建新的 `monorepo.md`（替代 `bundler.md`）
  - 记录 `Monorepo` 类的完整 API
    - 构造函数
    - `root` 属性
    - `workspaces` 属性
    - `group()` 方法
    - `validate()` 方法
    - `buildDependencyGraph()` 方法
  - 记录 `WorkspaceGroup` 类的完整 API
    - `build()` 方法
    - `bumpVersion()` 方法
    - `publish()` 方法
  - 提供完整的使用示例

- [x] 2.5 验证 `release.md`
  - 确认 `createGitTag`、`commitAndPush`、`publishPackage` 签名一致
  - 更新类型定义（如有变更）

## 3. 删除废弃内容

- [x] 3.1 删除或重命名 `bundler.md`
- [x] 3.2 移除所有对 `MonoRepoBundler` 的引用

## 4. 验证与测试

- [x] 4.1 确保所有代码示例可以编译通过
- [x] 4.2 运行文档构建命令验证无错误
- [x] 4.3 检查内部链接是否正常工作

## 5. 完成

- [x] 5.1 更新文档版本说明（如适用）
- [x] 5.2 最终审核文档一致性

---

## 完成说明

所有任务已完成。主要变更：

1. **index.md** - 更新为使用 `Monorepo` 类的快速示例，保留前置知识章节
2. **deps.md** - 更新函数签名为接受 `PackageInfo[]` 参数，添加 `Monorepo` 类使用示例
3. **version.md** - 更新 `bumpVersion` 为单包操作签名，更新 sync 函数签名
4. **monorepo.md** - 新建，完整记录 `Monorepo` 和 `WorkspaceGroup` 类的 API
5. **release.md** - 验证已与源代码一致，调整排序位置
6. **bundler.md** - 已删除（由 monorepo.md 替代）
