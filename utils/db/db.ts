export function openDB(
  name: string,
  version?: number,
  upgradeneededCallback?: (db: IDBDatabase) => void
) {
  return new Promise((rs, rj) => {
    const request = indexedDB.open(name, version)

    request.addEventListener('success', () => {
      rs(request.result)
    })

    request.addEventListener('error', () => {
      rs(request.error)
    })

    request.addEventListener('upgradeneeded', () => {
      let db = request.result
      upgradeneededCallback && upgradeneededCallback(db)
    })
  })
}
