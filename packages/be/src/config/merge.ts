import { isObj } from '@cat-kit/core/src'

type Mergeable = Record<string, any>

function isPlainObject(value: unknown): value is Mergeable {
  if (!isObj(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function deepMerge(target: Mergeable, source: Mergeable): Mergeable {
  const result = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const existing = result[key]

    if (Array.isArray(value)) {
      result[key] = value.slice()
      continue
    }

    if (isPlainObject(value) && isPlainObject(existing)) {
      result[key] = deepMerge(existing, value)
      continue
    }

    if (isPlainObject(value) && !existing) {
      result[key] = deepMerge({}, value)
      continue
    }

    result[key] = value
  }

  return result
}

/**
 * 深度合并多个配置对象
 * @param configs - 待合并的配置集合
 * @returns 合并后的新对象
 */
export function mergeConfig<T extends Mergeable>(
  ...configs: Array<Partial<T>>
): T {
  return configs.reduce<Mergeable>(
    (acc, config) => (config ? deepMerge(acc, config) : acc),
    {}
  ) as T
}
