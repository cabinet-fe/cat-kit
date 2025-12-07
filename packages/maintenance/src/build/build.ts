import { build } from 'tsdown'
import type { BuildConfig } from "./types"
import path from 'node:path'
import fs from 'node:fs/promises'
import { visualizer } from 'rollup-plugin-visualizer'

export async function buildLib(config: BuildConfig) {
  const start = Date.now()

  const { dir, dts, external, output, platform = 'neutral' } = config

  if (!path.isAbsolute(dir)) {
    throw new Error('dir 必须是绝对路径')
  }

  try {
    const outDir = output?.dir || 'dist'
    let entry = path.resolve(dir, config.entry || 'src/index.ts')
    if (!fs.exists(entry)) {
      entry = path.resolve(dir, 'index.ts')
      if (!fs.exists(entry)) {
        throw new Error('入口文件未找到')
      }
    }

    await build({
      entry,
      outDir,
      cwd: dir,
      dts: dts !== false,
      sourcemap: output?.sourcemap !== false,
      external,
      outExtensions: () => ({
        js: '.js',
        dts: '.d.ts'
      }),
      format: 'es',
      platform,
      minify: true,
      logLevel: 'warn',
      plugins: [
        visualizer({
          filename: path.resolve(dir, outDir, 'stats.html'),
          title: 'Cat-Kit Bundle 分析'
        })
      ]
    })

    return {
      success: true,
      duration: Date.now() - start
    }
  } catch (err) {
    return {
      success: false,
      duration: Date.now() - start,
      error: err instanceof Error ? err : new Error(String(err))
    }
  }
}