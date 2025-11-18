type CurrencyType = 'CNY' | 'CNY_HAN';
type CurrencyConfig = {
    /** 保留小数位数 */
    precision?: number;
    /** 最小小数位数 */
    minPrecision?: number;
    /** 最大小数位数 */
    maxPrecision?: number;
};
declare class Num {
    private v;
    constructor(n: number);
    /**
     * 数字转货币
     * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
     * @param config 其他配置, 仅precision对CNY_HAN生效
     * @returns
     */
    currency(currencyType: CurrencyType, config: CurrencyConfig): string;
    /**
     * 数字转货币
     * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
     * @param precision 精度, 为CNY_HAN时最大和默认只能支持到小数点后四位(厘)
     * @returns
     */
    currency(currencyType: CurrencyType, precision?: number): string;
    /**
     * 指定数字最大保留几位小数点
     * @param precision 位数
     */
    fixed(precision: number | {
        /** 最小精度 */
        minPrecision?: number;
        /** 最大精度 */
        maxPrecision?: number;
    }): string;
    /**
     * 遍历数字
     */
    each(fn: (n: number) => void): Num;
    /**
     * 大小区间
     * @param min 最小值
     * @param max 最大值
     * @returns 一个在指定范围内的值
     */
    range(min: number, max: number): number;
    /**
     * 限制最大值
     * @param val 最大值
     * @returns 一个不超过最大值的值
     */
    max(val: number): number;
    /**
     * 限制最小值
     * @param val 最小值
     * @returns  一个不小于最小值的值
     */
    min(val: number): number;
}
/**
 * 包裹一个数字以方便
 */
export declare function n(n: number): Num;
interface NumberFormatterOptions {
    /** 数字格式的样式 decimal:十进制, currency货币, percent百分比 */
    style?: 'decimal' | 'currency' | 'percent';
    /** 货币符号, 如果style为currency则默认CNY人民币 */
    currency?: 'CNY' | 'USD' | 'JPY' | 'EUR';
    /** 小数精度(小数点位数) */
    precision?: number;
    /** 最大小数位数, 默认3 */
    maximumFractionDigits?: number;
    /** 最小小数位数 */
    minimumFractionDigits?: number;
    /** 表现方法, standard: 标准, scientific: 科学计数法, engineering: 引擎, compact: 简洁计数   */
    notation?: Intl.NumberFormatOptions['notation'];
}
export declare const $n: {
    formatter(options: NumberFormatterOptions): Intl.NumberFormat;
    /**
     * 依次相加
     * @param numbers 数字
     * @returns
     */
    plus(...numbers: number[]): number;
    /**
     * 依次相减
     * @param numbers 数字
     * @returns
     */
    minus(...numbers: number[]): number;
    /**
     * 两数相乘
     * @param num1 数字1
     * @param num2 数字2
     * @returns
     */
    mul(num1: number, num2: number): number;
    /**
     * 两数相除
     * @param num1 数字1
     * @param num2 数字2
     * @returns
     */
    div(num1: number, num2: number): number;
    /**
     * 求和
     * @param numbers 需要求和的数字
     * @returns
     */
    sum(...numbers: number[]): number;
};
export {};
