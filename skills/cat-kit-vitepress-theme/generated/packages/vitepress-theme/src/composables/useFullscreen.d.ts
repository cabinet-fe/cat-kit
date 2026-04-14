import * as vue from "vue";

//#region src/composables/useFullscreen.d.ts
/**
 * 全屏模式 composable
 */
declare function useFullscreen(): {
  isFullscreen: vue.Ref<boolean, boolean>;
  enter: () => void;
  exit: () => void;
};
//#endregion
export { useFullscreen };
//# sourceMappingURL=useFullscreen.d.ts.map