function getDecimalPartByPrecision(raw, precision) {
    let roundUp = false;
    if (raw.length === precision) {
    }
    else if (raw.length < precision) {
        raw = raw.padEnd(precision, '0');
    }
    else {
        raw = String(Math.round(+(raw.slice(0, precision) + '.' + raw.slice(precision))));
        if (raw.length > precision) {
            roundUp = true;
            raw = raw.slice(1);
        }
        else if (raw.length < precision) {
            raw = raw.padStart(precision, '0');
        }
    }
    return [raw, roundUp];
}
function getDecimalPartByMinMaxPrecision(raw, config) {
    let roundUp = false;
    if (!config)
        return [raw, roundUp];
    const { minPrecision, maxPrecision } = config;
    if (maxPrecision !== undefined && raw.length > maxPrecision) {
        ;
        [raw, roundUp] = getDecimalPartByPrecision(raw, maxPrecision);
        raw = String(+`0.${raw}`).slice(2);
    }
    if (minPrecision !== undefined && raw.length < minPrecision) {
        raw = raw.padEnd(minPrecision, '0');
    }
    return [raw, roundUp];
}
/**
 * 获取浮点数的小数部分
 * @param raw 小数部分的原始字符串
 * @param config 配置
 * @returns
 */
function getDecimalPart(raw, config) {
    const { precision, minPrecision, maxPrecision } = config;
    if (precision !== undefined) {
        return getDecimalPartByPrecision(raw, precision);
    }
    return getDecimalPartByMinMaxPrecision(raw, {
        maxPrecision,
        minPrecision
    });
}
function toFixed(v, precision) {
    let [int, decimal = ''] = String(v).split('.');
    const [decimalPart, roundUp] = getDecimalPart(decimal, typeof precision === 'number' ? { precision } : precision);
    if (roundUp) {
        int = String(+int + 1);
    }
    if (!decimalPart)
        return int;
    return int + '.' + decimalPart;
}
const CN_UPPER_NUM = '零壹贰叁肆伍陆柒捌玖';
const CN_INT_RADICE = ['', '拾', '佰', '仟'];
const CN_INT_UNITS = ['', '万', '亿', '兆'];
const CN_DEC_UNITS = ['角', '分', '毫', '厘'];
const CurrencyFormatters = {
    CNY(num, config) {
        const isNegative = num < 0;
        num = Math.abs(num);
        let [intPart, decimal = ''] = String(num).split('.');
        const [decimalPart, roundUp] = getDecimalPart(decimal, config || {});
        if (roundUp) {
            intPart = String(+intPart + 1);
        }
        let result = '';
        for (let i = intPart.length; i > 0; i -= 3) {
            result = ',' + intPart.slice(i - 3 < 0 ? 0 : i - 3, i) + result;
        }
        result = result.slice(1);
        if (isNegative) {
            result = '-' + result;
        }
        if (decimalPart) {
            result = result + '.' + decimalPart;
        }
        return result;
    },
    CNY_HAN(num, config) {
        if (!num)
            return '零元整';
        let result = '';
        if (num >= 999999999999999.9999)
            return result;
        // 是否为负数
        const isNegative = num < 0;
        let [intPart, decPart] = toFixed(num, config?.precision !== undefined
            ? config.precision > 4
                ? 4
                : config.precision
            : 4).split('.');
        if (isNegative) {
            intPart = intPart.slice(1);
        }
        let count = 0;
        const IntLen = intPart.length;
        for (let i = 0; i < IntLen; i++) {
            let n = intPart.substring(i, i + 1);
            let p = IntLen - i - 1;
            let q = p / 4;
            let m = p % 4;
            if (n === '0') {
                count++;
            }
            else {
                if (count > 0) {
                    result += CN_UPPER_NUM[0];
                }
                count = 0;
                result += CN_UPPER_NUM[parseInt(n)] + CN_INT_RADICE[m];
            }
            if (m === 0 && count < 4) {
                result += CN_INT_UNITS[q];
            }
        }
        result = `${result}元`;
        if (isNegative) {
            result = `负${result}`;
        }
        if (decPart) {
            const decLen = decPart.length;
            for (let i = 0; i < decLen; i++) {
                let n = decPart.substring(i, i + 1);
                if (n !== '0')
                    result += CN_UPPER_NUM[Number(n)] + CN_DEC_UNITS[i];
            }
        }
        else {
            result = `${result}整`;
        }
        return result;
    }
};
class Num {
    v;
    constructor(n) {
        this.v = n;
    }
    currency(currencyType, config) {
        if (typeof config === 'number') {
            config = {
                precision: config
            };
        }
        return CurrencyFormatters[currencyType](this.v, config);
    }
    /**
     * 指定数字最大保留几位小数点
     * @param precision 位数
     */
    fixed(precision) {
        return toFixed(this.v, precision);
    }
    /**
     * 遍历数字
     */
    each(fn) {
        const { v } = this;
        for (let i = 1; i <= v; i++) {
            fn(i);
        }
        return this;
    }
    /**
     * 大小区间
     * @param min 最小值
     * @param max 最大值
     * @returns 一个在指定范围内的值
     */
    range(min, max) {
        if (min > max) {
            ;
            [min, max] = [max, min];
        }
        if (this.v < min)
            return min;
        if (this.v > max)
            return max;
        return this.v;
    }
    /**
     * 限制最大值
     * @param val 最大值
     * @returns 一个不超过最大值的值
     */
    max(val) {
        if (this.v > val)
            return val;
        return this.v;
    }
    /**
     * 限制最小值
     * @param val 最小值
     * @returns  一个不小于最小值的值
     */
    min(val) {
        if (this.v < val)
            return val;
        return this.v;
    }
}
/**
 * 包裹一个数字以方便
 */
export function n(n) {
    return new Num(n);
}
/**
 * 将浮点数转换为整数, 并返回对齐后的整数和系数
 */
function int(numbers) {
    const numberStrings = numbers.map(n => String(n));
    const numStringsLen = numberStrings.map(ns => ns.split('.')[1]?.length ?? 0);
    const factor = Math.pow(10, Math.max(...numStringsLen));
    return {
        /** 整数 */
        ints: numbers.map(n => Math.round(n * factor)),
        /** 让所有数值成为整数的最小系数 */
        factor
    };
}
export const $n = {
    formatter(options) {
        const formatter = new Intl.NumberFormat('zh-CN', {
            notation: options.notation,
            style: options.style,
            maximumFractionDigits: options.maximumFractionDigits ?? options.precision,
            minimumFractionDigits: options.minimumFractionDigits ?? options.precision,
            currency: options.style === 'currency'
                ? options.currency ?? 'CNY'
                : options.currency
        });
        return formatter;
    },
    /**
     * 依次相加
     * @param numbers 数字
     * @returns
     */
    plus(...numbers) {
        let i = 0;
        let result = 0;
        const { ints, factor } = int(numbers);
        while (i < ints.length) {
            result += ints[i];
            i++;
        }
        return result / factor;
    },
    /**
     * 依次相减
     * @param numbers 数字
     * @returns
     */
    minus(...numbers) {
        let i = 0;
        let { ints, factor } = int(numbers);
        let result = ints[0];
        ints = ints.slice(1);
        while (i < ints.length) {
            result -= ints[i];
            i++;
        }
        return result / factor;
    },
    /**
     * 两数相乘
     * @param num1 数字1
     * @param num2 数字2
     * @returns
     */
    mul(num1, num2) {
        let { ints: [int1, int2], factor } = int([num1, num2]);
        let result = int1 * int2;
        return result / (factor * factor);
    },
    /**
     * 两数相除
     * @param num1 数字1
     * @param num2 数字2
     * @returns
     */
    div(num1, num2) {
        const { ints } = int([num1, num2]);
        return ints[0] / ints[1];
    },
    /**
     * 求和
     * @param numbers 需要求和的数字
     * @returns
     */
    sum(...numbers) {
        return $n.plus(...numbers);
    }
};
