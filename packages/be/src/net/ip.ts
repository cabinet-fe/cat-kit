import { networkInterfaces } from 'node:os'

export interface GetLocalIPOptions {
  family?: 'IPv4' | 'IPv6'
  includeInternal?: boolean
}

/**
 * 获取本机网卡的首个匹配 IP
 * @param options - 地址族与是否包含内网地址
 * @returns 匹配到的 IP，若不存在则为 undefined
 */
export function getLocalIP(
  options: GetLocalIPOptions = {}
): string | undefined {
  const { family = 'IPv4', includeInternal = false } = options
  const interfaces = networkInterfaces()

  for (const addresses of Object.values(interfaces)) {
    if (!addresses) continue
    for (const address of addresses) {
      if (!address.family || address.family !== family) continue
      if (!includeInternal && address.internal) continue
      if (!address.address) continue
      return address.address
    }
  }

  return undefined
}
