import { Plugin } from "vitepress";

//#region src/plugins/import-examples.d.ts
interface ImportExamplesOptions {
  /** examples 目录的绝对路径 */
  examplesDir: string;
}
declare function importExamples(options: ImportExamplesOptions): Plugin;
//#endregion
export { ImportExamplesOptions, importExamples };
//# sourceMappingURL=import-examples.d.ts.map