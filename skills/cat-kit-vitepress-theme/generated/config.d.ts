import { DemoContainerOptions, demoContainer } from "./packages/vitepress-theme/src/markdown/demo-container.js";
import { mermaidPlugin } from "./packages/vitepress-theme/src/markdown/mermaid.js";
import { ImportExamplesOptions, importExamples } from "./packages/vitepress-theme/src/plugins/import-examples.js";
import { UserConfig } from "vitepress";

//#region src/config.d.ts
interface CatKitThemeOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string;
}
/**
 * 定义 CatKit VitePress 主题配置
 *
 * 返回 markdown 和 vite 配置片段，消费者在 VitePress config 中合并使用
 */
declare function defineThemeConfig(options: CatKitThemeOptions): Partial<UserConfig>;
//#endregion
export { CatKitThemeOptions, type DemoContainerOptions, type ImportExamplesOptions, defineThemeConfig, demoContainer, importExamples, mermaidPlugin };
//# sourceMappingURL=config.d.ts.map