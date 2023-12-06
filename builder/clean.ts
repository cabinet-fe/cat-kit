import { remove } from 'fs-extra'
import { OUTPUT } from './constants'

export const clean = async () => {
  await remove(OUTPUT)
}