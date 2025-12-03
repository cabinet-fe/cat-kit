import { networkInterfaces } from 'node:os'

export interface NetworkInterfaceInfo {
  name: string
  address: string
  family: 'IPv4' | 'IPv6'
  mac: string
  internal: boolean
  netmask: string
  cidr?: string
}

export interface GetNetworkInterfacesOptions {
  includeInternal?: boolean
}

/**
 * 获取本机网络接口信息
 * @param options - 控制是否包含内部地址
 * @returns 网络接口列表
 */
export function getNetworkInterfaces(
  options: GetNetworkInterfacesOptions = {}
): NetworkInterfaceInfo[] {
  const { includeInternal = false } = options
  const interfaces = networkInterfaces()
  const result: NetworkInterfaceInfo[] = []

  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses) continue
    for (const address of addresses) {
      const family = address.family === 'IPv6' ? 'IPv6' : 'IPv4'
      if (!includeInternal && address.internal) continue

      result.push({
        name,
        address: address.address,
        family,
        mac: address.mac,
        internal: address.internal,
        netmask: address.netmask,
        cidr: address.cidr ?? undefined
      })
    }
  }

  return result
}
