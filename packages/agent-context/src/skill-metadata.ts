import { readdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const TEXT_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.json', '.txt', '.mdx'])

/** 从 SKILL.md 正文解析 frontmatter 内 `metadata.version`（无则 undefined） */
export function parseSkillMdMetadataVersion(skillMd: string): string | undefined {
  const fm = extractYamlFrontmatter(skillMd)
  if (!fm) return undefined
  const m = fm.match(/metadata:\s*\r?\n\s*version:\s*([^\s\r\n#]+)/)
  if (!m) return undefined
  const raw = m[1]
  if (raw === undefined) return undefined
  let v = raw
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1)
  }
  return v
}

function extractYamlFrontmatter(source: string): string | undefined {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return m?.[1]
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...(await listFilesRecursive(p)))
    } else {
      out.push(p)
    }
  }
  return out
}

/**
 * 当 embedded 版本与包版本不一致时，在技能目录内将旧版本号全文替换为新版本号
 * （仅处理常见文本后缀，避免误伤二进制）
 */
export async function replaceVersionInSkillDirectory(
  skillDir: string,
  oldVersion: string,
  newVersion: string
): Promise<void> {
  if (!oldVersion || oldVersion === newVersion) return

  const files = await listFilesRecursive(skillDir)
  for (const filePath of files) {
    const ext = extname(filePath).toLowerCase()
    if (!TEXT_EXTENSIONS.has(ext)) continue

    let content: string
    try {
      content = await readFile(filePath, 'utf-8')
    } catch {
      continue
    }

    if (!content.includes(oldVersion)) continue

    const next = content.split(oldVersion).join(newVersion)
    if (next !== content) {
      await writeFile(filePath, next, 'utf-8')
    }
  }
}
