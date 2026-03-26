import { existsSync } from 'node:fs'
import path from 'node:path'

import { visualizer } from 'rollup-plugin-visualizer'
import { build } from 'tsdown'

import type { BuildConfig } from './types'

export async function buildLib(config: BuildConfig) {
  const start = Date.now()

  const { dir, dts, deps, output, platform = 'neutral' } = config

  if (!path.isAbsolute(dir)) {
    throw new Error('dir 必须是绝对路径')
  }

  try {
    const outDir = output?.dir || 'dist'
    const requestedEntries = config.entry
      ? Array.isArray(config.entry)
        ? config.entry
        : [config.entry]
      : ['src/index.ts', 'index.ts']
    const entries = requestedEntries
      .map((entry) => {
        const resolvedEntry = path.isAbsolute(entry) ? entry : path.resolve(dir, entry)
        return existsSync(resolvedEntry)
          ? path.isAbsolute(entry)
            ? path.relative(dir, entry)
            : entry
          : null
      })
      .filter((entry): entry is string => entry !== null)

    if (entries.length === 0) {
      throw new Error('入口文件未找到')
    }

    await build({
      entry: entries.length === 1 ? entries[0] : entries,
      outDir,
      cwd: dir,
      root: config.root ? path.resolve(dir, config.root) : undefined,
      dts: dts !== false,
      sourcemap: output?.sourcemap !== false,
      deps,
      outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
      format: 'es',
      platform,
      minify: true,
      logLevel: 'warn',

      outputOptions: { preserveModules: true },

      plugins: [
        visualizer({
          filename: path.resolve(dir, outDir, 'stats.html'),
          title: 'Cat-Kit Bundle 分析'
        }),
        ...(config.plugins || [])
      ]
    })

    return { success: true, duration: Date.now() - start }
  } catch (err) {
    return {
      success: false,
      duration: Date.now() - start,
      error: err instanceof Error ? err : new Error(String(err))
    }
  }
}
