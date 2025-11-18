import { isDate } from '../data/type';
export class Dater {
    date;
    constructor(date) {
        if (date instanceof Dater) {
            this.date = date.date;
        }
        else if (isDate(date)) {
            this.date = date;
        }
        else {
            this.date = new Date(date);
        }
    }
    /** 原始日期对象 */
    get raw() {
        return this.date;
    }
    static matchers = {
        yyyy: (date) => `${date.year}`,
        YYYY: (date) => `${date.year}`,
        'M+': (date, len) => {
            let month = date.month + '';
            return len === 1 ? month : `0${month}`.slice(-2);
        },
        'd+': (date, len) => {
            let day = date.day + '';
            return len === 1 ? day : `0${day}`.slice(-2);
        },
        'D+': (date, len) => {
            let day = date.day + '';
            return len === 1 ? day : `0${day}`.slice(-2);
        },
        'h+': (date, len) => {
            let hour = date.hours;
            let strHour = (hour > 12 ? hour - 12 : hour) + '';
            return len === 1 ? strHour : `0${strHour}`.slice(-2);
        },
        'H+': (date, len) => {
            let Hour = `${date.hours}`;
            return len === 1 ? Hour : `0${Hour}`.slice(-2);
        },
        'm+': (date, len) => {
            let mih = `${date.minutes}`;
            return len === 1 ? mih : `0${mih}`.slice(-2);
        },
        's+': (date, len) => {
            let sec = `${date.seconds}`;
            return len === 1 ? sec : `0${sec}`.slice(-2);
        }
    };
    /** 时间戳 */
    get timestamp() {
        return this.date.getTime();
    }
    setTime(timestamp) {
        this.date.setTime(timestamp);
        return this;
    }
    /** 年 */
    get year() {
        return this.date.getFullYear();
    }
    /**
     * 设置年份
     * @param year 年份
     * @returns
     */
    setYear(year) {
        this.date.setFullYear(year);
        return this;
    }
    /** 月 */
    get month() {
        return this.date.getMonth() + 1;
    }
    /**
     * 设置月份
     * @param month 月份，从1开始
     * @returns
     */
    setMonth(month) {
        this.date.setMonth(month - 1);
        return this;
    }
    /** 周 */
    get weekDay() {
        return this.date.getDay();
    }
    /** 日 */
    get day() {
        return this.date.getDate();
    }
    /**
     * 设置日
     * @param day 日, 如果为0则表示上个月的最后一天
     * @returns
     */
    setDay(day) {
        this.date.setDate(day);
        return this;
    }
    /** 时 */
    get hours() {
        return this.date.getHours();
    }
    /**
     * 设置小时
     * @param hours 时
     * @returns
     */
    setHours(hours) {
        this.date.setHours(hours);
        return this;
    }
    /** 分 */
    get minutes() {
        return this.date.getMinutes();
    }
    /**
     * 设置分
     * @param minutes 分
     */
    setMinutes(minutes) {
        this.date.setMinutes(minutes);
        return this;
    }
    /** 秒 */
    get seconds() {
        return this.date.getSeconds();
    }
    /**
     * 设置秒
     * @param sec 秒
     */
    setSeconds(sec) {
        this.date.setSeconds(sec);
        return this;
    }
    /** 格式化日期 */
    format(formatter = 'yyyy-MM-dd') {
        Object.keys(Dater.matchers).forEach((reg) => {
            formatter = formatter.replace(new RegExp(`(${reg})`), (str) => {
                return Dater.matchers[reg](this, str.length);
            });
        });
        return formatter;
    }
    /**
     * 计算相对此刻的日期
     * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
     * @param type 时间步长类别, 默认以天为单位
     */
    calc(timeStep, type) {
        let { date } = this;
        if (type === 'days') {
            return new Dater(this.timestamp + timeStep * 86400000);
        }
        else if (type === 'weeks') {
            return new Dater(this.timestamp + timeStep * 604800000);
        }
        else if (type === 'months') {
            date = new Date(date.getTime());
            date.setMonth(timeStep + date.getMonth());
            return new Dater(date);
        }
        else {
            date = new Date(date.getTime());
            date.setFullYear(timeStep + date.getFullYear());
            return new Dater(date);
        }
    }
    compare(date, reducer) {
        let dater = new Dater(date);
        // 计算时间差（毫秒）
        const timeDiff = this.timestamp - dater.timestamp;
        if (!reducer) {
            return Math.ceil(timeDiff / 86400000);
        }
        return reducer(timeDiff);
    }
    /**
     * 跳转至月尾
     * @param offsetMonth 月份偏移量，默认为0，即当月
     */
    toEndOfMonth(offsetMonth = 0) {
        this.date.setMonth(this.month + offsetMonth);
        this.date.setDate(0);
        return this;
    }
    /**
     * 获取这个月的天数
     */
    getDays() {
        const { timestamp } = this;
        const days = this.toEndOfMonth().day;
        this.setTime(timestamp);
        return days;
    }
}
/** 日期 */
export function date(d) {
    return new Dater(d ?? new Date());
}
