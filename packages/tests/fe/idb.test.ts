import { describe, it, expect, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDB } from '@cat-kit/fe/src'

describe('IDB', () => {
  const dbNames: string[] = []

  afterEach(async () => {
    // 清理测试产生的数据库
    await Promise.all(
      dbNames.splice(0).map(name => IDB.deleteDatabase(name).catch(() => {}))
    )
  })

  it('版本升级不应默认清空 objectStore（应保留数据）', async () => {
    const name = `cat-kit-idb-upgrade-${Date.now()}-${Math.random()}`
    dbNames.push(name)

    const storeV1 = IDB.defineStore('users', {
      id: { type: Number, primary: true },
      name: { type: String, required: true }
    })

    const idbV1 = new IDB(name, { version: 1, stores: [storeV1] })
    await idbV1.ready
    await storeV1.add({ id: 1, name: 'cat' } as any)
    idbV1.close()

    const storeV2 = IDB.defineStore('users', {
      id: { type: Number, primary: true },
      name: { type: String, required: true }
    })
    const idbV2 = new IDB(name, { version: 2, stores: [storeV2] })
    await idbV2.ready

    const found = await storeV2.find({ id: 1 } as any)
    expect(found).toBeTruthy()
    expect(found.name).toBe('cat')

    idbV2.close()
  })

  it('在连接未完成时调用 store 方法不应抛出“数据库未连接”（应排队等待）', async () => {
    const name = `cat-kit-idb-ready-${Date.now()}-${Math.random()}`
    dbNames.push(name)

    const store = IDB.defineStore('items', {
      id: { type: Number, primary: true },
      v: { type: String }
    })
    const idb = new IDB(name, { version: 1, stores: [store] })

    // 不 await idb.ready，直接调用
    const count = await store.count()
    expect(count).toBe(0)

    // 确保连接最终也能完成
    await idb.ready
    idb.close()
  })

  it('升级时若 objectStore 的 keyPath/autoIncrement 不兼容，默认应中止升级并 reject', async () => {
    const name = `cat-kit-idb-incompatible-${Date.now()}-${Math.random()}`
    dbNames.push(name)

    const v1 = IDB.defineStore('users', {
      id: { type: Number, primary: true },
      name: { type: String }
    })
    const idb1 = new IDB(name, { version: 1, stores: [v1] })
    await idb1.ready
    await v1.add({ id: 1, name: 'cat' } as any)
    idb1.close()

    // 变更 keyPath（不允许的破坏性升级）
    const v2 = IDB.defineStore('users', {
      uid: { type: String, primary: true },
      name: { type: String }
    })
    const idb2 = new IDB(name, { version: 2, stores: [v2] })

    await expect(idb2.ready).rejects.toBeTruthy()
  })
})


