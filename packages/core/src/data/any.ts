import { getDataType } from './type'

/**
 * Vue 2/3 响应式标记。必须走属性读取：Vue 3 把 `__v_*` 放在 Proxy get trap 里，
 * `in` / `hasOwn` 看不到，否则会落到 structuredClone 抛错再回退。
 */
function hasVueMarker(value: object): boolean {
  const obj = value as Record<string, unknown>
  return (
    obj.__v_raw != null ||
    obj.__v_isReactive === true ||
    obj.__v_isReadonly === true ||
    obj.__ob__ != null
  )
}

/**
 * 深拷贝任意值。
 *
 * 优先使用 native `structuredClone`；Vue 响应式、环境不支持或抛错时走图遍历回退，不向外抛错。
 *
 * @param value 任意值
 * @returns 拷贝后的快照（原始值与函数原样返回）
 */
export function copy<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (hasVueMarker(value)) {
    return cloneFallback(value, new WeakMap())
  }

  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(value)
    } catch {
      return cloneFallback(value, new WeakMap())
    }
  }

  return cloneFallback(value, new WeakMap())
}

function cloneFallback<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  const existing = seen.get(value)
  if (existing !== undefined) {
    return existing as T
  }

  const type = getDataType(value)

  if (
    type === 'blob' ||
    type === 'file' ||
    type === 'formdata' ||
    type === 'promise' ||
    type === 'error' ||
    type === 'weakmap' ||
    type === 'weakset' ||
    type === 'sharedarraybuffer'
  ) {
    return value
  }

  if (type === 'date') {
    const cloned = new Date((value as Date).getTime())
    seen.set(value, cloned)
    return cloned as T
  }

  if (type === 'regexp') {
    const source = value as RegExp
    const cloned = new RegExp(source.source, source.flags)
    cloned.lastIndex = source.lastIndex
    seen.set(value, cloned)
    return cloned as T
  }

  if (type === 'arraybuffer') {
    const cloned = (value as ArrayBuffer).slice(0)
    seen.set(value, cloned)
    return cloned as T
  }

  if (type === 'dataview' || ArrayBuffer.isView(value)) {
    return cloneBufferView(value as ArrayBufferView, seen) as T
  }

  if (type === 'map') {
    const cloned = new Map()
    seen.set(value, cloned)
    for (const [k, v] of value as Map<unknown, unknown>) {
      cloned.set(cloneFallback(k, seen), cloneFallback(v, seen))
    }
    return cloned as T
  }

  if (type === 'set') {
    const cloned = new Set()
    seen.set(value, cloned)
    for (const item of value as Set<unknown>) {
      cloned.add(cloneFallback(item, seen))
    }
    return cloned as T
  }

  if (type === 'array') {
    const source = value as unknown[]
    const cloned: unknown[] = []
    cloned.length = source.length
    seen.set(value, cloned)
    assignEnumerable(source, cloned, seen)
    return cloned as T
  }

  const cloned: Record<PropertyKey, unknown> = {}
  seen.set(value, cloned)
  assignEnumerable(value, cloned, seen)
  return cloned as T
}

function cloneBufferView(value: ArrayBufferView, seen: WeakMap<object, unknown>): ArrayBufferView {
  const buffer = cloneFallback(value.buffer, seen) as ArrayBufferLike

  if (value instanceof DataView) {
    const cloned = new DataView(buffer as ArrayBuffer, value.byteOffset, value.byteLength)
    seen.set(value, cloned)
    return cloned
  }

  const Ctor = value.constructor as new (
    buffer: ArrayBufferLike,
    byteOffset?: number,
    length?: number
  ) => ArrayBufferView
  const bytesPer = 'BYTES_PER_ELEMENT' in value ? Number(value.BYTES_PER_ELEMENT) : 1
  const cloned = new Ctor(buffer, value.byteOffset, value.byteLength / bytesPer)
  seen.set(value, cloned)
  return cloned
}

function assignEnumerable(source: object, target: object, seen: WeakMap<object, unknown>): void {
  for (const key of Reflect.ownKeys(source)) {
    const desc = Object.getOwnPropertyDescriptor(source, key)
    if (!desc?.enumerable) continue
    ;(target as Record<PropertyKey, unknown>)[key] = cloneFallback(
      (source as Record<PropertyKey, unknown>)[key],
      seen
    )
  }
}
