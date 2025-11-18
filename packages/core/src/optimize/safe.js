export function safeRun(fn, defaultVal) {
    try {
        return fn();
    }
    catch {
        return defaultVal;
    }
}
