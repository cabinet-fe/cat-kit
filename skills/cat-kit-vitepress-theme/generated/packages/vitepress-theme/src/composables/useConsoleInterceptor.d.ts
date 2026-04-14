import { Ref } from "vue";

//#region src/composables/useConsoleInterceptor.d.ts
interface LogEntry {
  id: number;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  args: unknown[];
  timestamp: number;
}
interface UseConsoleInterceptorOptions {
  /** 是否激活拦截 */
  active: Ref<boolean>;
  /** 控制台容器引用，用于自动滚动 */
  containerRef?: Ref<HTMLElement | undefined>;
}
/**
 * Console 拦截器 composable
 * 拦截 console 输出并收集日志
 */
declare function useConsoleInterceptor(options: UseConsoleInterceptorOptions): {
  logs: Ref<{
    id: number;
    type: "log" | "warn" | "error" | "info" | "debug";
    args: unknown[];
    timestamp: number;
  }[], LogEntry[] | {
    id: number;
    type: "log" | "warn" | "error" | "info" | "debug";
    args: unknown[];
    timestamp: number;
  }[]>;
  clearLogs: () => void;
};
//#endregion
export { LogEntry, UseConsoleInterceptorOptions, useConsoleInterceptor };
//# sourceMappingURL=useConsoleInterceptor.d.ts.map