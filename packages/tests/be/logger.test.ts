import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Logger, LogLevel, FileTransport, type LogEntry, type Transport } from '@cat-kit/be/src'

class MemoryTransport implements Transport {
  public readonly entries: LogEntry[] = []

  async write(entry: LogEntry): Promise<void> {
    this.entries.push(entry)
  }
}

describe('@cat-kit/be 日志工具', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'cat-kit-logger-'))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('应该记录结构化条目并遵守日志级别', async () => {
    const transport = new MemoryTransport()
    const logger = new Logger({
      level: LogLevel.INFO,
      transports: [transport],
      context: { app: 'test' }
    })

    await logger.debug('hidden')
    await logger.info('visible', { user: 'alice' })

    expect(transport.entries).toHaveLength(1)
    expect(transport.entries[0]).toMatchObject({
      level: LogLevel.INFO,
      message: 'visible',
      meta: { app: 'test', user: 'alice' }
    })
  })

  it('应该使用 FileTransport 将日志写入文件', async () => {
    const logFile = join(tempDir, 'app.log')
    const logger = new Logger({
      format: 'json',
      transports: [new FileTransport({ path: logFile })]
    })

    await logger.error('boom', new Error('fail'))

    const content = await readFile(logFile, 'utf8')
    const parsed = content
      .trim()
      .split('\n')
      .map(line => JSON.parse(line))

    expect(parsed[0]).toMatchObject({
      level: LogLevel.ERROR,
      message: 'boom',
      error: { message: 'fail' }
    })
  })
})
