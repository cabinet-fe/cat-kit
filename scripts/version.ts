// 版本升降级
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

type Action = 'downgrade' | 'upgrade'
type VersionType = 'major' | 'minor' | 'patch'

const updateVersion = async (action: Action, type: VersionType) => {
  const rootPackageJsonPath = path.resolve(cwd(), 'package.json')
  const rootPackageJson = JSON.parse(
    fs.readFileSync(rootPackageJsonPath, 'utf-8')
  )
  const { version } = rootPackageJson

  // 切割出版本信息和标识信息, 标识包含alpha, beta等等
  const [versionInfo, tag] = version.split('-')
  let [major, minor, patch] = versionInfo.split('.')

  if (action === 'upgrade') {
    if (type === 'major') {
      major = String(+major + 1)
    } else if (type === 'minor') {
      minor = String(+minor + 1)
    } else {
      patch = String(+patch + 1)
    }
  } else {
    if (type === 'major') {
      major = String(+major - 1)
    } else if (type === 'minor') {
      minor = String(+minor - 1)
    } else {
      patch = String(+patch - 1)
    }
  }

  rootPackageJson.version = `${major}.${minor}.${patch}`

  fs.writeFile(
    rootPackageJsonPath,
    await pretty.format(JSON.stringify(rootPackageJson), { parser: 'json' }),
    err => {
      err && console.error(err)
    }
  )

  packagesJson.forEach(async (json, i) => {
    json.version = rootPackageJson.version
    fs.writeFile(
      packagesJsonPath[i],
      await pretty.format(JSON.stringify(json), { parser: 'json' }),
      err => {
        err && console.error(err)
      }
    )
  })
}

const upgrade = (type: VersionType) => {
  updateVersion('upgrade', type)
}

const downgrade = (type: VersionType) => {
  updateVersion('downgrade', type)
}

const [action = 'upgrade', type = 'patch'] = process.argv.slice(2) as [
  Action,
  VersionType
]

action === 'upgrade' ? upgrade(type) : downgrade(type)
