---
title: "@cat-kit/be 系统信息 API（CPU 内存 磁盘 网卡）"
description: "@cat-kit/be 系统信息模块 API 参考：getCpuInfo 与 getCpuUsage 读取 CPU 信息与使用率，getMemoryInfo 内存快照，getDiskInfo 磁盘容量（Windows 走 PowerShell），getNetworkInterfaces 网卡列表。"
aliases: [系统信息 API, system info API, CPU 使用率 API, 磁盘信息 API]
keywords: [getCpuInfo, getCpuUsage, getMemoryInfo, getDiskInfo, getNetworkInterfaces, CpuInfo, CpuUsage, MemoryInfo, DiskInfo, NetworkInterfaceInfo, GetNetworkInterfacesOptions, loadAverage, usedPercent, cidr, CPU 使用率, 内存占用, 磁盘容量, 网卡列表, 健康检查, 磁盘告警]
---

# @cat-kit/be 系统信息 API（CPU 内存 磁盘 网卡）

`@cat-kit/be` 导出五个系统信息函数：`getCpuInfo()` 与 `getMemoryInfo()` 同步返回资源快照；`getCpuUsage(interval?)` 异步采样计算 CPU 使用率；`getDiskInfo(path?)` 异步返回磁盘容量；`getNetworkInterfaces(options?)` 同步返回网卡列表。容量与使用率字段为原始数值，单位在各字段说明中标注。

## 快速上手

```ts
import { getMemoryInfo } from '@cat-kit/be'

const memory = getMemoryInfo()
console.log(memory.usedPercent > 0) // => true
console.log(memory.used + memory.free === memory.total) // => true
```

## API 签名

```ts
export interface CpuInfo {
  /** 第一个核心的型号字符串 */
  model: string
  /** 逻辑核心数 */
  cores: number
  /** 主频（MHz） */
  speed: number
  /** 1 / 5 / 15 分钟平均负载 */
  loadAverage: [number, number, number]
}

/** 同步读取 CPU 基本信息 */
export function getCpuInfo(): CpuInfo

export interface CpuUsage {
  /** 采样区间内用户态时间（毫秒） */
  user: number
  /** 采样区间内系统态时间（毫秒） */
  system: number
  /** 采样区间内空闲时间（毫秒） */
  idle: number
  /** user + system + idle（毫秒） */
  total: number
  /** CPU 使用率，0~100 的百分数 */
  percent: number
}

/** 采样 interval 毫秒计算使用率；await 期间真实休眠 */
export function getCpuUsage(interval?: number): Promise<CpuUsage>

export interface MemoryInfo {
  /** 总内存（字节） */
  total: number
  /** 空闲内存（字节） */
  free: number
  /** total - free（字节） */
  used: number
  /** 使用率，0~100 的百分数 */
  usedPercent: number
}

/** 同步读取系统内存信息 */
export function getMemoryInfo(): MemoryInfo

export interface DiskInfo {
  /** 查询路径；Windows 下返回盘符根路径如 'C:\\' */
  path: string
  /** 总容量（字节） */
  total: number
  /** 空闲容量（字节）；Unix 取非特权用户可用块，与 df 口径一致 */
  free: number
  /** total - free，最小为 0（字节） */
  used: number
  /** 使用率，0~100 的百分数 */
  usedPercent: number
}

/** path 默认 process.cwd()；Unix 用 statfs，Windows 用 PowerShell 的 Get-PSDrive */
export function getDiskInfo(path?: string): Promise<DiskInfo>

export interface NetworkInterfaceInfo {
  /** 网卡名称，如 'en0'、'eth0' */
  name: string
  /** IP 地址 */
  address: string
  /** 地址族 */
  family: 'IPv4' | 'IPv6'
  /** MAC 地址 */
  mac: string
  /** 是否为 Node 标记的内部地址（loopback 等） */
  internal: boolean
  /** 子网掩码 */
  netmask: string
  /** CIDR 表示法，系统未提供时缺省 */
  cidr?: string
}

export interface GetNetworkInterfacesOptions {
  /** 是否包含内网（internal）地址。默认 false */
  includeInternal?: boolean
}

/** 同步枚举本机网卡 */
export function getNetworkInterfaces(
  options?: GetNetworkInterfacesOptions
): NetworkInterfaceInfo[]
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `interval` | `number` | `500` | 否 | 毫秒；调用方 await 期间真实休眠该时长，传入过大会阻塞调用链 |
| `path`（getDiskInfo） | `string` | `process.cwd()` | 否 | 相对路径基于 `process.cwd()` 解析为绝对路径；Unix 查询该路径所在挂载点 |
| `includeInternal` | `boolean` | `false` | 否 | `true` 时结果包含 `internal: true` 的 loopback 地址 |

返回值口径：

- `CpuUsage.percent = (total - idle) / total * 100`，采样区间过短时抖动明显；`total === 0` 时为 `0`
- `MemoryInfo` / `DiskInfo` 的 `usedPercent = used / total * 100`；`total === 0` 时为 `0`
- `DiskInfo.free` 在 Unix 使用 `bavail`（非特权用户可用块），比 `bfree` 小，与 `df` 输出一致

## 典型示例

### 健康检查端点快照

```ts
import { createServer } from 'node:http'
import { getCpuInfo, getMemoryInfo } from '@cat-kit/be'

const server = createServer((req, res) => {
  if (req.url !== '/health') {
    res.statusCode = 404
    res.end()
    return
  }

  const cpu = getCpuInfo()
  const memory = getMemoryInfo()
  res.setHeader('content-type', 'application/json')
  res.end(
    JSON.stringify({
      cpuModel: cpu.model,
      cores: cpu.cores,
      loadAverage: cpu.loadAverage,
      memoryUsedPercent: Number(memory.usedPercent.toFixed(2))
    })
  )
})

server.listen(3000)
// curl http://localhost:3000/health
// => {"cpuModel":"Apple M3 Pro","cores":12,"loadAverage":[2.1,2.3,2.0],"memoryUsedPercent":71.42}
```

### 磁盘水位告警

```ts
import { getDiskInfo } from '@cat-kit/be'

async function checkDisk(path: string): Promise<void> {
  const disk = await getDiskInfo(path)
  const usedGiB = disk.used / 1024 ** 3
  const totalGiB = disk.total / 1024 ** 3

  console.log(`${disk.path}: ${usedGiB.toFixed(1)}/${totalGiB.toFixed(1)} GiB`)

  if (disk.usedPercent > 90) {
    throw new Error(`磁盘使用率 ${disk.usedPercent.toFixed(1)}% 超过 90% 阈值`)
  }
}

await checkDisk('/data')
// => '/data: 412.3/926.5 GiB'
// 超过阈值时抛出 Error，由调用方捕获后接入告警通道
```

### 枚举网卡用于服务注册

```ts
import { getNetworkInterfaces } from '@cat-kit/be'

const interfaces = getNetworkInterfaces({ includeInternal: true })
const addresses = interfaces.map((nic) => `${nic.name}=${nic.address}/${nic.family}`)
console.log(addresses.length > 0) // => true
console.log(interfaces.every((nic) => nic.family === 'IPv4' || nic.family === 'IPv6')) // => true
```

## 注意事项

> [!WARNING]
> - 本库 `getCpuUsage` 是阻塞式采样：`await getCpuUsage(500)` 期间调用方真实休眠 500 毫秒，不适合放在请求热路径上。
> - 本库所有 `usedPercent` 是 0~100 的百分数，不是 0~1 的比例值。
> - 本库 `getCpuInfo().loadAverage` 在 Windows 上恒为 `[0, 0, 0]`（Node.js `os.loadavg()` 的平台行为），判负载告警只在 Unix 上有意义。
> - 本库 `getDiskInfo` 在 Windows 上调用 `powershell` 子进程（`Get-PSDrive`），首次调用有进程启动开销；非 Windows 平台走 `statfs` 系统调用。
> - 本库 `getMemoryInfo().free` 来自 `os.freemem()`，不含文件缓存可回收部分；可用内存比该值大。
> - 本库 `getNetworkInterfaces` 过滤的 `internal` 是 loopback 标记；返回的外部地址多为局域网 IP，不是公网 IP。

## 常见问题

### `getDiskInfo` 抛出 `ENOENT` 或 PowerShell 相关错误

原因：传入的 `path` 不存在，或 Windows 环境没有 `powershell` 可执行文件。修复：先确认路径存在；Windows 环境改用盘符根路径。

```ts
import { existsSync } from '@cat-kit/be'
import { getDiskInfo } from '@cat-kit/be'

async function safeDiskInfo(path: string): Promise<void> {
  if (!existsSync(path)) {
    console.error(`路径不存在：${path}`)
    return
  }
  const disk = await getDiskInfo(path)
  console.log(disk.usedPercent) // => 44.5
}

await safeDiskInfo('./')
```
