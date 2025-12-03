import { networkInterfaces } from 'node:os'

export interface GetLocalIPOptions {
  family?: 'IPv4' | 'IPv6'
  includeInternal?: boolean
}

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

