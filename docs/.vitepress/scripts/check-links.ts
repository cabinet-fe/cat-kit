/**
 * 检查文档链接是否都存在对应的文件
 */
import { readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const docsDir = resolve(__dirname, '../..')
const configPath = join(docsDir, '.vitepress/config.ts')

// 读取配置文件
const configContent = readFileSync(configPath, 'utf-8')

// 提取所有链接
const linkRegex = /link:\s*['"]([^'"]+)['"]/g
const links: string[] = []
let match

while ((match = linkRegex.exec(configContent)) !== null) {
  const link = match[1]
  // 只检查内部链接
  if (!link.startsWith('http')) {
    links.push(link)
  }
}

console.log(`\n找到 ${links.length} 个内部链接，开始检查...\n`)

// 检查每个链接
const errors: string[] = []

links.forEach(link => {
  // 规范化链接到文件路径
  let filePath = link

  // 移除开头的斜杠
  if (filePath.startsWith('/')) {
    filePath = filePath.substring(1)
  }

  // 处理结尾的斜杠（目录形式）
  if (filePath.endsWith('/')) {
    filePath = filePath + 'index.md'
  } else {
    filePath = filePath + '.md'
  }

  const fullPath = join(docsDir, filePath)

  if (!existsSync(fullPath)) {
    errors.push(`❌ ${link} -> ${filePath} (文件不存在)`)
  } else {
    console.log(`✅ ${link}`)
  }
})

if (errors.length > 0) {
  console.log('\n\n发现以下问题：\n')
  errors.forEach(err => console.log(err))
  process.exit(1)
} else {
  console.log('\n\n✅ 所有链接都有对应的文档文件！')
  process.exit(0)
}
