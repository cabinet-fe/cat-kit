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


// 封装一个基于IndexedDB的api
interface DatabaseOptions {
  databaseName: string;
  storeName: string;
  keyPath: string;
}

export class IndexedDBApi<T> {
  private readonly options: DatabaseOptions;

  constructor(options: DatabaseOptions) {
    this.options = options;
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.options.databaseName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const database = request.result;
        database.createObjectStore(this.options.storeName, { keyPath: this.options.keyPath });
      };
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.options.storeName, 'readonly');
    const store = transaction.objectStore(this.options.storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getById(id: number | string): Promise<T> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.options.storeName, 'readonly');
    const store = transaction.objectStore(this.options.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async add(item: T): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.options.storeName, 'readwrite');
    const store = transaction.objectStore(this.options.storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async update(id: number | string, item: T): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.options.storeName, 'readwrite');
    const store = transaction.objectStore(this.options.storeName);
    return new Promise((resolve, reject) => {
      const request = store.put(item, id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(id: number | string): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.options.storeName, 'readwrite');
    const store = transaction.objectStore(this.options.storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}