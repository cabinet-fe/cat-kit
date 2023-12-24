interface StoreColumn<T = unknown> {
  /** 是否自增 */
  autoIncrement?: boolean
  /** 是否是主键 */
  primary?: boolean
  /** 当前列的描述 */
  describe?: string
  /** 示例值，用于生成CRUD时的提示 */
  example: T
  /** 是否必填 */
  required?: boolean
}

export class WebDB {
  #db?: IDBDatabase

  readonly name: string

  readonly version?: number

  #queue: any[] = []

  async #clearQueue() {
    while (this.#queue.length) {
      this.#queue.shift()!.db = this.#db
    }
  }

  async #init() {
    const request = window.indexedDB.open(this.name, this.version)
    request.onsuccess = ev => {
      this.#db = request.result
      this.#clearQueue()
    }
    request.onupgradeneeded = ev => {
      this.#db = request.result
      while (this.#queue.length) {
        this.#queue.shift()!.db = this.#db
      }
      this.#clearQueue()
    }
  }

  constructor(DBName: string, version?: number) {
    this.name = DBName
    this.version = version

    this.#init()
  }

  /**
   * 定义一个对象库
   * @param name
   * @param columns
   * @returns
   */
  defineStore<
    Name extends string,
    Cols extends Record<string, StoreColumn> = Record<string, StoreColumn>,
    Obj = {
      [key in RequiredKeys<Cols>]: Cols[key]['example']
    } & {
      [key in keyof Omit<Cols, RequiredKeys<Cols>>]?: Cols[key]['example']
    }
  >(name: Name, columns: Cols) {
    const store = new WebDBStore<Name, Cols, Obj>(name, columns)

    if (this.#db) {
      store.db = this.#db
    } else {
      this.#queue.push(store)
    }

    return store
  }
}

type RequiredKeys<Cols extends Record<string, StoreColumn>> = {
  [key in keyof Cols]: Cols[key]['required'] extends true ? key : never
}[keyof Cols]

class WebDBStore<
  Name extends string = string,
  Cols extends Record<string, StoreColumn> = Record<string, StoreColumn>,
  Obj = {
    [key in RequiredKeys<Cols>]: Cols[key]['example']
  } & {
    [key in keyof Omit<Cols, RequiredKeys<Cols>>]?: Cols[key]['example']
  }
> {
  name: Name
  readonly columns: Cols
  tasks: Set<any> = new Set()
  #db?: IDBDatabase

  set db(db: IDBDatabase) {
    this.#db = db
  }

  constructor(name: Name, columns: Cols) {
    this.name = name
    this.columns = columns
  }

  /**
   * 创建一条记录
   * @param object 存储对象
   */
  async create(object: Obj): Promise<Obj> {
    return new Promise((resolve, reject) => {
      const task = () => {
        const store = this.#db!.transaction(this.name, 'readwrite').objectStore(
          this.name
        )
        const req = store.add(object)

        req.onsuccess = () => {
          resolve(object)
          this.tasks.delete(task)
        }

        req.onerror = () => {
          reject(req.error)
          this.tasks.delete(task)
        }
      }

      if (this.#db) {
        task()
      } else {
        this.tasks.add(task)
      }
    })
  }

  /**
   * 删除一个对象
   */
  delete() {}

  update() {}

  read() {}

  count() {}
}
