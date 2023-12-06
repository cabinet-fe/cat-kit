// 版本管理
import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import pretty from 'prettier'
import inquirer from 'inquirer'

const rootPKG = JSON.parse(
  fs.readFileSync(path.resolve(cwd(), 'package.json'), 'utf-8')
)

const currentVersion = rootPKG.version.split('.').map(v => +v)
const versionType = ['主要版本', '次版本', '修订版本']

const versionChoices = versionType.map((type, index) => {
  const version = [
    ...currentVersion.slice(0, index),
    currentVersion[index] + 1,
    ...currentVersion.slice(index + 1).map(() => 0)
  ].join('.')

  return {
    name: `${type} ${version}`,
    value: version,
    short: version
  }
})

const answer = await inquirer.prompt<{
  version?: string
  customVersion?: string
  confirm?: boolean
}>([
  {
    type: 'list',
    name: 'version',
    message: `选择升级版本(当前${rootPKG.version})`,
    default: versionChoices[2]?.value,
    choices: [...versionChoices, { name: '自定义', value: undefined }],
    prefix: ''
  },
  {
    type: 'input',
    name: 'customVersion',
    message: '输入自定义版本号:',
    validate(input) {
      if (/\d+\.\d+\.\d+/.test(input)) {
        return true
      }
      return '请输入正确的版本号x.y.z'
    },
    default: versionChoices[2]?.value,
    when: answer => answer.version === undefined,
    prefix: ''
  },
  {
    type: 'list',
    name: 'confirm',
    choices: [
      { name: '是', value: true },
      { name: '否', value: false }
    ],
    prefix: '',
    when: answer => {
      return answer.version === versionChoices[0]?.value
    },
    message: answer => `确认升级到${answer.version}?`
  }
])

// 相对根目录的包路径
const pkgs = [
  '.',
  'docs',
  'builder',
  'cmd',
  ...fs
    .readdirSync(path.resolve(cwd(), 'packages'))
    .map(name => `packages/${name}`)
].map(name => ({
  path: name,
  json: JSON.parse(
    fs.readFileSync(path.resolve(cwd(), name, 'package.json'), 'utf-8')
  )
}))

function updateVersion() {
  if (answer.confirm === false) return
  const newVersion = answer.customVersion || answer.version

  pkgs.forEach(async pkg => {
    pkg.json.version = newVersion
    const s = await pretty.format(JSON.stringify(pkg.json), { parser: 'json' })
    fs.writeFileSync(path.resolve(cwd(), pkg.path, 'package.json'), s)
  })
}

updateVersion()
