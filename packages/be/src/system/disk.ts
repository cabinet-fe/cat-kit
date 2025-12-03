import { execFile } from 'node:child_process'
import { statfs } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

export interface DiskInfo {
  path: string
  total: number
  free: number
  used: number
  usedPercent: number
}

const execFileAsync = promisify(execFile)

async function getDiskInfoUnix(path: string): Promise<DiskInfo> {
  const stats = await statfs(path)
  const blockSize = Number(stats.bsize ?? stats.f_bsize ?? 1)
  const totalBlocks = Number(stats.blocks ?? stats.f_blocks ?? 0)
  const freeBlocks = Number(stats.bfree ?? stats.f_bfree ?? 0)

  const total = blockSize * totalBlocks
  const free = blockSize * freeBlocks
  const used = Math.max(total - free, 0)

  return {
    path,
    total,
    free,
    used,
    usedPercent: total === 0 ? 0 : (used / total) * 100
  }
}

function resolveDriveLetter(path: string): string {
  const match = path.match(/^[a-zA-Z]:/)
  if (match) {
    return match[0][0]!.toUpperCase()
  }
  const cwdMatch = process.cwd().match(/^[a-zA-Z]:/)
  return cwdMatch ? cwdMatch[0][0]!.toUpperCase() : 'C'
}

async function getDiskInfoWindows(path: string): Promise<DiskInfo> {
  const drive = resolveDriveLetter(path)
  const script = `Get-PSDrive -Name '${drive}' | Select-Object Used,Free | ConvertTo-Json -Compress`

  const { stdout } = await execFileAsync('powershell', [
    '-NoProfile',
    '-Command',
    script
  ])

  const data = JSON.parse(stdout.trim())
  const used = Number(data.Used ?? 0)
  const free = Number(data.Free ?? 0)
  const total = used + free

  return {
    path: `${drive}:\\`,
    total,
    free,
    used,
    usedPercent: total === 0 ? 0 : (used / total) * 100
  }
}

export async function getDiskInfo(path = process.cwd()): Promise<DiskInfo> {
  const resolvedPath = resolve(path)

  if (process.platform === 'win32') {
    return getDiskInfoWindows(resolvedPath)
  }

  try {
    return await getDiskInfoUnix(resolvedPath)
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ERR_METHOD_NOT_IMPLEMENTED' &&
      process.platform === 'win32'
    ) {
      return getDiskInfoWindows(resolvedPath)
    }

    throw error
  }
}

