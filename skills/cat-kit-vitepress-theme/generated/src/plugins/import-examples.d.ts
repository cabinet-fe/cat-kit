import type { Plugin } from 'vitepress';
export interface ImportExamplesOptions {
    /** examples 目录的绝对路径 */
    examplesDir: string;
}
export declare function importExamples(options: ImportExamplesOptions): Plugin;
