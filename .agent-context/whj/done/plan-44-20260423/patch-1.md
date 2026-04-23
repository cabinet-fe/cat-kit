# review 后补丁修复

## 补丁内容

1. **修复 number-format-demo.vue 精度控制 UI 与逻辑不一致**
   - `showPrecision` 判断数组中补充 `formatter-decimal` 和 `formatter-percent`，使精度输入框在 formatter 场景下也可见

2. **修复 number-calc-demo.vue 使用 `eval()` 的安全隐患**
   - 将 `eval(expression.value)` 替换为 `new Function('return ' + expression.value)()`，降低 XSS 风险

3. **补充拆分过程中丢失的综合示例**
   - `object.md`：增加表单数据处理综合示例
   - `array.md`：增加 API 响应处理综合示例
   - `string.md`：增加 URL 构建综合示例

## 影响范围

- 修改文件: `docs/examples/core/number-format-demo.vue`
- 修改文件: `docs/examples/core/number-calc-demo.vue`
- 修改文件: `docs/content/packages/core/data/object.md`
- 修改文件: `docs/content/packages/core/data/array.md`
- 修改文件: `docs/content/packages/core/data/string.md`
