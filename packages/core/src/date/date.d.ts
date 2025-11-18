type DateCompareReducer<R> = (timeDiff: number) => R;
export declare class Dater {
    private date;
    constructor(date: number | string | Date | Dater);
    /** 原始日期对象 */
    get raw(): Date;
    private static matchers;
    /** 时间戳 */
    get timestamp(): number;
    setTime(timestamp: number): Dater;
    /** 年 */
    get year(): number;
    /**
     * 设置年份
     * @param year 年份
     * @returns
     */
    setYear(year: number): Dater;
    /** 月 */
    get month(): number;
    /**
     * 设置月份
     * @param month 月份，从1开始
     * @returns
     */
    setMonth(month: number): Dater;
    /** 周 */
    get weekDay(): number;
    /** 日 */
    get day(): number;
    /**
     * 设置日
     * @param day 日, 如果为0则表示上个月的最后一天
     * @returns
     */
    setDay(day: number): Dater;
    /** 时 */
    get hours(): number;
    /**
     * 设置小时
     * @param hours 时
     * @returns
     */
    setHours(hours: number): Dater;
    /** 分 */
    get minutes(): number;
    /**
     * 设置分
     * @param minutes 分
     */
    setMinutes(minutes: number): Dater;
    /** 秒 */
    get seconds(): number;
    /**
     * 设置秒
     * @param sec 秒
     */
    setSeconds(sec: number): Dater;
    /** 格式化日期 */
    format(formatter?: string): string;
    /**
     * 计算相对此刻的日期
     * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
     * @param type 时间步长类别, 默认以天为单位
     */
    calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years'): Dater;
    /**
     * 比较日期, 并返回天数差
     * @param date 日期
     * @returns 天数差
     */
    compare(date: string | Date | number | Dater): number;
    /**
     * 比较日期, 返回自定义结果
     * @param date 日期
     * @param reducer 处理器
     * @returns 自定义结果
     */
    compare<R>(date: string | Date | number | Dater, reducer: DateCompareReducer<R>): R;
    /**
     * 跳转至月尾
     * @param offsetMonth 月份偏移量，默认为0，即当月
     */
    toEndOfMonth(offsetMonth?: number): Dater;
    /**
     * 获取这个月的天数
     */
    getDays(): number;
}
/** 日期 */
export declare function date(d?: number | string | Date | Dater): Dater;
export {};
