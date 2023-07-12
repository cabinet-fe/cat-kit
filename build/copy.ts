import fs from 'fs-extra'
import path from 'path'
import prettier from 'prettier'
import { OUTPUT, PKG } from './constants'

export const copy = async () => {
  const str = fs.readFileSync(PKG, 'utf-8')
  const obj = JSON.parse(str)

  ~['scripts', 'devDependencies'].forEach(key => {
    delete obj[key]
  })
  const s = await prettier.format(JSON.stringify(obj), { parser: 'json' })
  fs.writeFileSync(
    path.resolve(OUTPUT, 'package.json'),
    s
  )

  fs.copyFileSync(
    path.resolve(process.cwd(), 'README.md'),
    path.resolve(OUTPUT, 'README.md')
  )
}
