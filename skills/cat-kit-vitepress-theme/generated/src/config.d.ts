import type { UserConfig } from 'vitepress';
export interface CatKitThemeOptions {
    /** examples 目录的绝对路径 */
    examplesDir: string;
}
/**
 * 定义 CatKit VitePress 主题配置
 *
 * 返回 markdown 和 vite 配置片段，消费者在 VitePress config 中合并使用
 */
export declare function defineThemeConfig(options: CatKitThemeOptions): Partial<UserConfig>;
export { demoContainer } from './markdown/demo-container.js';
export type { DemoContainerOptions } from './markdown/demo-container.js';
export { mermaidPlugin } from './markdown/mermaid.js';
export { importExamples } from './plugins/import-examples.js';
export type { ImportExamplesOptions } from './plugins/import-examples.js';
