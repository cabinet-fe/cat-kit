// 升级版本
import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import pretty from 'prettier'

const pkgRootPath = path.resolve(cwd(), 'packages')
const packagesDir = fs.readdirSync(pkgRootPath)
const packagesJsonPath = packagesDir.map(dir =>
  path.resolve(pkgRootPath, dir, 'package.json')
)
const packagesJson = packagesJsonPath.map(path =>
  JSON.parse(fs.readFileSync(path, 'utf-8'))
)

const upgrade = (type: 'major' | 'minor' | 'patch') => {
  packagesJson.forEach((json, i) => {
    const { version } = json
    // 切割出版本信息和标识信息, 标识包含alpha, beta等等
    const [versionInfo, tag] = version.split('-')
    let [major, minor, patch] = versionInfo.split('.')

    if (type === 'major') {
      major = String(+major + 1)
    } else if (type === 'minor') {
      minor = String(+minor + 1)
    } else {
      patch = String(+patch + 1)
    }

    json.version = `${major}.${minor}.${patch}`

    fs.writeFile(
      packagesJsonPath[i],
      pretty.format(JSON.stringify(json), { parser: 'json' }),
      err => {
        err && console.error(err)
      }
    )
  })
}

upgrade('patch')
