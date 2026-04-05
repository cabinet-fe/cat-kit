import { existsSync } from 'node:fs'
import { readdir, rmdir, unlink } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

import { listFilesRecursive } from './fs'

function toPosixRelative(fromDir: string, absolutePath: string): string {
  const rel = relative(fromDir, absolutePath)
  if (rel === '') return ''
  return rel.split(sep).join('/')
}

async function collectSubdirs(root: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(root, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory()) {
      const p = join(root, e.name)
      out.push(p, ...(await collectSubdirs(p)))
    }
  }
  return out
}

/** 目录在删除所有 orphan 文件后是否整棵移除（含空目录） */
async function dirOnlyOrphansOrEmpty(
  dirPath: string,
  skillDir: string,
  orphanAbs: Set<string>
): Promise<boolean> {
  if (dirPath === skillDir) return false
  const entries = await readdir(dirPath, { withFileTypes: true })
  if (entries.length === 0) return true
  for (const e of entries) {
    const p = join(dirPath, e.name)
    if (e.isFile()) {
      if (!orphanAbs.has(p)) return false
    } else {
      if (!(await dirOnlyOrphansOrEmpty(p, skillDir, orphanAbs))) return false
    }
  }
  return true
}

/**
 * 删除技能目录中不在 allowlist 内的文件，并移除因此变空的遗留子目录
 */
export async function pruneSkillDirectory(
  skillDir: string,
  allowedRelativePaths: Set<string>,
  check: boolean
): Promise<{ removed: string[]; checkDirty: string[] }> {
  const removed: string[] = []
  const checkDirty: string[] = []

  if (!existsSync(skillDir)) {
    return { removed, checkDirty }
  }

  const allFiles = await listFilesRecursive(skillDir)

  const orphanFiles = allFiles.filter((abs) => {
    const rel = toPosixRelative(skillDir, abs)
    return rel !== '' && !allowedRelativePaths.has(rel)
  })

  const orphanAbs = new Set(orphanFiles)

  const allDirs = await collectSubdirs(skillDir)
  const removableDirs: string[] = []
  for (const d of allDirs) {
    if (await dirOnlyOrphansOrEmpty(d, skillDir, orphanAbs)) {
      removableDirs.push(d)
    }
  }

  if (check) {
    checkDirty.push(...orphanFiles, ...removableDirs)
    return { removed, checkDirty }
  }

  for (const f of orphanFiles) {
    await unlink(f)
    removed.push(f)
  }

  let progress = true
  while (progress) {
    progress = false
    const dirs = (await collectSubdirs(skillDir)).sort((a, b) => b.length - a.length)
    for (const d of dirs) {
      const n = await readdir(d)
      if (n.length === 0) {
        await rmdir(d)
        removed.push(d)
        progress = true
      }
    }
  }

  return { removed, checkDirty }
}
