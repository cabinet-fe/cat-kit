import { MarkdownRenderer } from "vitepress";

//#region src/markdown/demo-container.d.ts
interface DemoContainerOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string;
}
declare const demoContainer: (md: MarkdownRenderer, options: DemoContainerOptions) => Promise<void>;
//#endregion
export { DemoContainerOptions, demoContainer };
//# sourceMappingURL=demo-container.d.ts.map