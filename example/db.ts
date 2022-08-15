import { openDB } from 'utils'

const boot = async () => {
  const create = await openDB('test')

  const store = create('tableList')

  console.log(store)
}

boot()