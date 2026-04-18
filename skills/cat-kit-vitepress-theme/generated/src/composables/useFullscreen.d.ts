/**
 * 全屏模式 composable
 */
export declare function useFullscreen(): {
    isFullscreen: import("vue").Ref<boolean, boolean>;
    enter: () => void;
    exit: () => void;
};
