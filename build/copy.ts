import { readFileSync, writeFileSync, copyFileSync } from 'fs-extra'
import path from 'path'
import prettier from 'prettier'
import { OUTPUT, PKG } from './constants'

export const copy = () => {
  const str = readFileSync(PKG, 'utf-8')
  const obj = JSON.parse(str)



  ~['scripts', 'devDependencies'].forEach(key => {
    delete obj[key]
  })
  obj.type = 'module'

  writeFileSync(
    path.resolve(OUTPUT, 'package.json'),
    prettier.format(JSON.stringify(obj), { parser: 'json' })
  )

  copyFileSync(path.resolve(process.cwd(), 'README.md'), path.resolve(OUTPUT, 'README.md'))
}
