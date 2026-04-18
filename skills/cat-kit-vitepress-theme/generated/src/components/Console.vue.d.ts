import { type LogEntry } from '../composables';
type __VLS_Props = {
    active?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    clearLogs: () => void;
    logs: import("vue").Ref<{
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
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
