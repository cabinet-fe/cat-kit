# 系统监控

系统监控模块提供了 CPU、内存、磁盘和网络接口等系统资源信息的获取功能。

## CPU 信息

### getCpuInfo

获取 CPU 基本信息，包括型号、核心数、主频和平均负载。

```typescript
import { getCpuInfo } from '@cat-kit/be'

const cpuInfo = getCpuInfo()
console.log(`CPU 型号: ${cpuInfo.model}`)
console.log(`核心数: ${cpuInfo.cores}`)
console.log(`主频: ${cpuInfo.speed}MHz`)
console.log(`平均负载: ${cpuInfo.loadAverage.join(', ')}`)
```

#### API

```typescript
function getCpuInfo(): CpuInfo
```

**返回值：**

```typescript
interface CpuInfo {
  model: string                    // CPU 型号
  cores: number                     // CPU 核心数
  speed: number                     // CPU 主频（MHz）
  loadAverage: [number, number, number] // 1分钟、5分钟、15分钟平均负载
}
```

### getCpuUsage

通过采样获取 CPU 使用率。

```typescript
import { getCpuUsage } from '@cat-kit/be'

// 默认采样 500ms
const usage = await getCpuUsage()
console.log(`CPU 使用率: ${usage.percent.toFixed(2)}%`)
console.log(`用户时间: ${usage.user}ms`)
console.log(`系统时间: ${usage.system}ms`)
console.log(`空闲时间: ${usage.idle}ms`)

// 自定义采样间隔
const usage = await getCpuUsage(1000) // 采样 1 秒
```

#### API

```typescript
function getCpuUsage(interval?: number): Promise<CpuUsage>
```

**参数：**

- `interval` - 采样间隔（毫秒），默认 `500`

**返回值：**

```typescript
interface CpuUsage {
  user: number      // 用户时间（毫秒）
  system: number    // 系统时间（毫秒）
  idle: number      // 空闲时间（毫秒）
  total: number     // 总时间（毫秒）
  percent: number   // CPU 使用率（百分比）
}
```

**工作原理：**

通过两次采样 CPU 时间（间隔 `interval` 毫秒），计算期间 CPU 的使用情况。

## 内存信息

### getMemoryInfo

获取系统内存使用情况。

```typescript
import { getMemoryInfo } from '@cat-kit/be'

const memInfo = getMemoryInfo()
console.log(`总内存: ${(memInfo.total / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`已用内存: ${(memInfo.used / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`空闲内存: ${(memInfo.free / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`使用率: ${memInfo.usedPercent.toFixed(2)}%`)
```

#### API

```typescript
function getMemoryInfo(): MemoryInfo
```

**返回值：**

```typescript
interface MemoryInfo {
  total: number        // 总内存（字节）
  free: number         // 空闲内存（字节）
  used: number         // 已用内存（字节）
  usedPercent: number  // 内存使用率（百分比）
}
```

## 磁盘信息

### getDiskInfo

获取指定路径所在磁盘的容量信息。

```typescript
import { getDiskInfo } from '@cat-kit/be'

// 获取当前工作目录的磁盘信息
const diskInfo = await getDiskInfo()
console.log(`磁盘路径: ${diskInfo.path}`)
console.log(`总容量: ${(diskInfo.total / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`已用: ${(diskInfo.used / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`剩余: ${(diskInfo.free / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`使用率: ${diskInfo.usedPercent.toFixed(2)}%`)

// 指定路径
const diskInfo = await getDiskInfo('/var/log')
```

#### API

```typescript
function getDiskInfo(path?: string): Promise<DiskInfo>
```

**参数：**

- `path` - 目标路径，默认使用 `process.cwd()`

**返回值：**

```typescript
interface DiskInfo {
  path: string         // 磁盘路径
  total: number         // 总容量（字节）
  free: number          // 剩余容量（字节）
  used: number          // 已用容量（字节）
  usedPercent: number   // 使用率（百分比）
}
```

**平台支持：**

- **Unix/Linux/macOS**: 使用 `statfs` 系统调用
- **Windows**: 使用 PowerShell 命令获取磁盘信息

## 网络接口

### getNetworkInterfaces

获取本机所有网络接口信息。

```typescript
import { getNetworkInterfaces } from '@cat-kit/be'

const interfaces = getNetworkInterfaces({ includeInternal: false })

interfaces.forEach(iface => {
  console.log(`接口: ${iface.name}`)
  console.log(`  IP: ${iface.address}`)
  console.log(`  类型: ${iface.family}`)
  console.log(`  MAC: ${iface.mac}`)
  console.log(`  子网掩码: ${iface.netmask}`)
  if (iface.cidr) {
    console.log(`  CIDR: ${iface.cidr}`)
  }
})
```

#### API

```typescript
function getNetworkInterfaces(
  options?: GetNetworkInterfacesOptions
): NetworkInterfaceInfo[]
```

**参数：**

- `options.includeInternal` - 是否包含内部地址，默认 `false`

**返回值：**

```typescript
interface NetworkInterfaceInfo {
  name: string              // 接口名称
  address: string          // IP 地址
  family: 'IPv4' | 'IPv6'  // 地址族
  mac: string              // MAC 地址
  internal: boolean        // 是否为内网地址
  netmask: string          // 子网掩码
  cidr?: string           // CIDR 表示法（如果可用）
}
```

## 使用示例

### 系统健康检查

```typescript
import {
  getCpuInfo,
  getCpuUsage,
  getMemoryInfo,
  getDiskInfo
} from '@cat-kit/be'

async function healthCheck() {
  // CPU 信息
  const cpuInfo = getCpuInfo()
  const cpuUsage = await getCpuUsage(1000)

  // 内存信息
  const memInfo = getMemoryInfo()

  // 磁盘信息
  const diskInfo = await getDiskInfo()

  return {
    cpu: {
      model: cpuInfo.model,
      cores: cpuInfo.cores,
      usage: cpuUsage.percent,
      loadAverage: cpuInfo.loadAverage
    },
    memory: {
      total: memInfo.total,
      used: memInfo.used,
      usedPercent: memInfo.usedPercent
    },
    disk: {
      path: diskInfo.path,
      total: diskInfo.total,
      used: diskInfo.used,
      usedPercent: diskInfo.usedPercent
    }
  }
}

// 定期检查
setInterval(async () => {
  const health = await healthCheck()
  console.log('系统健康状态:', health)
}, 60000) // 每分钟检查一次
```

### 资源监控告警

```typescript
import { getMemoryInfo, getDiskInfo, getCpuUsage } from '@cat-kit/be'

async function checkResources() {
  const memInfo = getMemoryInfo()
  const diskInfo = await getDiskInfo()
  const cpuUsage = await getCpuUsage()

  // 内存告警
  if (memInfo.usedPercent > 90) {
    console.warn(`内存使用率过高: ${memInfo.usedPercent.toFixed(2)}%`)
  }

  // 磁盘告警
  if (diskInfo.usedPercent > 90) {
    console.warn(`磁盘使用率过高: ${diskInfo.usedPercent.toFixed(2)}%`)
  }

  // CPU 告警
  if (cpuUsage.percent > 90) {
    console.warn(`CPU 使用率过高: ${cpuUsage.percent.toFixed(2)}%`)
  }
}
```

### 性能指标收集

```typescript
import {
  getCpuInfo,
  getCpuUsage,
  getMemoryInfo,
  getDiskInfo
} from '@cat-kit/be'

class MetricsCollector {
  async collect() {
    const [cpuInfo, cpuUsage, memInfo, diskInfo] = await Promise.all([
      Promise.resolve(getCpuInfo()),
      getCpuUsage(1000),
      Promise.resolve(getMemoryInfo()),
      getDiskInfo()
    ])

    return {
      timestamp: Date.now(),
      cpu: {
        model: cpuInfo.model,
        cores: cpuInfo.cores,
        usage: cpuUsage.percent,
        loadAverage: cpuInfo.loadAverage
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        free: memInfo.free,
        usedPercent: memInfo.usedPercent
      },
      disk: {
        path: diskInfo.path,
        total: diskInfo.total,
        used: diskInfo.used,
        free: diskInfo.free,
        usedPercent: diskInfo.usedPercent
      }
    }
  }

  async start(interval = 60000) {
    setInterval(async () => {
      const metrics = await this.collect()
      // 发送到监控系统
      await this.sendMetrics(metrics)
    }, interval)
  }

  private async sendMetrics(metrics: any) {
    // 发送到监控系统
    console.log('发送指标:', metrics)
  }
}

const collector = new MetricsCollector()
collector.start()
```

### 磁盘空间检查

```typescript
import { getDiskInfo } from '@cat-kit/be'

async function checkDiskSpace(path: string, threshold = 0.9) {
  const diskInfo = await getDiskInfo(path)

  if (diskInfo.usedPercent / 100 > threshold) {
    throw new Error(
      `磁盘空间不足: ${diskInfo.usedPercent.toFixed(2)}% 已使用，` +
      `剩余 ${(diskInfo.free / 1024 / 1024 / 1024).toFixed(2)}GB`
    )
  }

  return diskInfo
}

// 在写入大文件前检查
await checkDiskSpace('./data', 0.8)
```

