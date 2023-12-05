/**
 * 获取JS运行环境
 * @return 运行环境，如果 `window` 对象被定义（表示在浏览器中运行），则返回字符串字面量 `'web'`，
 * 否则返回字符串字面量 `'node'`（表示在 Node.js 环境中运行）。
 */
export function getRuntime(): 'web' | 'node' {
  return typeof window !== 'undefined' ? 'web' : 'node'
}

/**
 * 获取设备类型
 * @returns 设备类型，可能为 'mobile' 或 'desktop'
 */
export function getDeviceType(): 'mobile' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'mobile',
    'ipod',
    'blackberry',
    'windows phone'
  ]

  for (const keyword of mobileKeywords) {
    if (userAgent.includes(keyword)) {
      return 'mobile'
    }
  }

  return 'desktop'
}

type OSType = 'Windows' | 'Mac OS' | 'Linux' | 'Android' | 'iOS'

/**
 * 获取操作系统类型
 * @returns 操作系统类型
 */
export function getOSType(): OSType | 'Unknown' {
  const platform = navigator.platform

  if (platform.includes('Win')) return 'Windows'
  if (platform.includes('Mac')) return 'Mac OS'
  if (platform.includes('Linux')) return 'Linux'
  if (platform.includes('Android')) return 'Android'
  if (platform.includes('iOS')) return 'iOS'
  return 'Unknown'
}
