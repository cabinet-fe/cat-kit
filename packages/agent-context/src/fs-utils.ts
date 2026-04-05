import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function listFilesRecursive(dir: string): Promise<string[]> {
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
