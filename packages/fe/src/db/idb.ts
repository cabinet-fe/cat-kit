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
  stores: Store[]
}

interface Query {
  [key: string]: any
}

class Store {
  private name: string
  private schema: StoreDefinition
  private db: IDBDatabase | null = null
  private primaryKey: string | null = null

  /**
   * 构造 Store 对象
   * @param name 存储对象名称
   * @param schema 字段定义
   */
  constructor(name: string, schema: StoreDefinition) {
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
  private getTransaction(
    mode: IDBTransactionMode = 'readonly'
  ): IDBObjectStore {
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
    return new Promise((resolve, reject) => {
      try {
        const store = this.getTransaction()
        const countRequest = store.count()
        countRequest.onsuccess = () => {
          resolve(countRequest.result)
        }
        countRequest.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 添加数据
   * @param data 数据对象
   * @returns 新增数据的键值
   */
  async add(data: any): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      try {
        const validatedData = this.validateData(data)
        const store = this.getTransaction('readwrite')
        const request = store.add(validatedData)
        request.onsuccess = () => {
          resolve(request.result)
        }
        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 查找单条数据
   * @param query 查询条件
   * @returns 查询结果，未找到返回 null
   */
  async find(query: Query): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getTransaction()
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
        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 查找多条数据
   * @param query 查询条件
   * @returns 查询结果数组
   */
  async findMany(query: Query): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getTransaction()
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
        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
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
      try {
        const store = this.getTransaction('readwrite')
        const request = store.get(key)

        request.onsuccess = () => {
          if (!request.result) {
            resolve(false)
            return
          }

          const updatedData = { ...request.result, ...data }
          const putRequest = store.put(updatedData)

          putRequest.onsuccess = () => {
            resolve(true)
          }

          putRequest.onerror = event => {
            reject(event)
          }
        }

        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 替换数据
   * @param key 键值
   * @param data 新数据
   * @returns 是否替换成功
   */
  async put(key: IDBValidKey, data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const validatedData = this.validateData(data)
        const store = this.getTransaction('readwrite')

        // 设置键值
        if (this.primaryKey) {
          validatedData[this.primaryKey] = key
        }

        const request = store.put(validatedData)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
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

            const store = this.getTransaction('readwrite')
            const key = this.primaryKey ? data[this.primaryKey] : null

            if (!key) {
              reject(new Error('无法确定删除键值'))
              return
            }

            const request = store.delete(key)

            request.onsuccess = () => {
              resolve(true)
            }

            request.onerror = event => {
              reject(event)
            }
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

            const store = this.getTransaction('readwrite')
            let deleted = 0
            let error: any = null

            dataList.forEach(data => {
              const key = this.primaryKey ? data[this.primaryKey] : null

              if (!key) {
                error = new Error('无法确定删除键值')
                return
              }

              const request = store.delete(key)

              request.onsuccess = () => {
                deleted++
                if (deleted === dataList.length) {
                  resolve(deleted)
                }
              }

              request.onerror = event => {
                error = event
              }
            })

            if (error) {
              reject(error)
            }
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
    return new Promise((resolve, reject) => {
      try {
        const store = this.getTransaction('readwrite')
        const request = store.clear()

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = event => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}

export class IDB {
  private name: string
  private config: IDBConfig
  private db: IDBDatabase | null = null
  private isConnected: boolean = false

  /**
   * 定义存储对象
   * @param name 存储对象名称
   * @param schema 字段定义
   * @returns 存储对象
   */
  static defineStore(name: string, schema: StoreDefinition): Store {
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
    this.connect()
  }

  /**
   * 连接数据库
   * @returns Promise对象
   */
  private connect(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.db) {
        resolve(this.db)
        return
      }

      const request = indexedDB.open(this.name, this.config.version)

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建或更新存储对象
        this.config.stores.forEach(store => {
          const storeName = store.getName()
          const primaryKey = store.getPrimaryKey()

          // 如果存储对象已存在则删除
          if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName)
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

        // 为每个存储对象设置数据库实例
        this.config.stores.forEach(store => {
          store.setDB(this.db as IDBDatabase)
        })

        resolve(this.db)
      }

      request.onerror = event => {
        reject(event)
      }
    })
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
