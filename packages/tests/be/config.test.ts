import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  loadConfig,
  loadEnv,
  mergeConfig,
  parseEnv
} from '@cat-kit/be/src/config'

describe('@cat-kit/be config utilities', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'cat-kit-config-'))
  })

  it('loads env files respecting priority', async () => {
    await writeFile(join(tempDir, '.env'), 'FOO=bar', 'utf8')
    await writeFile(join(tempDir, '.env.local'), 'FOO=baz\nBAR=1', 'utf8')

    const env = await loadEnv({ cwd: tempDir, injectToProcess: false })
    expect(env).toEqual({ FOO: 'baz', BAR: '1' })
  })

  it('parses env variables with schema', () => {
    const schema = {
      ENABLED: { type: 'boolean', default: false },
      PORT: { type: 'number', default: 3000 },
      TAGS: { type: 'array', delimiter: ';', default: [] as string[] },
      META: { type: 'json', default: { foo: 'bar' } }
    }

    const source = {
      ENABLED: 'true',
      PORT: '8080',
      TAGS: 'a;b;c',
      META: '{"foo":"baz"}'
    }

    const parsed = parseEnv(schema, source)
    expect(parsed).toEqual({
      ENABLED: true,
      PORT: 8080,
      TAGS: ['a', 'b', 'c'],
      META: { foo: 'baz' }
    })
  })

  it('loads config files with YAML support', async () => {
    const file = join(tempDir, 'config.yaml')
    await writeFile(file, 'foo: bar\nnested:\n  value: 1', 'utf8')

    const config = await loadConfig<{ foo: string; nested: { value: number } }>(
      file
    )

    expect(config).toEqual({ foo: 'bar', nested: { value: 1 } })
  })

  it('deep merges configuration objects', () => {
    const result = mergeConfig(
      { foo: { value: 1 }, arr: [1, 2] },
      { foo: { extra: true }, arr: [3] }
    )

    expect(result).toEqual({
      foo: { value: 1, extra: true },
      arr: [3]
    })
  })
})

