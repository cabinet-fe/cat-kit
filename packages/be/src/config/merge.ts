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
 *
 * 数组会被直接替换，对象会递归合并。返回新对象，不会修改原始对象。
 *
 * @example
 * ```typescript
 * const merged = mergeConfig(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 *
 * @param configs - 待合并的配置对象集合，后面的会覆盖前面的
 * @returns 合并后的新对象
 * @template T 配置对象类型
 */
export function mergeConfig<T extends Mergeable>(
  ...configs: Array<Partial<T>>
): T {
  return configs.reduce<Mergeable>(
    (acc, config) => (config ? deepMerge(acc, config) : acc),
    {}
  ) as T
}
