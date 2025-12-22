# Cat-Kit 统一改进计划（Agent 可执行版）

> 目标：把 `plans/level-1-critical.md`、`plans/level-2-high.md`、`plans/improvements.md` 的内容去重合并，形成一份**可分阶段**、**可验收**、**便于 agent 逐条推进**的实施计划。

## 0. 范围与原则

### 0.1 范围（本计划覆盖）

- `@cat-kit/core`
- `@cat-kit/http`
- `@cat-kit/fe`
- `@cat-kit/excel`
- `@cat-kit/be`
- 测试：`packages/tests/*`

### 0.2 约束（必须遵守）

- **Bun**：使用 `bun` 执行脚本/安装依赖（本计划默认不新增依赖，除非确有必要）。
- **TypeScript 类型优先**：公开 API 必须有明确类型签名与 JSDoc。
- **Tree-shaking 友好**：避免默认导出与副作用。
- **文档**：仅在行为/类型/示例发生变更时更新对应文档，避免无谓 markdown 堆积。

### 0.3 OpenSpec 门禁（什么时候要走 proposal）

根据 `openspec/AGENTS.md`：

- **直接实现（不走 OpenSpec）**：明确的 bugfix、空实现修复、修正参数/类型错误、补齐测试（不改变公开 API 语义或只做向后兼容增强）。
- **必须先写 OpenSpec proposal 再实现**（满足其一即可）：
  - 新增能力/插件/传输器等（例如 `RetryPlugin`、`FileTransport`）
  - 行为改变可能影响用户依赖（例如 HTTP 默认对非 2xx 抛错、URL 解码策略变更）
  - 架构/错误模型/跨模块模式调整

> 本文档会在每个任务上标注 **[OpenSpec]** 或 **[Direct]**。

## 1. 分阶段里程碑

### 阶段 A（P0）：可用性/数据安全（优先落地）

- 目标：消除“空实现导出”“数据丢失”“明显误导的 API”这类会直接伤害用户信任的问题。
- 完成标志：
  - 所有 P0 任务合并后，相关测试补齐并通过。
  - 不引入破坏性变更（若不可避免，转入 OpenSpec 流程）。

### 阶段 B（P1）：一致性/健壮性（影响体验与稳定性）

- 目标：提升错误处理、一致性与容错，减少“脏数据击穿”“类型污染”“默认控制台污染”等问题。
- 完成标志：
  - 覆盖关键边界条件的测试用例到位。
  - 对外行为变更点要么保持向后兼容，要么通过 OpenSpec 明确迁移策略。

### 阶段 C（P2）：能力增强/技术债清理

- 目标：补齐常用能力（重试、细粒度取消、统一错误模型等）并清理死代码/弱类型实现。
- 完成标志：
  - 新能力均有文档示例与测试（必要时）。
  - 关键模块无“空壳导出”“明显 dead code”。

## 2. 统一优先级任务清单（去重合并版）

### 2.1 P0 任务（阶段 A）

- [ ] **CORE-001 [Direct]**：`Validator` 空实现修复（实现或移除导出，二选一）

  - **涉及**：`packages/core/src/data/validator.ts`（及 `packages/core/src/index.ts` 导出）
  - **验收**：用户导入有可用功能；或不再导出该空类且有迁移说明（如属破坏性则转 OpenSpec）
  - **测试**：新增 `packages/tests/core/*` 对应测试用例

- [ ] **CORE-002 [Direct]**：`parallel` 名不副实（实现并发控制/异步并行或调整导出策略）

  - **涉及**：`packages/core/src/optimize/parallel.ts`
  - **验收**：对异步任务提供真实并行/并发控制；同步版本语义明确（必要时拆分 `parallel`/`parallelSync`）
  - **测试**：覆盖并发上限、异常处理策略、顺序与结果对齐

- [ ] **HTTP-001 [Direct/OpenSpec?]**：`Requestor` 空壳处理（实现 or 移除）

  - **涉及**：`packages/http/src/requestor.ts`、`packages/http/src/index.ts`
  - **决策点**：
    - 若“实现单请求生命周期管理（abort/retry 等）”→ **更像新增能力**，倾向 **[OpenSpec]**
    - 若“当前版本不承诺”→ **[Direct]**：移除导出/删除文件/补充说明
  - **验收**：不再有“导出但不可用”的公开 API

- [ ] **FE-P0-001 [Direct]**：IndexedDB 升级清库问题（升级不应默认丢数据）

  - **涉及**：`packages/fe/src/storage/idb.ts`
  - **验收**：版本升级不会无条件删除并重建 `objectStore`；提供迁移/升级策略
  - **测试**：模拟版本升级流程（至少覆盖“保留数据”场景）

- [ ] **FE-P0-002 [Direct]**：IndexedDB 连接时序竞态（提供 `ready/open` 边界或内部队列化）

  - **涉及**：`packages/fe/src/storage/idb.ts`
  - **验收**：调用方不会轻易命中“数据库未连接”；API 行为清晰可预测
  - **测试**：并发调用/快速连续调用下稳定

- [ ] **EXCEL-P0-001 [Direct/OpenSpec?]**：Worker 读写序列化导致 `Date` 等类型被破坏
  - **涉及**：`packages/excel/src/worker.ts`、相关 worker client；以及 `docs/content/packages/excel/index.md` 示例
  - **决策点**：
    - 若仅修复实现以匹配“文档宣称 worker 支持”的预期 → 多数是 **[Direct]**
    - 若需要变更公开数据结构/序列化协议 → 可能需要 **[OpenSpec]**
  - **验收**：Worker 读写下 `Date` 等类型不被意外降级，或明确声明/约束并同步文档
  - **测试**：Worker 通信 roundtrip（至少覆盖包含 `Date` 的示例）

### 2.2 P1 任务（阶段 B）

- [ ] **HTTP-P1-001 [OpenSpec]**：URL 解码策略不安全（对整段 URL `decodeURIComponent` 可能抛 `URIError`/改变语义）

  - **涉及**：`packages/http/src/client.ts`
  - **验收**：不会因非法编码导致整请求崩溃；解码范围与规则明确（例如只解码 query 的 value）
  - **测试**：覆盖非法 `%`、保留字符、已编码/未编码混合场景

- [ ] **HTTP-P1-002 [Direct]**：文档示例与类型/字段不一致（method 大小写、params/query 心智模型）

  - **涉及**：`packages/http/src/types.ts`、`packages/http/src/client.ts`、（必要时）`packages/http/README.md`、docs 示例
  - **验收**：类型、实现、示例一致；给出兼容策略（例如同时支持 `params`/`query` 或提供明确迁移）
  - **测试**：至少覆盖 `method` 归一化与 `params/query` 映射

- [ ] **FE-P1-001 [Direct]**：WebStorage JSON.parse 易被脏数据击穿（提供安全解析/回退）

  - **涉及**：`packages/fe/src/storage/storage.ts`
  - **验收**：遇到非 JSON 值不抛出未捕获异常；行为可配置（返回 `null`/默认值/清理脏数据）
  - **测试**：存入非 JSON 字符串、空字符串、`null`、大对象等

- [ ] **CORE-P1-001 [Direct]**：`debounce` 的 `NodeJS.Timeout` 类型污染（DOM-only 工程风险）

  - **涉及**：`packages/core/src/optimize/timer.ts`
  - **验收**：在仅 `dom` lib 下不需要引入 `@types/node` 也能通过类型检查
  - **测试**：类型层面（dts）与运行时行为不变

- [ ] **CORE-P1-002 [Direct]**：库默认 `console.*` 污染（改为可注入 logger 或移除）

  - **涉及**：`packages/core/src/pattern/observer.ts`、`packages/core/src/data/object.ts`
  - **验收**：默认不输出到控制台；必要日志通过可选钩子/回调/显式开关提供
  - **测试**：确保不再调用 `console.warn/error`（可通过 spy）

- [ ] **CORE-004 [Direct]**：Tree BFS 缺少 `parent` 参数传递

  - **涉及**：`packages/core/src/data-structure/tree.ts`
  - **验收**：`bfs` 回调能拿到 parent，且与 DFS 行为一致
  - **测试**：验证 parent 正确、index 语义明确

- [ ] **FE-001 [Direct]**：`Virtualizer.scrollToIndex()` 无法跳转到未渲染项
  - **涉及**：`packages/fe/src/virtualizer/index.ts`
  - **验收**：任意 index 可跳转（即使当前不可见）；滚动位置计算准确
  - **测试**：覆盖未渲染区间、边界 index、超界处理

### 2.3 P2 任务（阶段 C）

- [ ] **HTTP-004 [OpenSpec]**：非 2xx 响应是否应抛错（与 axios 等对齐 vs 保持“总返回”）

  - **涉及**：`packages/http/src/engine/fetch.ts`、`packages/http/src/types.ts`
  - **验收**：行为在 spec/文档中明确；若改为抛错，提供迁移方案与错误类型（包含 response/config 等）
  - **测试**：4xx/5xx、解析失败、网络错误、AbortError

- [ ] **HTTP-002 [OpenSpec]**：重试插件 `RetryPlugin`

  - **涉及**：`packages/http/src/plugins/retry.ts`、插件系统与 client 调度
  - **验收**：可配置重试次数/退避策略/判定条件；不会导致重复副作用（文档声明）
  - **测试**：模拟失败后重试成功、达到上限停止、shouldRetry 自定义

- [ ] **HTTP-003 [OpenSpec]**：单请求取消（支持 `AbortSignal`/每个请求独立 controller）

  - **涉及**：`packages/http/src/client.ts`、`packages/http/src/types.ts`
  - **验收**：可以取消某一个请求而不影响其他请求；与现有 `abort()`（全局）关系清晰
  - **测试**：取消单个请求、并发请求互不影响

- [ ] **HTTP-P2-001 [OpenSpec]**：统一错误模型（code/response/config）

  - **涉及**：`packages/http/src/engine/*`、`packages/http/src/types.ts`
  - **验收**：错误可分支处理、插件可识别；错误携带足够上下文
  - **测试**：覆盖不同 engine 错误路径的一致性

- [ ] **HTTP-P2-002 [Direct]**：FetchEngine 透传非 fetch 选项（清理 RequestInit spread 杂质）

  - **涉及**：`packages/http/src/engine/fetch.ts`
  - **验收**：只把合法 `RequestInit` 字段传入 fetch；其他字段用于内部逻辑
  - **测试**：确保不会把 `query/responseType` 等传给 fetch

- [ ] **HTTP-P2-003 [Direct]**：`packages/http/src/requestor.ts` 若决定保留则落地，否则删除（与 HTTP-001 合并决策）

- [ ] **CORE-P2-001 [Direct]**：`throttle` 返回值/异常边界更严谨、类型更精确

  - **涉及**：`packages/core/src/optimize/timer.ts`
  - **验收**：文档与类型描述清晰；异常后下一窗口行为明确
  - **测试**：异常路径、返回值一致性、leading/trailing（如支持）

- [ ] **CORE-P2-002 [Direct]**：Observable 内部类型 any（修正 PropHandler.callback 语义）

  - **涉及**：`packages/core/src/pattern/observer.ts`
  - **验收**：对外类型更强；内部不靠 `any` 兜底关键路径
  - **测试**：基础行为测试 + 类型推断示例（必要时）

- [ ] **CORE-003 [OpenSpec]**：`CatObject.copy()` 深拷贝边界（structuredClone/自定义 clone/明确限制）

  - **涉及**：`packages/core/src/data/object.ts`
  - **验收**：至少不再“默默丢 Date”等；或在文档/类型中明确 copy 语义与限制
  - **测试**：Date/Map/Set/循环引用/函数（若不支持需明确）

- [ ] **EXCEL-P2-001 [Direct]**：`WorkerClient` 类型过宽、id 生成与 pending 清理不足

  - **涉及**：`packages/excel/src/worker-client.ts`
  - **验收**：返回类型收紧；处理 `worker.onerror/messageerror`；pending 可超时/可清理
  - **测试**：错误路径、超时、并发请求

- [ ] **BE-P2-001 [Direct]**：`memoize` 并发去重（并发同参只执行一次）+ resolver 循环引用健壮性

  - **涉及**：`packages/be/src/cache/memoize.ts`
  - **验收**：并发调用不会重复执行；对循环引用参数不会崩溃（或明确限制）
  - **测试**：并发、异常、参数 key 冲突与循环引用

- [ ] **BE-001 [OpenSpec]**：Logger `FileTransport`
  - **涉及**：`packages/be/src/logger/transports.ts`（及相关 logger 模块）
  - **验收**：可写文件、目录自动创建、错误处理明确、（如支持）轮转策略
  - **测试**：写入、权限错误、轮转（如实现）

## 3. 建议执行顺序（综合版）

> 目标：先“止血（空实现/数据丢失）”，再“统一行为（错误/解析/类型污染）”，最后“加能力（重试/取消/传输器）”。

1. **CORE-001 → CORE-002 → HTTP-001（决策）**
2. **FE-P0-001 → FE-P0-002**
3. **EXCEL-P0-001**
4. **HTTP-P1-002 → FE-P1-001 → CORE-P1-001 → CORE-P1-002 → CORE-004 → FE-001**
5. **OpenSpec 组包**（建议合并成少量 change，避免碎片化）：
   - `http-error-and-cancel`（HTTP-004/HTTP-003/HTTP-P2-001）
   - `http-retry-plugin`（HTTP-002）
   - `core-catobject-copy`（CORE-003）
   - `be-file-transport`（BE-001）

## 4. 每个任务的“最小交付”模板（Agent 执行步骤）

对任何一个任务，建议严格按下列最小闭环推进：

1. **确认范围**：定位影响文件与导出点（`src/index.ts` / 包对外 API）。
2. **确定类型与兼容性**：是否会改变现有行为？若是 → 先走 OpenSpec。
3. **实现**：保持纯函数/无副作用（除非该模块本质上需要副作用）。
4. **补测试**：在 `packages/tests/<pkg>/` 增加对应 `.test.ts`。
5. **必要时更新文档**：仅当示例/行为/类型改变时更新。
6. **自检**：确保无新的 lints / 类型错误（在仓库约束下）。

## 5. 待确认问题（建议你拍板，避免 agent “似是而非”）

- **HTTP 非 2xx 行为**：是否要默认抛错？还是保持“总返回”，由插件决定抛错？
- **HTTP params/query**：是否要兼容 `params`（别名）还是明确只支持 `query`？
- **Requestor**：要作为“单请求句柄（abort/retry/progress）”正式能力，还是从导出移除？
- **Excel Worker 序列化**：目标是“完整保真（含 Date）”还是“只支持可结构化克隆的数据类型并文档声明”？
