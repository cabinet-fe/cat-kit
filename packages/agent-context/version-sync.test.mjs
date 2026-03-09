import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

test('cli version should be synced from package.json', async () => {
  const cliSource = await readFile(path.join(currentDir, 'src/cli.ts'), 'utf8')

  assert.match(
    cliSource,
    /package\.json/,
    'cli.ts should reference package.json for version source'
  )

  assert.match(
    cliSource,
    /\.version\(\s*packageVersion\s*\)/,
    'cli.ts should use packageVersion variable in .version()'
  )

  assert.doesNotMatch(
    cliSource,
    /\.version\(\s*['"`][^'"`]+['"`]\s*\)/,
    'cli.ts should not hardcode a literal version string'
  )

  assert.doesNotMatch(
    cliSource,
    /createRequire\(|\brequire\(/,
    'cli.ts should not use CommonJS require APIs'
  )
})
