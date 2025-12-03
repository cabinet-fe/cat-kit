import { join } from 'node:path'

import { ensureDir } from '../fs/ensure-dir'
import { readJson, writeJson } from '../fs/json'
import { remove } from '../fs/remove'

interface FileCacheEntry<V> {
  value: V
  expiresAt?: number
  createdAt: number
}

export interface FileCacheOptions {
  dir: string
  /**
   * 默认过期时间（毫秒）
   */
  ttl?: number
  /**
   * 文件后缀
   * @default '.json'
   */
  extension?: string
}

export class FileCache<V> {
  private readonly dir: string

  private readonly ttl?: number

  private readonly extension: string

  constructor(options: FileCacheOptions) {
    this.dir = options.dir
    this.ttl = options.ttl
    this.extension = options.extension ?? '.json'
  }

  private getFilePath(key: string): string {
    const safeKey = encodeURIComponent(key)
    return join(this.dir, `${safeKey}${this.extension}`)
  }

  private isExpired(entry: FileCacheEntry<V>): boolean {
    return !!entry.expiresAt && entry.expiresAt <= Date.now()
  }

  async get(key: string): Promise<V | undefined> {
    const filePath = this.getFilePath(key)

    try {
      const entry = await readJson<FileCacheEntry<V>>(filePath)
      if (this.isExpired(entry)) {
        await remove(filePath, { force: true })
        return undefined
      }
      return entry.value
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined
      }
      throw error
    }
  }

  async set(key: string, value: V, ttl?: number): Promise<void> {
    const ttlValue = ttl ?? this.ttl
    const expiresAt =
      typeof ttlValue === 'number' ? Date.now() + ttlValue : undefined
    const entry: FileCacheEntry<V> = {
      value,
      createdAt: Date.now(),
      expiresAt
    }

    const filePath = this.getFilePath(key)
    await ensureDir(this.dir)
    await writeJson(filePath, entry)
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key)
    try {
      await remove(filePath, { force: true })
      return true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false
      }
      throw error
    }
  }

  async clear(): Promise<void> {
    await remove(this.dir, { force: true })
    await ensureDir(this.dir)
  }
}

