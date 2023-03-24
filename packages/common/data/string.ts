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
