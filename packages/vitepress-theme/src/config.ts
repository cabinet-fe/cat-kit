import type { UserConfig } from 'vitepress'

import { demoContainer, type DemoContainerOptions } from './markdown/demo-container.js'
import { mermaidPlugin } from './markdown/mermaid.js'
import { importExamples, type ImportExamplesOptions } from './plugins/import-examples.js'

export interface CatKitThemeOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string
}

/**
 * 定义 CatKit VitePress 主题配置
 *
 * 返回 markdown 和 vite 配置片段，消费者在 VitePress config 中合并使用
 */
export function defineThemeConfig(options: CatKitThemeOptions): Partial<UserConfig> {
  const demoOpts: DemoContainerOptions = { examplesDir: options.examplesDir }
  const importOpts: ImportExamplesOptions = { examplesDir: options.examplesDir }

  return {
    markdown: {
      lineNumbers: true,
      config: async (md) => {
        await demoContainer(md, demoOpts)
        md.use(mermaidPlugin)
      }
    },
    vite: { plugins: [importExamples(importOpts)] }
  }
}

export { demoContainer } from './markdown/demo-container.js'
export type { DemoContainerOptions } from './markdown/demo-container.js'
export { mermaidPlugin } from './markdown/mermaid.js'
export { importExamples } from './plugins/import-examples.js'
export type { ImportExamplesOptions } from './plugins/import-examples.js'
