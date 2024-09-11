/**
 *
 */
export class EmbeddedWorker<Ctx extends Record<string, any>> {
  #worker?: Worker

  #fnString = ''

  #ctx?: Ctx

  /**
   * 嵌入式工作线程
   * @param deps 依赖
   */
  constructor(deps?: {
    /** 普通变量上下文 */
    ctx?: Ctx
    /**  fns 函数集合 */
    fns?: Record<string, Function>
  }) {
    if (!deps) return
    const { ctx, fns } = deps
    this.#ctx = ctx

    if (fns) {
      this.#fnString = Object.entries(fns).reduce((acc, cur) => {
        const [name, fn] = cur
        return acc + `const ${name} = ${fn.toString()};`
      }, '')
    }
  }

  async run(fn: (ctx: Ctx) => any) {
    return new Promise(rs => {
      const scriptString = `
      ${this.#fnString}
      // 在这里执行fn代码
      onmessage = async function (e) {
       const result = await (${fn})(e.data)
       postMessage(result)
      }
      `

      const blob = new Blob([scriptString], {
        type: 'text/javascript'
      })
      this.#worker = new Worker(URL.createObjectURL(blob))
      this.#worker.addEventListener('message', e => {
        rs(e.data)
      })

      this.#worker.postMessage(this.#ctx)
    })
  }

  terminate() {
    this.#worker?.terminate()
  }
}
