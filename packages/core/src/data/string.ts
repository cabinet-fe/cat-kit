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
  camelCase(type: 'lower' | 'upper' = 'lower') {
    const camelStr = this.raw.replace(/(?:^|[-_])(\w)/g, (_, letter) =>
      letter.toUpperCase()
    )

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
  kebabCase() {
    return this.raw.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}

/**
 * 创建一个字符串操作对象
 * @param str 需要操作的字符串
 * @returns 字符串操作对象
 * @example
 * ```ts
 * const str = str('hello-world')
 * str.camelCase() // 'helloWorld'
 * str.kebabCase() // 'hello-world'
 * ```
 */
export function str(str: string) {
  return new CatString(str)
}

/**
 * Url路径拼接，第一个路径支持带协议的路径
 * @param firstPath 第一个路径
 * @param paths 其他路径
 * @returns 拼接后的完整URL路径
 * @example
 * ```ts
 * str.joinUrlPath('https://example.com', 'path', 'to', 'resource') // 'https://example.com/path/to/resource'
 * str.joinUrlPath('path/to/resource', 'https://example.com') // throw Error('只有第一个路径支持带协议的路径')
 * str.joinUrlPath('a/', 'b/', 'c') // 'a/b/c'
 * str.joinUrlPath('a/', 'b/', 'c/') // 'a/b/c/'
 * ```
 */
str.joinUrlPath = function (firstPath: string, ...paths: string[]) {
  // 处理带协议的情况
  const hasProtocol = /^(https?|ftp|file):\/\//.test(firstPath)

  if (hasProtocol) {
    // 分离协议和路径部分
    const [protocol, hostname] = firstPath.split('://') as [string, string]
    const normalizedFirstPath = hostname.replace(/\/+$/, '') // 移除尾部多余斜杠
    const joinedPaths = [normalizedFirstPath, ...paths]
      .join('/')
      .replace(/\/+/g, '/') // 替换连续斜杠

    return `${protocol}://${joinedPaths}`
  } else {
    // 不带协议的简单路径拼接
    const joinedPaths = [firstPath, ...paths].join('/').replace(/\/+/g, '/') // 替换连续斜杠

    // 保留尾部斜杠（如果原始路径最后一个参数有尾部斜杠）
    if (paths.length > 0 && paths[paths.length - 1]!.endsWith('/')) {
      return joinedPaths.endsWith('/') ? joinedPaths : `${joinedPaths}/`
    }

    return joinedPaths
  }
}
