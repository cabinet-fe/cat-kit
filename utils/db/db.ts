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
export function openDB(
  name: string,
  version?: number,
  options?: DBOptions
) {
  return new Promise<IDBDatabase['createObjectStore']>((rs, rj) => {
    const request = indexedDB.open(name, version)

    request.addEventListener('success', () => {

    })

    request.addEventListener('error', (err) => {
      rj(err)
      options?.onError?.(err)
    })

    request.addEventListener('upgradeneeded', () => {
      let db = request.result
      console.log(Object.values(db.objectStoreNames))
      function createObjectStore(name: string, options?: IDBObjectStoreParameters) {
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
export function deleteDB() {

}

