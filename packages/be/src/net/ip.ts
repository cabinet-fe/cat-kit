import { networkInterfaces } from 'node:os'

/**
 * 获取本地 IP 地址选项
 */
export interface GetLocalIPOptions {
  /** IP 地址族，默认 'IPv4' */
  family?: 'IPv4' | 'IPv6'
  /** 是否包含内网地址，默认 false（只返回公网地址） */
  includeInternal?: boolean
}

/**
 * 获取本机网卡的首个匹配 IP 地址
 *
 * 遍历所有网络接口，返回第一个匹配条件的 IP 地址。
 *
 * @example
 * ```typescript
 * // 获取公网 IPv4 地址
 * const ip = getLocalIP({ family: 'IPv4' })
 *
 * // 获取包含内网的 IPv6 地址
 * const ip = getLocalIP({ family: 'IPv6', includeInternal: true })
 * ```
 *
 * @param options - 地址族与是否包含内网地址
 * @returns 匹配到的 IP 地址，若不存在则为 `undefined`
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
