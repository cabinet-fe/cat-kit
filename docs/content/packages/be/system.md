# 系统监控

## 介绍

本页介绍 `@cat-kit/be` 的系统信息采集能力，覆盖 CPU、内存、磁盘与网络接口。

## 快速使用

```typescript
import { getCpuUsage, getMemoryInfo, getDiskInfo, getNetworkInterfaces } from '@cat-kit/be'

const cpu = await getCpuUsage()
const memory = await getMemoryInfo()
const disk = await getDiskInfo()
const nics = getNetworkInterfaces()

console.log({ cpu, memory, disk, nics })
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

系统监控模块包含以下功能：

- **CPU 信息** - 获取 CPU 基本信息和使用率
- **内存信息** - 获取内存使用情况
- **磁盘信息** - 获取磁盘使用情况
- **网络接口** - 获取网络接口信息

**主要特性：**

- ✅ 跨平台支持（Windows、Linux、macOS）
- ✅ 实时资源监控
- ✅ 详细的资源信息
- ✅ 易于集成到监控系统

## CPU 信息

### getCpuInfo

获取 CPU 基本信息，包括型号、核心数、主频和平均负载。这些信息是静态的，不会随时间变化。

**适用场景：**
- 系统信息展示
- 性能基准测试
- 资源规划

#### 基本用法

```typescript
import { getCpuInfo } from '@cat-kit/be'

const cpuInfo = getCpuInfo()
console.log(`CPU 型号: ${cpuInfo.model}`)
console.log(`核心数: ${cpuInfo.cores}`)
console.log(`主频: ${cpuInfo.speed}MHz`)
console.log(`平均负载: ${cpuInfo.loadAverage.join(', ')}`)
```

#### API参考

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

**平均负载说明：**

平均负载表示系统在特定时间间隔内的平均活跃进程数。三个值分别表示：
- 第 1 个值：过去 1 分钟的平均负载
- 第 2 个值：过去 5 分钟的平均负载
- 第 3 个值：过去 15 分钟的平均负载

### getCpuUsage

通过采样获取 CPU 使用率。需要指定采样间隔，通过两次采样计算期间 CPU 的使用情况。

**适用场景：**
- 实时 CPU 监控
- 性能分析
- 资源告警

#### 基本用法

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

#### API参考

```typescript
function getCpuUsage(interval?: number): Promise<CpuUsage>
```

**参数说明：**

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

通过两次采样 CPU 时间（间隔 `interval` 毫秒），计算期间 CPU 的使用情况。使用率计算公式：`(total - idle) / total * 100`

## 内存信息

### getMemoryInfo

获取系统内存使用情况。返回总内存、已用内存、空闲内存和使用率。

**适用场景：**
- 内存监控
- 内存告警
- 资源规划

#### 基本用法

```typescript
import { getMemoryInfo } from '@cat-kit/be'

const memInfo = getMemoryInfo()
console.log(`总内存: ${(memInfo.total / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`已用内存: ${(memInfo.used / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`空闲内存: ${(memInfo.free / 1024 / 1024 / 1024).toFixed(2)}GB`)
console.log(`使用率: ${memInfo.usedPercent.toFixed(2)}%`)
```

#### API参考

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

获取指定路径所在磁盘的容量信息。可以指定任意路径，函数会返回该路径所在磁盘的信息。

**适用场景：**
- 磁盘空间监控
- 磁盘告警
- 存储容量规划

#### 基本用法

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

#### API参考

```typescript
function getDiskInfo(path?: string): Promise<DiskInfo>
```

**参数说明：**

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

获取本机所有网络接口信息。可以过滤内网接口，返回详细的网络接口信息。

**适用场景：**
- 网络接口监控
- 多网卡环境处理
- 网络配置分析

#### 基本用法

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

#### API参考

```typescript
function getNetworkInterfaces(
  options?: GetNetworkInterfacesOptions
): NetworkInterfaceInfo[]
```

**参数说明：**

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

  const alerts: string[] = []

  // 内存告警
  if (memInfo.usedPercent > 90) {
    alerts.push(`内存使用率过高: ${memInfo.usedPercent.toFixed(2)}%`)
  }

  // 磁盘告警
  if (diskInfo.usedPercent > 90) {
    alerts.push(`磁盘使用率过高: ${diskInfo.usedPercent.toFixed(2)}%`)
  }

  // CPU 告警
  if (cpuUsage.percent > 90) {
    alerts.push(`CPU 使用率过高: ${cpuUsage.percent.toFixed(2)}%`)
  }

  if (alerts.length > 0) {
    await sendAlerts(alerts)
  }

  return alerts
}

async function sendAlerts(alerts: string[]) {
  // 发送告警通知
  console.warn('资源告警:', alerts)
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
    // 发送到监控系统（如 Prometheus、InfluxDB 等）
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

### 资源使用趋势分析

```typescript
import { getCpuUsage, getMemoryInfo } from '@cat-kit/be'

class ResourceTrendAnalyzer {
  private history: Array<{
    timestamp: number
    cpu: number
    memory: number
  }> = []

  async record() {
    const [cpuUsage, memInfo] = await Promise.all([
      getCpuUsage(),
      Promise.resolve(getMemoryInfo())
    ])

    this.history.push({
      timestamp: Date.now(),
      cpu: cpuUsage.percent,
      memory: memInfo.usedPercent
    })

    // 只保留最近 1 小时的数据
    const oneHourAgo = Date.now() - 3600000
    this.history = this.history.filter(
      entry => entry.timestamp > oneHourAgo
    )
  }

  getAverageUsage() {
    if (this.history.length === 0) {
      return { cpu: 0, memory: 0 }
    }

    const sum = this.history.reduce(
      (acc, entry) => ({
        cpu: acc.cpu + entry.cpu,
        memory: acc.memory + entry.memory
      }),
      { cpu: 0, memory: 0 }
    )

    return {
      cpu: sum.cpu / this.history.length,
      memory: sum.memory / this.history.length
    }
  }

  start(interval = 60000) {
    setInterval(() => {
      this.record()
    }, interval)
  }
}

const analyzer = new ResourceTrendAnalyzer()
analyzer.start()

// 定期查看平均使用率
setInterval(() => {
  const avg = analyzer.getAverageUsage()
  console.log('平均使用率:', avg)
}, 300000) // 每 5 分钟
```

## 最佳实践

1. **采样间隔**：`getCpuUsage` 的采样间隔不宜过短，建议至少 500ms
2. **定期监控**：定期收集系统资源信息，但不要过于频繁，避免影响性能
3. **告警阈值**：设置合理的告警阈值，避免误报
4. **错误处理**：处理可能出现的系统调用错误
5. **数据持久化**：将监控数据持久化，便于历史分析和趋势预测
6. **资源清理**：及时清理历史数据，避免内存占用过大
