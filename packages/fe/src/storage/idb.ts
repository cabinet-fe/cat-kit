/**
 * IndexedDB 封装类
 * 用于简化浏览器端 IndexedDB 数据库操作
 */

interface FieldDefinition {
  type:
  | StringConstructor
  | NumberConstructor
  | ObjectConstructor
  | ArrayConstructor
  | BooleanConstructor
  | DateConstructor
  required?: boolean
  primary?: boolean
  autoIncrement?: boolean
  default?: any
}

interface StoreDefinition {
  [key: string]: FieldDefinition
}

interface IDBConfig {
  version: number
  stores: Store<Record<string, FieldDefinition>>[]
}

interface Query {
  [key: string]: any
}



class Store<T extends StoreDefinition, Data = {
  [key in keyof T]: InstanceType<T[key]['type']>
}> {
  private name: string
  private schema: StoreDefinition
  private db: IDBDatabase | null = null
  private dbReady: Promise<IDBDatabase> | null = null
  private primaryKey: string | null = null

  /**
   * 构造 Store 对象
   * @param name 存储对象名称
   * @param schema 字段定义
   */
  constructor(name: string, schema: T) {
    this.name = name
    this.schema = schema

    // 查找主键
    for (const [key, field] of Object.entries(schema)) {
      if (field.primary) {
        this.primaryKey = key
        break
      }
    }
  }

  /**
   * 设置数据库实例
   * @param db 数据库实例
   */
  setDB(db: IDBDatabase): void {
    this.db = db
  }

  /**
   * 设置数据库就绪 Promise（用于连接时序队列化）
   */
  setDBReady(dbReady: Promise<IDBDatabase>): void {
    this.dbReady = dbReady
  }

  /**
   * 获取存储对象名称
   */
  getName(): string {
    return this.name
  }

  /**
   * 获取存储对象定义
   */
  getSchema(): StoreDefinition {
    return this.schema
  }

  /**
   * 获取主键名称
   */
  getPrimaryKey(): string | null {
    return this.primaryKey
  }

  /**
   * 验证数据结构
   * @param data 待验证数据
   * @returns 经过处理的有效数据
   */
  private validateData(data: any): any {
    const result: any = {}
    for (const [key, field] of Object.entries(this.schema)) {
      // 检查必须字段
      if (field.required && data[key] === undefined) {
        if (field.default !== undefined) {
          result[key] =
            typeof field.default === 'function'
              ? field.default()
              : field.default
        } else {
          throw new Error(`${key} is required`)
        }
      } else if (data[key] !== undefined) {
        // 类型检查
        if (field.type === String) {
          result[key] = String(data[key])
        } else if (field.type === Number) {
          result[key] = Number(data[key])
        } else if (field.type === Boolean) {
          result[key] = Boolean(data[key])
        } else if (field.type === Date) {
          result[key] =
            data[key] instanceof Date ? data[key] : new Date(data[key])
        } else if (field.type === Object || field.type === Array) {
          result[key] = data[key]
        } else {
          result[key] = data[key]
        }
      }
    }
    return result
  }

  /**
   * 获取事务
   * @param mode 事务模式
   * @returns 事务对象
   */
  private async getTransaction(
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    if (!this.db && this.dbReady) {
      this.db = await this.dbReady
    }
    if (!this.db) {
      throw new Error('数据库未连接')
    }
    const transaction = this.db.transaction(this.name, mode)
    return transaction.objectStore(this.name)
  }

  /**
   * 构建查询条件
   * @param query 查询参数
   * @returns 过滤函数
   */
  private buildQuery(query: Query): (item: any) => boolean {
    return (item: any) => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          return false
        }
      }
      return true
    }
  }

  /**
   * 获取表中数据总数
   * @returns 数据总数
   */
  async count(): Promise<number> {
    const store = await this.getTransaction()
    const request = store.count()
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('count failed'))
    })
  }

  /**
   * 添加数据
   * @param data 数据对象
   * @returns 新增数据的键值
   */
  async add(data: Data): Promise<IDBValidKey> {
    const validatedData = this.validateData(data)
    const store = await this.getTransaction('readwrite')
    const request = store.add(validatedData)
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('add failed'))
    })
  }

  /**
   * 查找单条数据
   * @param query 查询条件
   * @returns 查询结果，未找到返回 null
   */
  async find(query: Query): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTransaction()
        .then(store => {
          const request = store.openCursor()
          const filter = this.buildQuery(query)

          request.onsuccess = event => {
            const cursor = (event.target as IDBRequest)
              .result as IDBCursorWithValue
            if (cursor) {
              if (filter(cursor.value)) {
                resolve(cursor.value)
                return
              }
              cursor.continue()
            } else {
              resolve(null)
            }
          }
          request.onerror = () =>
            reject(request.error ?? new Error('find failed'))
        })
        .catch(reject)
    })
  }

  /**
   * 查找多条数据
   * @param query 查询条件
   * @returns 查询结果数组
   */
  async findMany(query: Query): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.getTransaction()
        .then(store => {
          const request = store.openCursor()
          const filter = this.buildQuery(query)
          const results: any[] = []

          request.onsuccess = event => {
            const cursor = (event.target as IDBRequest)
              .result as IDBCursorWithValue
            if (cursor) {
              if (filter(cursor.value)) {
                results.push(cursor.value)
              }
              cursor.continue()
            } else {
              resolve(results)
            }
          }
          request.onerror = () =>
            reject(request.error ?? new Error('findMany failed'))
        })
        .catch(reject)
    })
  }

  /**
   * 更新数据
   * @param key 键值
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(key: IDBValidKey, data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getTransaction('readwrite')
        .then(store => {
          const request = store.get(key)

          request.onsuccess = () => {
            if (!request.result) {
              resolve(false)
              return
            }

            const updatedData = { ...request.result, ...data }
            const putRequest = store.put(updatedData)

            putRequest.onsuccess = () => resolve(true)
            putRequest.onerror = () =>
              reject(putRequest.error ?? new Error('update failed'))
          }

          request.onerror = () =>
            reject(request.error ?? new Error('update failed'))
        })
        .catch(reject)
    })
  }

  /**
   * 替换数据
   * @param key 键值
   * @param data 新数据
   * @returns 是否替换成功
   */
  async put(key: IDBValidKey, data: any): Promise<boolean> {
    const validatedData = this.validateData(data)
    const store = await this.getTransaction('readwrite')

    // 设置键值
    if (this.primaryKey) {
      validatedData[this.primaryKey] = key
    }

    const request = store.put(validatedData)

    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error ?? new Error('put failed'))
    })
  }

  /**
   * 删除单条数据
   * @param query 查询条件
   * @returns 是否删除成功
   */
  async delete(query: Query): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.find(query)
          .then(data => {
            if (!data) {
              resolve(false)
              return
            }

            this.getTransaction('readwrite')
              .then(store => {
                const key = this.primaryKey ? data[this.primaryKey] : null

                if (!key) {
                  reject(new Error('无法确定删除键值'))
                  return
                }

                const request = store.delete(key)

                request.onsuccess = () => resolve(true)
                request.onerror = () =>
                  reject(request.error ?? new Error('delete failed'))
              })
              .catch(reject)
          })
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 删除多条数据
   * @param query 查询条件
   * @returns 删除数量
   */
  async deleteMany(query: Query): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.findMany(query)
          .then(dataList => {
            if (dataList.length === 0) {
              resolve(0)
              return
            }

            this.getTransaction('readwrite')
              .then(store => {
                const deletes = dataList.map(data => {
                  const key = this.primaryKey ? data[this.primaryKey] : null
                  if (!key) {
                    throw new Error('无法确定删除键值')
                  }
                  const req = store.delete(key)
                  return new Promise<void>((res, rej) => {
                    req.onsuccess = () => res()
                    req.onerror = () =>
                      rej(req.error ?? new Error('deleteMany failed'))
                  })
                })

                Promise.all(deletes)
                  .then(() => resolve(deletes.length))
                  .catch(reject)
              })
              .catch(reject)
          })
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 清空存储对象
   * @returns 是否清空成功
   */
  async clear(): Promise<boolean> {
    const store = await this.getTransaction('readwrite')
    const request = store.clear()
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error ?? new Error('clear failed'))
    })
  }
}

export class IDB {
  private name: string
  private config: IDBConfig
  private db: IDBDatabase | null = null
  private isConnected: boolean = false
  private connecting: Promise<IDBDatabase> | null = null
  readonly ready: Promise<IDBDatabase>

  /**
   * 定义存储对象
   * @param name 存储对象名称
   * @param schema 字段定义
   * @returns 存储对象
   */
  static defineStore<T extends StoreDefinition>(name: string, schema: T): Store<T> {
    return new Store(name, schema)
  }

  /**
   * 构造 IDB 实例
   * @param name 数据库名称
   * @param config 数据库配置
   */
  constructor(name: string, config: IDBConfig) {
    this.name = name
    this.config = config
    this.ready = this.connect()
    // 让 Store 方法在连接尚未完成时也能排队等待
    this.config.stores.forEach(store => store.setDBReady(this.ready))
  }

  /**
   * 连接数据库
   * @returns Promise对象
   */
  private connect(): Promise<IDBDatabase> {
    if (this.isConnected && this.db) {
      return Promise.resolve(this.db)
    }
    if (this.connecting) {
      return this.connecting
    }

    this.connecting = new Promise((resolve, reject) => {
      if (this.isConnected && this.db) {
        resolve(this.db)
        return
      }

      const request = indexedDB.open(this.name, this.config.version)

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        const tx = (event.target as IDBOpenDBRequest).transaction

        // 创建或更新存储对象
        this.config.stores.forEach(store => {
          const storeName = store.getName()
          const primaryKey = store.getPrimaryKey()

          // 如果存储对象已存在：默认不做破坏性变更（保护数据）
          if (db.objectStoreNames.contains(storeName)) {
            if (!tx) return
            const existing = tx.objectStore(storeName)
            const existingKeyPath = existing.keyPath
            const existingAutoIncrement = existing.autoIncrement

            const desiredKeyPath = primaryKey ?? null
            const desiredAutoIncrement = primaryKey
              ? Boolean(store.getSchema()[primaryKey]?.autoIncrement)
              : false

            // keyPath 可能为 string | string[] | null，这里只支持 string | null
            if (
              (existingKeyPath !== null && typeof existingKeyPath !== 'string') ||
              (desiredKeyPath !== null && typeof desiredKeyPath !== 'string')
            ) {
              throw new Error(
                `IndexedDB 升级不支持 "${storeName}" 的复合 keyPath，请提供迁移方案或更换数据库名`
              )
            }

            if (existingKeyPath !== desiredKeyPath || existingAutoIncrement !== desiredAutoIncrement) {
              throw new Error(
                `IndexedDB 升级不支持变更 "${storeName}" 的 keyPath/autoIncrement（为保护数据已中止升级）`
              )
            }

            return
          }

          // 创建存储对象
          const options: IDBObjectStoreParameters = {}
          if (primaryKey) {
            const primaryKeyDef = store.getSchema()[primaryKey]
            if (primaryKeyDef) {
              options.keyPath = primaryKey

              if (primaryKeyDef.autoIncrement) {
                options.autoIncrement = true
              }
            }
          }

          db.createObjectStore(storeName, options)
        })
      }

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result
        this.isConnected = true
        this.connecting = null

        // 为每个存储对象设置数据库实例
        this.config.stores.forEach(store => {
          store.setDB(this.db as IDBDatabase)
        })

        resolve(this.db)
      }

      request.onerror = event => {
        this.connecting = null
        reject(request.error ?? event)
      }
    })

    return this.connecting
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.isConnected = false
      this.db = null
    }
  }

  /**
   * 删除数据库
   * @returns Promise对象
   */
  static deleteDatabase(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = event => {
        reject(event)
      }
    })
  }
}






