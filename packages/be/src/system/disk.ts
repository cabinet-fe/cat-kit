import { execFile } from 'node:child_process'
import { statfs } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

/**
 * 磁盘信息
 */
export interface DiskInfo {
  /** 磁盘路径 */
  path: string
  /** 总容量（字节） */
  total: number
  /** 空闲容量（字节） */
  free: number
  /** 已用容量（字节） */
  used: number
  /** 使用率（百分比） */
  usedPercent: number
}

const execFileAsync = promisify(execFile)

async function getDiskInfoUnix(path: string): Promise<DiskInfo> {
  const stats = await statfs(path)

  const blockSize = Number(stats.bsize)
  const total = blockSize * Number(stats.blocks)
  // bavail: 非特权用户可用的空闲块数，与 df 输出一致
  const free = blockSize * Number(stats.bavail)
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

/**
 * 获取指定路径所在磁盘的容量信息
 *
 * 支持 Windows 和 Unix 系统。Windows 使用 PowerShell 查询，Unix 使用 `statfs`。
 *
 * @param path - 目标路径，默认使用当前工作目录
 * @returns 磁盘容量、剩余与使用信息
 * @throws {Error} 当无法获取磁盘信息时抛出错误
 */
export async function getDiskInfo(path = process.cwd()): Promise<DiskInfo> {
  const resolvedPath = resolve(path)

  if (process.platform === 'win32') {
    return getDiskInfoWindows(resolvedPath)
  }

  return getDiskInfoUnix(resolvedPath)
}
