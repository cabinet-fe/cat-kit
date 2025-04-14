/**
 * 属性处理器接口
 */
export interface PropHandler {
  /** 要观察的属性名数组 */
  params: string[]
  /** 属性变化时的回调函数 */
  callback: (state: any) => void | Promise<void>
  /** 是否同步执行回调 */
  sync?: boolean
  /** 是否只执行一次 */
  once?: boolean
}

/**
 * 观察选项接口
 */
export interface ObserveOptions {
  /** 是否立即执行一次回调 */
  immediate?: boolean
  /** 是否只执行一次 */
  once?: boolean
  /** 是否同步执行回调 */
  sync?: boolean
}

/**
 * 可观察对象类
 * 用于创建可被观察的状态对象
 */
export class Observable<S extends object, K extends keyof S> {
  /** 可观察的状态对象 */
  readonly state: S

  /** 属性处理器映射 */
  private propsHandlers: Map<string | symbol | number, Set<PropHandler>> =
    new Map()

  /** 是否正在等待微任务执行 */
  private waitingMicrotask = false

  /** 微任务集合 */
  private microtasks: Set<PropHandler> = new Set()

  /** 是否暂停观察 */
  private paused = false

  /**
   * 构造函数
   * @param data 初始状态对象
   */
  constructor(data: S) {
    this.state = new Proxy(data, {
      set: (target, prop, value) => {
        const oldValue = Reflect.get(target, prop)
        if (oldValue === value) return true

        const ret = Reflect.set(target, prop, value)

        ret && !this.paused && this.trigger(prop)

        return ret
      }
    })
  }

  /**
   * 执行微任务
   */
  private async runMicrotasks() {
    try {
      await Promise.all(
        Array.from(this.microtasks).map(task => {
          return task.callback(task.params.map(p => Reflect.get(this.state, p)))
        })
      )
    } catch (error) {
      console.error(error)
    }
    this.microtasks.clear()
    this.waitingMicrotask = false
  }

  /**
   * 触发属性变更事件
   * @param prop 属性名
   */
  trigger(prop: string | symbol): void {
    const propHandlers = this.propsHandlers.get(prop)
    const handlersToRemove: PropHandler[] = []

    propHandlers?.forEach(handler => {
      if (handler.once) {
        handlersToRemove.push(handler)
      }

      if (handler.sync) {
        handler.callback(handler.params.map(p => Reflect.get(this.state, p)))
      } else {
        this.microtasks.add(handler)
        if (!this.waitingMicrotask) {
          this.waitingMicrotask = true
          queueMicrotask(() => this.runMicrotasks())
        }
      }
    })

    // 移除一次性处理器
    handlersToRemove.forEach(handler => {
      this.unobserveHandler(handler)
    })
  }

  /**
   * 观察属性变化
   * @param props 要观察的属性名数组
   * @param callback 属性变化时的回调函数
   * @param options 观察选项
   * @returns 取消观察的函数
   */
  observe<const P extends K[]>(
    props: P,
    callback: (values: {
      [key in keyof P]: S[P[key]]
    }) => void,
    options: ObserveOptions = {}
  ): () => void {
    const { propsHandlers } = this

    const handler: PropHandler = {
      callback,
      params: [...props] as string[],
      sync: options.sync,
      once: options.once
    }

    props.forEach(prop => {
      const propHandlers = propsHandlers.get(prop)
      if (propHandlers) {
        propHandlers.add(handler)
      } else {
        propsHandlers.set(prop, new Set([handler]))
      }
    })

    if (options.immediate) {
      handler.callback(handler.params.map(p => this.state[p]))
    }

    // 返回取消观察的函数
    return () => this.unobserve(props, handler)
  }

  /**
   * 获取状态对象
   * @returns 状态对象
   */
  getState(): S {
    return this.state
  }

  /**
   * 设置状态对象
   * @param state 状态对象
   */
  setState(state: Partial<S>): Observable<S, K> {
    Object.assign(this.state, state)
    return this
  }

  /**
   * 取消观察处理器
   * @param handler 要取消的处理器
   */
  unobserveHandler(handler: PropHandler): void {
    this.microtasks.delete(handler)

    for (const [prop, handlers] of this.propsHandlers.entries()) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.propsHandlers.delete(prop)
      }
    }
  }

  /**
   * 取消观察特定属性
   * @param props 要取消观察的属性名数组
   * @param handler 要取消的处理器, 不填则取消所有处理器
   */
  unobserve<const P extends K[]>(props: P, handler?: PropHandler): void {
    const { propsHandlers } = this
    if (!handler) {
      props.forEach(prop => {
        propsHandlers.delete(prop)
      })
      return
    }

    props.forEach(prop => {
      propsHandlers.get(prop)?.delete(handler)
    })
  }

  /**
   * 销毁所有观察者
   */
  destroyAll(): void {
    this.propsHandlers.clear()
    this.microtasks.clear()
  }
}
