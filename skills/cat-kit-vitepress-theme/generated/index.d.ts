import { _default } from "./packages/vitepress-theme/src/components/CatKitLayout.vue.js";
import { LogEntry, UseConsoleInterceptorOptions, useConsoleInterceptor } from "./packages/vitepress-theme/src/composables/useConsoleInterceptor.js";
import { useFullscreen } from "./packages/vitepress-theme/src/composables/useFullscreen.js";
import { UseDraggableOptions, useDraggable } from "./packages/vitepress-theme/src/composables/useDraggable.js";
import * as vue from "vue";
import * as vitepress from "vitepress";

//#region src/index.d.ts
declare const _default$1: {
  extends: {
    Layout: vue.DefineComponent;
    enhanceApp: (ctx: vitepress.EnhanceAppContext) => void;
  };
  Layout: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
  enhanceApp({
    app
  }: {
    app: any;
  }): void;
};
//#endregion
export { _default as CatKitLayout, LogEntry, UseConsoleInterceptorOptions, UseDraggableOptions, _default$1 as default, useConsoleInterceptor, useDraggable, useFullscreen };
//# sourceMappingURL=index.d.ts.map