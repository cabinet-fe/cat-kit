import { readFileSync, writeFileSync } from 'fs-extra'
import path from 'path'
import { OUTPUT, PKG } from './constants'

export const copy = () => {
  const str = readFileSync(PKG, 'utf-8')
  const obj = JSON.parse(str)

  ~['scripts', 'devDependencies'].forEach(key => {
    delete obj[key]
  })

  writeFileSync(path.resolve(OUTPUT, 'package.json'), JSON.stringify(obj))
}
