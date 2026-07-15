# be — 配置与环境变量

## 何时使用

需要读取 `.env`、把字符串环境变量转换为类型化配置，或加载并合并 JSON/YAML/TOML 配置时使用。

## 如何选择

- `parseEnvFile(content)`：只解析一段 `.env` 文本，不访问文件系统或 `process.env`。
- `loadEnv(options)`：按优先级读取多个 `.env` 文件，可选择是否写入 `process.env`。
- `parseEnv(schema, source?)`：校验必填项，并转换为 `string`、`number`、`boolean`、`json`、`array` 或自定义类型。
- `loadConfig(file, options?)`：读取 JSON/YAML/TOML；支持默认值、自定义解析器和抛错式校验函数。
- `mergeConfig(...configs)`：深度合并对象；后值覆盖前值，数组整体替换。

## 最小示例

```ts
import { parseEnv, parseEnvFile } from '@cat-kit/be'

const source = parseEnvFile(`
PORT=8080
DEBUG=true
`)

const env = parseEnv(
  {
    PORT: { type: 'number', default: 3000 },
    DEBUG: { type: 'boolean', default: false },
    DATABASE_URL: { type: 'string', required: true }
  },
  { ...source, DATABASE_URL: 'postgres://localhost/app' }
)
```

## 约束与边界

- `loadEnv` 默认依次尝试 `.env`、`.env.local`，指定 `mode` 后再尝试 `.env.<mode>`、`.env.<mode>.local`；缺失文件会跳过，后读文件覆盖前值。
- `loadEnv` 默认写入 `process.env`，但默认不覆盖其中已有键。纯读取请传 `injectToProcess: false`。
- `parseEnv` 的自定义 `type` 接收 `(value, key)`；`transform` 在类型转换后执行。必填值缺失或转换失败会抛错。
- `loadConfig` 的 `validate(config)` 应在无效时抛错。`mergeDefaults: false` 只做浅层默认值合并。

## 精确类型入口

[环境变量与 parseEnvFile](../../generated/be/config/env.d.ts) · [配置文件](../../generated/be/config/config.d.ts) · [配置合并](../../generated/be/config/merge.d.ts)
