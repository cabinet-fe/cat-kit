# be — 网络

## 何时使用

启动本地服务前检查监听端口，或为日志、局域网访问提示选择本机 IP 时使用。

## 如何选择

- `isPortAvailable(port, options?)`：尝试监听指定主机和端口，返回是否可绑定。
- `getLocalIP(options?)`：返回首个匹配地址族的网卡地址。

## 最小示例

```ts
import { getLocalIP, isPortAvailable } from '@cat-kit/be'

const port = 3000
if (!(await isPortAvailable(port, { host: '0.0.0.0' }))) {
  throw new Error(`Port ${port} is unavailable`)
}

console.log(`http://${getLocalIP() ?? 'localhost'}:${port}`)
```

## 约束与边界

- 端口检查默认主机为 `127.0.0.1`、超时为 1000 ms；它检查本机能否绑定，不检查远端服务是否可达。
- 检查与真正监听之间存在竞争窗口，不能把返回 `true` 当作端口预留。
- `getLocalIP` 默认选择 IPv4，并排除操作系统标记为 `internal` 的回环接口；`includeInternal` 不表示“包含所有私有网段”。
- 未找到地址时 `getLocalIP` 返回 `undefined`。

## 精确类型入口

[端口检查](../../generated/be/net/port.d.ts) · [本机 IP](../../generated/be/net/ip.d.ts)
