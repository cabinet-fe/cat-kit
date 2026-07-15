# be — 系统信息

## 何时使用

生成健康检查、诊断信息或容量告警所需的 CPU、内存、磁盘和网卡快照时使用。

## 如何选择

- `getCpuInfo()`：型号、核心数、主频和 1/5/15 分钟平均负载。
- `getCpuUsage(interval?)`：在采样窗口内计算 CPU 使用率，默认等待 500 ms。
- `getMemoryInfo()`：总量、空闲、已用字节数和使用率。
- `getDiskInfo(path?)`：指定路径所在文件系统的容量和使用率。
- `getNetworkInterfaces(options?)`：列出地址、地址族、MAC、掩码和 CIDR。

## 最小示例

```ts
import { getCpuUsage, getDiskInfo, getMemoryInfo } from '@cat-kit/be'

const [cpu, disk] = await Promise.all([getCpuUsage(), getDiskInfo()])
const memory = getMemoryInfo()

console.log({ cpu: cpu.percent, memory: memory.usedPercent, disk: disk.usedPercent })
```

## 约束与边界

- 内存和磁盘容量均以字节返回；`percent` / `usedPercent` 为百分比数值。
- `getCpuUsage` 会真实等待采样区间，不适合无延迟的热路径。
- `getDiskInfo()` 默认检查 `process.cwd()` 所在文件系统；目标路径无效或系统查询失败时会抛错。
- `getNetworkInterfaces` 默认排除操作系统标记为 internal 的回环接口；传 `includeInternal: true` 才包含。
- 这些值是调用时快照，不是持续监控流。

## 精确类型入口

[CPU](../../generated/be/system/cpu.d.ts) · [内存](../../generated/be/system/memory.d.ts) · [磁盘](../../generated/be/system/disk.d.ts) · [网卡](../../generated/be/system/network.d.ts)
