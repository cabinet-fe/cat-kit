/**
 * 获取当前运行环境
 * @returns 'browser' | 'node' | 'unknown'
 */
export declare function getRuntime(): 'browser' | 'node' | 'unknown';
/**
 * 判断是否在浏览器中运行
 * @returns 是否在浏览器中运行
 */
export declare function isInBrowser(): boolean;
/**
 * 判断是否在node环境中运行
 * @returns 是否在node环境中运行
 */
export declare function isInNode(): boolean;
/**
 * 操作系统类型
 */
export type OSType = 'Windows' | 'Linux' | 'MacOS' | 'Android' | 'iOS' | 'Unknown';
/**
 * 获取操作系统类型
 * @returns 操作系统类型
 */
export declare function getOSType(): OSType;
/**
 * 设备类型
 */
export type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown';
/**
 * 获取设备类型
 * @returns 设备类型
 */
export declare function getDeviceType(): DeviceType;
/**
 * 浏览器类型
 */
export type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'IE' | 'Opera' | 'Unknown';
/**
 * 获取浏览器类型
 * @returns 浏览器类型
 */
export declare function getBrowserType(): BrowserType;
/**
 * 获取浏览器版本
 * @returns 浏览器版本号或 null
 */
export declare function getBrowserVersion(): string | null;
/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export declare function isMobile(): boolean;
/**
 * 检查是否为平板设备
 * @returns 是否为平板设备
 */
export declare function isTablet(): boolean;
/**
 * 检查是否为桌面设备
 * @returns 是否为桌面设备
 */
export declare function isDesktop(): boolean;
/**
 * 检查是否支持触摸事件
 * @returns 是否支持触摸事件
 */
export declare function isTouchDevice(): boolean;
/**
 * 获取 Node.js 版本
 * @returns Node.js 版本或 null
 */
export declare function getNodeVersion(): string | null;
export type EnvironmentSummary = {
    runtime: 'browser';
    os: OSType;
    browser: BrowserType;
    browserVersion: string | null;
    device: DeviceType;
} | {
    runtime: 'node';
    os: OSType;
    nodeVersion: string | null;
};
/**
 * 获取环境信息摘要
 * @returns 环境信息对象
 */
export declare function getEnvironmentSummary(): Record<string, any>;
