/**
 * 中划线字符串转驼峰
 * @param str 原字符串
 * @param type 驼峰类型lower小驼峰, upper大驼峰, 默认lower
 * @returns
 */
export function camelCase(
  str: string,
  type: 'lower' | 'upper' = 'lower'
): string {
  if (str.length === 0) return str
  let firstChar = str[0]!
  if (type === 'upper') {
    firstChar = firstChar.toUpperCase()
  }
  return (
    firstChar +
    str.substring(1).replace(/-[a-z]/g, s => s.substring(1).toUpperCase())
  )
}

/**
 * 将驼峰格式的字符串转化为中划线连接的字符串
 * @param str 原字符串
 */
export function kebabCase(str: string): string {
  if (str.startsWith('-')) {
    console.error('字符串不是驼峰格式的!')
    return str
  }
  const ret = str.replace(/[A-Z]/g, s => '-' + s.toLowerCase())
  return ret.startsWith('-') ? ret.substring(1) : ret
}

class Str {
  #str: string

  constructor(s: string) {
    this.#str = s
  }

  /**
   * 中划线字符串转驼峰
   * @param type 驼峰类型lower小驼峰, upper大驼峰, 默认lower
   * @returns
   */
  camelCase(type: 'upper' | 'lower' = 'lower'): string {
    return camelCase(this.#str, type)
  }

  /**
   * 将驼峰格式的字符串转化为中划线连接的字符串
   * @returns
   */
  kebabCase(): string {
    return kebabCase(this.#str)
  }
}

export function str(str: string): Str {
  return new Str(str)
}

/**
 * 拼接路径字符串，通常用于防止拼接的路径出现重复的'/'
 * @param firstPath 路径字符串, 也可以是一个有效的URL地址
 * @param paths 待拼接的其他路径字符串
 * @returns 拼接后的路径
 *
 * @example
 * ```ts
 * str.joinPath('/a/', '/b', '/c') // '/a/b/c'
 * str.joinPath('/a/', '/b', '/c/') // '/a/b/c/'
 * str.joinPath('a/', '/b', '/c/') // '/a/b/c/'
 * ```
 */
str.joinPath = function joinPath(
  firstPath: string,
  ...paths: string[]
): string {
  const secondPath = paths
    .filter(p => !!p)
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/^\//, '')

  // URL协议需要验证URL的合法性
  if (/^(https?|ftp|file):\/\//.test(firstPath)) {
    const origin = firstPath.replace(/:\/*$/, '://')
    if (origin.endsWith('//') || !origin.includes('.')) {
      throw new Error(`无效的URL:${origin}`)
    }
    return `${origin.replace(/\/+$/, '')}/${secondPath}`
  }

  return `${firstPath.replace(/\/+$/, '')}/${secondPath}`
}
