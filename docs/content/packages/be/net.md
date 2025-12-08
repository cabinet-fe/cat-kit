# 网络工具

网络工具模块提供了网络相关的实用工具函数，帮助你检查端口可用性、获取本机 IP 地址和网络接口信息。

## 概述

网络工具模块包含以下功能：

- **端口检查** - 检查指定端口是否可用
- **IP 地址获取** - 获取本机 IP 地址
- **网络接口信息** - 获取本机所有网络接口信息

## 端口检查

### isPortAvailable

检查指定端口是否可用（未被占用）。通过尝试在该端口创建临时服务器来判断端口是否可用。

**适用场景：**
- 服务器启动前检查端口
- 动态端口分配
- 端口冲突检测

#### 基本用法

```typescript
import { isPortAvailable } from '@cat-kit/be'

// 检查端口是否可用
const available = await isPortAvailable(3000)
if (available) {
  console.log('端口 3000 可用')
} else {
  console.log('端口 3000 已被占用')
}

// 指定主机和超时时间
const available = await isPortAvailable(3000, {
  host: '0.0.0.0',
  timeout: 2000
})
```

#### API 参考

```typescript
function isPortAvailable(
  port: number,
  options?: PortCheckOptions
): Promise<boolean>
```

**参数说明：**

- `port` - 要检查的端口号
- `options.host` - 主机地址，默认 `'127.0.0.1'`
- `options.timeout` - 超时时间（毫秒），默认 `1000`

**返回值：**

- `Promise<boolean>` - 端口可用返回 `true`，否则返回 `false`

**工作原理：**

通过尝试在该端口创建临时服务器来判断端口是否可用。如果创建成功，说明端口可用；如果失败，说明端口已被占用。

## IP 地址获取

### getLocalIP

获取本机网卡的首个匹配 IP 地址。可以根据地址族（IPv4/IPv6）和是否包含内网地址进行过滤。

**适用场景：**
- 获取服务器地址
- 网络配置检测
- 多网卡环境处理

#### 基本用法

```typescript
import { getLocalIP } from '@cat-kit/be'

// 获取 IPv4 地址（排除内网地址）
const ip = getLocalIP({ family: 'IPv4', includeInternal: false })
console.log('本机 IP:', ip) // 例如: '192.168.1.100'

// 获取 IPv6 地址
const ipv6 = getLocalIP({ family: 'IPv6' })

// 包含内网地址
const allIPs = getLocalIP({ includeInternal: true })
```

#### API 参考

```typescript
function getLocalIP(
  options?: GetLocalIPOptions
): string | undefined
```

**参数说明：**

- `options.family` - 地址族：`'IPv4'` | `'IPv6'`，默认 `'IPv4'`
- `options.includeInternal` - 是否包含内网地址，默认 `false`

**返回值：**

- `string | undefined` - 匹配到的 IP 地址，若不存在则为 `undefined`

**查找顺序：**

1. 遍历所有网络接口
2. 匹配指定的地址族
3. 根据 `includeInternal` 过滤内网地址
4. 返回第一个匹配的地址

**内网地址判断：**

- IPv4: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- IPv6: `::1`, `fe80::/10`, `fc00::/7`

### getNetworkInterfaces

获取本机所有网络接口信息。可以过滤内网接口，返回详细的网络接口信息。

**适用场景：**
- 网络接口监控
- 多网卡环境处理
- 网络配置分析

#### 基本用法

```typescript
import { getNetworkInterfaces } from '@cat-kit/be'

// 获取所有网络接口（排除内网）
const interfaces = getNetworkInterfaces({ includeInternal: false })

interfaces.forEach(iface => {
  console.log(`${iface.name}: ${iface.address} (${iface.family})`)
  console.log(`  MAC: ${iface.mac}`)
  console.log(`  子网掩码: ${iface.netmask}`)
  if (iface.cidr) {
    console.log(`  CIDR: ${iface.cidr}`)
  }
})

// 包含内网接口
const allInterfaces = getNetworkInterfaces({ includeInternal: true })
```

#### API 参考

```typescript
function getNetworkInterfaces(
  options?: GetNetworkInterfacesOptions
): NetworkInterfaceInfo[]
```

**参数说明：**

- `options.includeInternal` - 是否包含内部地址，默认 `false`

**返回值：**

- `NetworkInterfaceInfo[]` - 网络接口信息数组

**接口信息：**

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

### 启动服务器前检查端口

```typescript
import { isPortAvailable } from '@cat-kit/be'

async function startServer(port: number) {
  const available = await isPortAvailable(port)

  if (!available) {
    throw new Error(`端口 ${port} 已被占用`)
  }

  // 启动服务器
  const server = createServer()
  server.listen(port)
  console.log(`服务器已启动在端口 ${port}`)
}
```

### 查找可用端口

```typescript
import { isPortAvailable } from '@cat-kit/be'

async function findAvailablePort(
  startPort: number,
  maxAttempts = 100
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    const available = await isPortAvailable(port)

    if (available) {
      return port
    }
  }

  throw new Error(
    `在 ${startPort}-${startPort + maxAttempts} 范围内未找到可用端口`
  )
}

// 使用
const port = await findAvailablePort(3000)
console.log(`找到可用端口: ${port}`)
```

### 获取服务器地址

```typescript
import { getLocalIP } from '@cat-kit/be'

function getServerAddress(port: number) {
  const ip = getLocalIP({ family: 'IPv4', includeInternal: false })

  if (ip) {
    return `http://${ip}:${port}`
  }

  // 回退到 localhost
  return `http://localhost:${port}`
}

const address = getServerAddress(3000)
console.log(`服务器地址: ${address}`)
```

### 网络接口监控

```typescript
import { getNetworkInterfaces } from '@cat-kit/be'

function monitorNetworkInterfaces() {
  const interfaces = getNetworkInterfaces({ includeInternal: false })

  console.log('网络接口列表:')
  interfaces.forEach(iface => {
    console.log(`  ${iface.name}:`)
    console.log(`    地址: ${iface.address}`)
    console.log(`    类型: ${iface.family}`)
    console.log(`    MAC: ${iface.mac}`)
    console.log(`    子网掩码: ${iface.netmask}`)
  })

  return interfaces
}

// 定期检查网络接口变化
setInterval(() => {
  const current = monitorNetworkInterfaces()
  // 比较变化...
}, 5000)
```

### 多网卡环境处理

```typescript
import { getNetworkInterfaces, getLocalIP } from '@cat-kit/be'

function getPreferredIP() {
  // 优先获取外网 IP
  const externalIP = getLocalIP({ includeInternal: false })
  if (externalIP) {
    return externalIP
  }

  // 回退到内网 IP
  const internalIP = getLocalIP({ includeInternal: true })
  if (internalIP) {
    return internalIP
  }

  // 最后回退到 localhost
  return '127.0.0.1'
}

const ip = getPreferredIP()
console.log(`使用 IP: ${ip}`)
```

### 端口范围扫描

```typescript
import { isPortAvailable } from '@cat-kit/be'

async function scanPorts(startPort: number, endPort: number) {
  const availablePorts: number[] = []
  const usedPorts: number[] = []

  for (let port = startPort; port <= endPort; port++) {
    const available = await isPortAvailable(port)
    if (available) {
      availablePorts.push(port)
    } else {
      usedPorts.push(port)
    }
  }

  return { availablePorts, usedPorts }
}

// 扫描 3000-3010 端口
const result = await scanPorts(3000, 3010)
console.log('可用端口:', result.availablePorts)
console.log('已用端口:', result.usedPorts)
```

### 网络接口详细信息

```typescript
import { getNetworkInterfaces } from '@cat-kit/be'

function getNetworkDetails() {
  const interfaces = getNetworkInterfaces({ includeInternal: true })

  return interfaces.map(iface => ({
    name: iface.name,
    address: iface.address,
    family: iface.family,
    mac: iface.mac,
    isInternal: iface.internal,
    netmask: iface.netmask,
    cidr: iface.cidr,
    // 计算网络地址
    network: calculateNetwork(iface.address, iface.netmask)
  }))
}

function calculateNetwork(ip: string, netmask: string): string {
  // 简化的网络地址计算
  // 实际实现需要使用 IP 地址库
  return `${ip}/${netmask}`
}
```

## 最佳实践

1. **端口检查超时**：设置合理的超时时间，避免长时间等待
2. **错误处理**：处理端口检查可能出现的网络错误
3. **多网卡环境**：根据实际需求选择合适的 IP 地址获取策略
4. **内网地址过滤**：在生产环境中通常排除内网地址，只获取公网 IP
5. **端口范围**：避免扫描过大的端口范围，可能影响性能
6. **缓存结果**：对于不经常变化的网络接口信息，可以缓存结果
