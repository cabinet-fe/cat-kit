import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import path, { resolve } from 'path'
import { fileURLToPath } from 'url'
import { readDir, readFileLine } from '@cat-kit/be'
import pretty from 'prettier'

const __dirname = fileURLToPath(new URL('../docs', import.meta.url))

async function getSidebar() {
  const dirs = await readDir(__dirname, {
    recursive: true,

    include: [/docs\/(lab|shared|utils)/]
  })

  const sidebar = {}

  // 一层
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i]!
    const first: { text: string; items: { text: string; link: string }[] }[] =
      []
    sidebar[`/${dir.name}/`] = first

    if (dir.type === 'dir') {
      for (let j = 0; j < dir.children.length; j++) {
        const firstChild = dir.children[j]!
        let index = resolve(firstChild.path, 'index.md')
        let title = firstChild.name
        if (existsSync(index)) {
          try {
            const [content] = await readFileLine(index, (_, str, content) => {
              if (str.startsWith('#')) return true
              if (content.length) return false
            })

            if (content) {
              title = content.replace(/#[\s]*/, '')
            }
          } catch (error) {}
        }
        const second: { text: string; link: string }[] = []

        if (firstChild.type === 'dir') {

          for (let k = 0; k < firstChild.children.length; k++) {
            const secondChild = firstChild.children[k]!
            try {
              if (secondChild.type !== 'file') continue
              const [content] = await readFileLine(
                secondChild.path,
                (_, str, content) => {
                  if (str.startsWith('#')) return true
                  if (content.length) return false
                }
              )
              let text = content?.replace(/#[\s]*/, '') || ''
              let secondName = secondChild.name.replace(/\.md$/, '')
              if (secondName === 'index') {
                secondName = ''
                text = '概要'
              }
              second.push({
                text,
                link: `/${dir.name}/${firstChild.name}/${secondName}`
              })
            } catch (error) {}
          }
        }

        first.push({
          text: title,
          items: second
        })
      }
    }
  }
  const sidebarStr = await pretty.format(
    `export default ${JSON.stringify(sidebar)}`,
    {
      parser: 'typescript'
    }
  )
  writeFile(
    path.resolve(__dirname, './.vitepress/config/sidebar.ts'),
    sidebarStr
  )
}

getSidebar()
