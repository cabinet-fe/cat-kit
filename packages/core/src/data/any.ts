/**
 * Node / Bun 的 `util.types.isProxy`。浏览器无法可靠探测 Proxy，保持 undefined。
 */
const nativeIsProxy = resolveNativeIsProxy()

function resolveNativeIsProxy(): ((value: unknown) => boolean) | undefined {
  try {
    const fn = (
      globalThis as typeof globalThis & {
        process?: {
          getBuiltinModule?: (id: string) => { types?: { isProxy?: (value: unknown) => boolean } }
        }
      }
    ).process?.getBuiltinModule?.('node:util')?.types?.isProxy
    return typeof fn === 'function' ? fn : undefined
  } catch {
    return undefined
  }
}

function isProxy(value: object): boolean {
  return nativeIsProxy !== undefined && nativeIsProxy(value)
}

/**
 * 深拷贝任意值。
 *
 * 优先 native `structuredClone`。Proxy（Vue 3 响应式也是 Proxy）不能结构化克隆：
 * 能探测到则直接图遍历，否则捕获抛错再回退。不向外抛错。
 *
 * @param value 任意值
 * @returns 拷贝后的快照（原始值与函数原样返回）
 */
export function copy<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (isProxy(value)) {
    return cloneGraph(value, new WeakMap())
  }

  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(value)
    } catch {
      return cloneGraph(value, new WeakMap())
    }
  }

  return cloneGraph(value, new WeakMap())
}

function cloneGraph<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  const cached = seen.get(value)
  if (cached !== undefined) {
    return cached as T
  }

  if (keepIdentity(value)) {
    return value
  }

  if (value instanceof Date) {
    const cloned = new Date(value.getTime())
    seen.set(value, cloned)
    return cloned as T
  }

  if (value instanceof RegExp) {
    const cloned = new RegExp(value.source, value.flags)
    cloned.lastIndex = value.lastIndex
    seen.set(value, cloned)
    return cloned as T
  }

  if (value instanceof ArrayBuffer) {
    const cloned = value.slice(0)
    seen.set(value, cloned)
    return cloned as T
  }

  if (ArrayBuffer.isView(value)) {
    return cloneBufferView(value, seen) as T
  }

  if (value instanceof Map) {
    const cloned = new Map()
    seen.set(value, cloned)
    for (const [k, v] of value) {
      cloned.set(cloneGraph(k, seen), cloneGraph(v, seen))
    }
    return cloned as T
  }

  if (value instanceof Set) {
    const cloned = new Set()
    seen.set(value, cloned)
    for (const item of value) {
      cloned.add(cloneGraph(item, seen))
    }
    return cloned as T
  }

  if (Array.isArray(value)) {
    const cloned: unknown[] = []
    cloned.length = value.length
    seen.set(value, cloned)
    copyEnumerable(value, cloned, seen)
    return cloned as T
  }

  const cloned: Record<PropertyKey, unknown> = {}
  seen.set(value, cloned)
  copyEnumerable(value, cloned, seen)
  return cloned as T
}

/** Blob / Promise 等没有可遍历的数据语义，回退时保留原引用。 */
function keepIdentity(value: object): boolean {
  return (
    value instanceof Promise ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    value instanceof Error ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof FormData !== 'undefined' && value instanceof FormData) ||
    (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer)
  )
}

function cloneBufferView(value: ArrayBufferView, seen: WeakMap<object, unknown>): ArrayBufferView {
  const buffer = cloneGraph(value.buffer, seen) as ArrayBufferLike

  if (value instanceof DataView) {
    const cloned = new DataView(buffer as ArrayBuffer, value.byteOffset, value.byteLength)
    seen.set(value, cloned)
    return cloned
  }

  const Ctor = value.constructor as new (
    buffer: ArrayBufferLike,
    byteOffset: number,
    length: number
  ) => ArrayBufferView
  const elementSize = (value as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1
  const cloned = new Ctor(buffer, value.byteOffset, value.byteLength / elementSize)
  seen.set(value, cloned)
  return cloned
}

function copyEnumerable(source: object, target: object, seen: WeakMap<object, unknown>): void {
  for (const key of Reflect.ownKeys(source)) {
    if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue
    ;(target as Record<PropertyKey, unknown>)[key] = cloneGraph(
      (source as Record<PropertyKey, unknown>)[key],
      seen
    )
  }
}
