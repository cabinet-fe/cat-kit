class CatString {
  private raw: string

  constructor(str: string) {
    this.raw = str
  }

  /**
   * 将字符串转换为驼峰命名
   * @param type 驼峰类型：'lower'为小驼峰(lowerCamelCase)，'upper'为大驼峰(UpperCamelCase)
   * @returns 驼峰命名后的字符串
   * @example
   * ```ts
   * str('hello-world').camelCase() // 'helloWorld'
   * str('hello-world').camelCase('upper') // 'HelloWorld'
   * ```
   */
  camelCase(type: 'lower' | 'upper' = 'lower'): string {
    const camelStr = this.raw.replace(/(?:^|[-_])(\w)/g, (_, letter) => letter.toUpperCase())

    if (type === 'lower') {
      // 小驼峰：第一个字符小写
      return camelStr.charAt(0).toLowerCase() + camelStr.slice(1)
    }

    // 大驼峰：保持第一个字符大写
    return camelStr
  }

  /**
   * 将字符串转换为连字符命名(kebab-case)
   * @returns 连字符命名后的字符串
   * @example
   * ```ts
   * str('helloWorld').kebabCase() // 'hello-world'
   * ```
   */
  kebabCase(): string {
    return this.raw.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}

/**
 * 创建一个字符串操作对象
 * @param str 需要操作的字符串
 * @returns 字符串操作对象
 * @example
 * ```ts
 * const s = str('hello-world')
 * s.camelCase() // 'helloWorld'
 * s.kebabCase() // 'hello-world'
 * ```
 */
export function str(str: string): CatString {
  return new CatString(str)
}

export const $str = {
  /**
   * 拼接URL路径
   * @param firstPath 第一个路径
   * @param paths 需要拼接的路径
   * @returns 拼接后的路径
   * @example
   * ```ts
   * $str.joinUrlPath('https://example.com', 'path', 'to', 'resource') // 'https://example.com/path/to/resource'
   * ```
   */
  joinUrlPath(firstPath: string, ...paths: string[]): string {
    const filteredPaths = paths.filter((p) => p !== '')
    const hasProtocol = /^(https?|ftp|file):\/\//.test(firstPath)

    if (hasProtocol) {
      const [protocol, hostname] = firstPath.split('://') as [string, string]
      const normalizedFirstPath = hostname.replace(/\/+$/, '')
      const joinedPaths = [normalizedFirstPath, ...filteredPaths]
        .join('/')
        .replace(/\/+/g, '/')

      return `${protocol}://${joinedPaths}`
    }

    if (firstPath === '' && filteredPaths.length === 0) {
      return ''
    }

    const joinedPaths = [firstPath, ...filteredPaths].join('/').replace(/\/+/g, '/')

    if (paths.length > 0 && paths[paths.length - 1]!.endsWith('/')) {
      return joinedPaths.endsWith('/') ? joinedPaths : `${joinedPaths}/`
    }

    return joinedPaths
  }
}
