import type { MarkdownRenderer } from 'vitepress';
export interface DemoContainerOptions {
    /** examples 目录的绝对路径 */
    examplesDir: string;
}
export declare const demoContainer: (md: MarkdownRenderer, options: DemoContainerOptions) => Promise<void>;
