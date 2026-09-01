//#region src/data/any.d.ts
/**
 * 深拷贝任意值。
 *
 * 优先使用 native `structuredClone`；Vue 响应式、环境不支持或抛错时走图遍历回退，不向外抛错。
 *
 * @param value 任意值
 * @returns 拷贝后的快照（原始值与函数原样返回）
 */
declare function copy<T>(value: T): T;
//#endregion
export { copy };