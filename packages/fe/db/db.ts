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

type StoresConfigs = {
  [key: string]: {
    [key: string]: StoreColumn
  }
}

interface DBOptions<Stores extends StoresConfigs> {
  /** 数据库名称 */
  name: string
  /** 数据库版本 */
  version?: number
  /** 数据库对象存储库 */
  stores: Stores
}

export class WebDB<Stores extends StoresConfigs> {
  #db: IDBDatabase

  readonly name: string

  readonly version?: number

  #queue: any[] = []

  stores!: {
    [key in keyof Stores]: WebDBStore<string, Stores[key]>
  }

  /**
   * 浏览器数据库
   * @param DBName 数据库名称
   * @param version 数据库版本
   */
  constructor(options: DBOptions<Stores> & { onOpened: (db: any) => void }) {
    this.name = options.name
    this.version = options.version
    const request = window.indexedDB.open(this.name, this.version)

    // request.onsuccess = ev => {
    //   this.#db = request.result
    //   this.#clearQueue()
    // }
    request.onupgradeneeded = ev => {
      this.#db = request.result
      while (this.#queue.length) {
        this.#queue.shift()!.db = this.#db
      }

      const stores = {} as {
        [key in keyof Stores]: WebDBStore<string, Stores[key]>
      }

      for (const storeName in options.stores) {
        stores[storeName] = this.#createStore(storeName, stores[storeName])
      }

      this.stores = stores

      options.onOpened(this)
    }
  }

  /**
   * 定义一个对象库
   * @param name
   * @param columns
   * @returns
   */
  #createStore<
    Name extends string,
    Cols extends Record<string, StoreColumn> = Record<string, StoreColumn>,
    Obj extends GetRecord<Cols> = GetRecord<Cols>
  >(name: Name, columns: Cols) {
    const store = new WebDBStore<Name, Cols, Obj>(name, columns)

    if (this.#db) {
      store.db = this.#db
    } else {
      this.#queue.push(store)
    }

    return store
  }

  /**
   * 创建数据库
   */
  static async create<Stores extends StoresConfigs>(
    options: DBOptions<Stores>
  ): Promise<WebDB<Stores>> {
    return new Promise((rs, rj) => {
      try {
        new WebDB({ ...options, onOpened: rs })
      } catch (error) {
        rj(error)
      }
    })
  }
}

type RequiredKeys<Cols extends Record<string, StoreColumn>> = {
  [key in keyof Cols]: Cols[key]['required'] extends true ? key : never
}[keyof Cols]

type GetRecord<Cols extends Record<string, StoreColumn>> = {
  [key in RequiredKeys<Cols>]: Cols[key]['example']
} & {
  [key in keyof Omit<Cols, RequiredKeys<Cols>>]?: Cols[key]['example']
}

class WebDBStore<
  Name extends string,
  Cols extends Record<string, StoreColumn>,
  Obj extends GetRecord<Cols> = GetRecord<Cols>
> {
  name: Name

  readonly columns: Cols
  tasks: Set<any> = new Set()
  #db?: IDBDatabase

  #store: IDBObjectStore

  set db(db: IDBDatabase) {
    this.#db = db
    this.tasks.forEach(task => task())
  }

  #createStore(name: Name) {
    const { db, columns } = this
    if (!db) return

    const existStore = db.objectStoreNames.contains(name)
    if (existStore) {
      return db.transaction(name, 'readwrite').objectStore(name)
    }
    const columnKeys = Object.keys(columns)
    this.#store = db.createObjectStore(this.name, {
      keyPath: columnKeys.find(key => columns[key].primary)
    })
  }

  constructor(name: Name, columns: Cols) {
    this.name = name
    this.columns = columns

    if (this.#db) {
      this.#createStore(name)
    } else {
      this.tasks.add(() => {
        this.#createStore(name)
      })
    }
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

const users = new WebDBStore('users', {
  name: { example: 'aa', required: true }
})

export function defineDBStores<C extends StoresConfigs>(configs: C) {
  return configs
}
