interface StoreColumn<T extends any = any> {
  autoIncrement?: boolean
  primary?: boolean
  describe?: string
  type: T extends Number ? number : T extends String ? string : T extends Boolean ? boolean : T extends Date ? Date : T
}

interface StoreColumns<Keys extends string = string> {
  [key in Keys]: StoreColumn<any>
}

class WebDB {
  #db?: IDBDatabase

  readonly name: string

  readonly version?: number

  readonly stores: WebDBStore[] = []

  async #init() {
    const request = window.indexedDB.open(this.name, this.version)
    request.onsuccess = ev => {
      this.#db = request.result
    }
    request.onupgradeneeded = ev => {
      this.#db = request.result
    }
  }

  constructor(DBName: string, version?: number) {
    this.name = DBName
    this.version = version

    this.#init()
  }

  initStores(stores: WebDBStore[] | WebDBStore) {
    if (Array.isArray(stores)) {
      this.stores.push(...stores)
    } else {
      this.stores.push(stores)
    }
  }
}

class WebDBStore<Keys extends string = string> {
  name: string
  readonly columns: Record<Keys, StoreColumn>

  constructor(name: string, columns: Record<Keys, StoreColumn>) {
    this.name = name
    this.columns = columns
  }

  /**
   * 创建一个对象
   * @param object 存储对象
   */
  create(object: Record<Keys, any>) {}

  /**
   * 删除一个对象
   */
  delete() {}

  update() {}

  read() {}
}

const db = new WebDB('aa')

const s = new WebDBStore('test', {
  id: {
    autoIncrement: true,
    primary: true,
    type: Number
  }
})

s.create({
  id: 1
})
