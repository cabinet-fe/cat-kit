/**
 * 深度优先遍历
 * @param data 一个可以被描述为树形的数据结构
 * @param cb 遍历时的回调
 * @param childrenKey 子节点的key
 */
export function dft<T extends Record<string, any>>(
  data: T,
  cb: (item: T) => boolean | void,
  childrenKey: string
) {
  if (cb(data) === false) return false

  let children = data[childrenKey]
  if (children) {
    let i = 0
    while (i < children.length) {
      if (dft(children[i], cb, childrenKey)) break
      i++
    }
  }
}

/**
 * 广度优先遍历
 * @param data 一个可以被描述为树形的数据结构
 * @param cb 遍历时的回调, 当回调返回一个false时跳出当前循环
 * @param childrenKey 子节点的key
 */
export function bft<T extends Record<string, any>>(
  root: T,
  cb: (item: T) => void | boolean,
  childrenKey = 'children'
) {
  const queue: T[] = []

  queue.push(root)

  while (queue.length > 0) {
    const node = queue.shift()!
    if (cb(node) === false) break

    let children = node[childrenKey]
    if (!!children) {
      let i = 0
      while (i < children.length) {
        queue.push(children[i])
        i++
      }
    }
  }
}
