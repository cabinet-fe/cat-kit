/**
 * 深度优先遍历树结构，并对每个节点执行回调函数。
 * @param data - 树结构的根节点。
 * @param cb - 回调函数，接收当前节点作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
 * @param childrenKey - 子节点的键名。
 */
export function dft<T extends Record<string, any>>(
  data: T,
  cb: (item: T) => boolean | void,
  childrenKey = 'children'
) {
  if (cb(data) === false) return

  let children = data[childrenKey]
  if (children) {
    let i = 0
    while (i < children.length) {
      dft(children[i], cb, childrenKey)
      i++
    }
  }
}

/**
 * 深度优先遍历树结构，并对每个节点执行回调函数。
 * @param data - 树结构的根节点。
 * @param cb - 回调函数，接收当前节点和当前节点路径作为参数，返回值为布尔值或无返回值, 当返回值为false时停止遍历。
 * @param childrenKey - 子节点的键名。
 * @param nodePath - 当前节点路径。
 */
export function dftWithPath<T extends Record<string, any>>(
  data: T,
  cb: (item: T, nodePath: T[]) => boolean | void,
  childrenKey = 'children',
  nodePath: T[] = []
) {
  nodePath = [...nodePath, data]
  if (cb(data, nodePath) === false) return
  let children = data[childrenKey]

  if (children) {
    let i = 0
    while (i < children.length) {
      const child = children[i]
      dftWithPath(child, cb, childrenKey, nodePath)
      i++
    }
  }
}

/**
 * 广度优先遍历树结构
 * @param root - 根节点
 * @param cb - 遍历回调函数，返回值为false时中断遍历
 * @param childrenKey - 子节点属性名，默认为'children'
 */
export function bft<T extends Record<string, any>>(
  root: T,
  cb: (item: T) => void | boolean,
  childrenKey = 'children'
): void {
  let queue: T[] = []

  queue.push(root)

  while (queue.length > 0) {
    const node = queue.shift()!
    if (cb(node) === false) break

    let children = node[childrenKey]
    if (!!children) {
      queue = queue.concat(children)
    }
  }
}

/**
 * 完全碾平
 * @param nodes 节点
 * @param childrenKey 子节点字段
 * @param result 一个用于递归传递的结果，99.9999%的情况不需要你去调用它
 * @returns
 */
export function flat<T extends Record<string, any>>(
  nodes: T[],
  childrenKey = 'children',
  result: T[] = []
): T[] {
  nodes.forEach(node => {
    result.push(node)
    const children = node[childrenKey]
    if (children) {
      result.push(...flat(children, childrenKey, result))
    }
  })
  return result
}
