interface DBOptions {
  /** 数据库发生错误时的回调 */
  onError?: (err: any) => void
  /** 数据库升级后的回调 */
  onUpgradeneeded?: (db: IDBDatabase) => void
  /** 版本更改事件 */
  onVersionchange?: (e: IDBVersionChangeEvent) => void
}

/**
 * 连接一个数据库
 * @param name 需要连接的数据库的名称
 * @param version 数据库的版本
 * @param options 选项
 * @returns
 */
export function openDB(name: string, version?: number, options?: DBOptions) {
  return new Promise<IDBDatabase['createObjectStore']>((rs, rj) => {
    const request = indexedDB.open(name, version)

    request.addEventListener('success', () => {})

    request.addEventListener('error', err => {
      rj(err)
      options?.onError?.(err)
    })

    request.addEventListener('upgradeneeded', () => {
      let db = request.result
      console.log(Object.values(db.objectStoreNames))
      function createObjectStore(
        name: string,
        options?: IDBObjectStoreParameters
      ) {
        if (!db.objectStoreNames.contains(name)) {
          return db.createObjectStore(name, options)
        } else {
          let storeTransaction = db.transaction([name], 'readwrite')
          let store = storeTransaction.objectStore(name)
          return store
        }
      }

      rs(createObjectStore)

      if (options?.onVersionchange) {
        db.onversionchange = options?.onVersionchange
      }

      options?.onUpgradeneeded?.(db)
    })
  })
}

/**
 * 数据
 */
export function deleteDB() {}

class EasyDB {
  private dbName: string
  private dbVersion: number
  private db: IDBDatabase | null = null

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  public async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = event.target.result
        const objectStore = db.createObjectStore('data', { keyPath: 'id' })
        objectStore.createIndex('name', 'name', { unique: false })
      }
    })
  }

  public async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  public async put<T>(data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not open'))
        return
      }

      const transaction = this.db.transaction('data', 'readwrite')
      const objectStore = transaction.objectStore('data')
      const request = objectStore.put(data)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  public async get<T>(id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not open'))
        return
      }

      const transaction = this.db.transaction('data', 'readonly')
      const objectStore = transaction.objectStore('data')
      const request = objectStore.get(id)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  public async getAll<T>(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not open'))
        return
      }

      const transaction = this.db.transaction('data', 'readonly')
      const objectStore = transaction.objectStore('data')
      const request = objectStore.getAll()

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }
}
