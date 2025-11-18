/**
 * 防抖
 * @param fn 要调用的目标函数
 * @param delay 延迟时间
 * @param immediate 是否立即调用一次, 默认true
 * @returns
 */
export function debounce(fn, delay = 300, immediate = true) {
    let timer = undefined;
    return function (...args) {
        timer !== undefined && clearTimeout(timer);
        if (immediate) {
            // 空闲中
            let isFree = timer === undefined;
            // 如果在开头已经调用则定时器中不再触发调用
            let hasCall = false;
            if (isFree) {
                fn.call(this, ...args);
                hasCall = true;
            }
            timer = setTimeout(() => {
                timer = undefined;
                !hasCall && fn.call(this, ...args);
            }, delay);
        }
        else {
            timer = setTimeout(() => {
                fn.call(this, ...args);
            }, delay);
        }
    };
}
/**
 * 节流
 * @param fn 要调用的目标函数
 * @param delay 间隔时间
 * @param cb 结果回调
 * @returns
 */
export function throttle(fn, delay = 300, cb) {
    let start = Date.now();
    let result;
    return function (...args) {
        let current = Date.now();
        if (current - start >= delay) {
            start = current;
            result = fn.call(this, ...args);
            cb?.(result);
        }
        return result;
    };
}
/**
 * 睡眠一定时间
 * @param ms 毫秒数
 * @returns
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
