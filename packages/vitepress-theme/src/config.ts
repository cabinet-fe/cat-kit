import type { UserConfig } from 'vitepress'

import { demoContainer, type DemoContainerOptions } from './markdown/demo-container'
import { mermaidPlugin } from './markdown/mermaid'
import { importExamples, type ImportExamplesOptions } from './plugins/import-examples'

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

// @ts-ignore
export { demoContainer } from './markdown/demo-container.ts'
// @ts-ignore
export type { DemoContainerOptions } from './markdown/demo-container.ts'
// @ts-ignore
export { mermaidPlugin } from './markdown/mermaid.ts'
// @ts-ignore
export { importExamples } from './plugins/import-examples.ts'
// @ts-ignore
export type { ImportExamplesOptions } from './plugins/import-examples.ts'
