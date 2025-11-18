/**
 * 获取当前运行环境
 * @returns 'browser' | 'node' | 'unknown'
 */
export function getRuntime() {
    if (typeof window !== 'undefined') {
        return 'browser';
    }
    if (typeof process !== 'undefined') {
        return 'node';
    }
    return 'unknown';
}
/**
 * 判断是否在浏览器中运行
 * @returns 是否在浏览器中运行
 */
export function isInBrowser() {
    return getRuntime() === 'browser';
}
/**
 * 判断是否在node环境中运行
 * @returns 是否在node环境中运行
 */
export function isInNode() {
    return getRuntime() === 'node';
}
/**
 * 获取操作系统类型
 * @returns 操作系统类型
 */
export function getOSType() {
    if (isInBrowser()) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        // 移动设备检测
        if (/android/i.test(userAgent)) {
            return 'Android';
        }
        if (/iphone|ipad|ipod/i.test(userAgent)) {
            return 'iOS';
        }
        // 桌面系统检测
        if (/win/i.test(userAgent)) {
            return 'Windows';
        }
        if (/mac/i.test(userAgent)) {
            return 'MacOS';
        }
        if (/linux|x11/i.test(userAgent)) {
            return 'Linux';
        }
    }
    if (isInNode()) {
        const platform = process.platform;
        if (platform === 'win32') {
            return 'Windows';
        }
        if (platform === 'darwin') {
            return 'MacOS';
        }
        if (platform === 'linux') {
            return 'Linux';
        }
        if (platform === 'android') {
            return 'Android';
        }
    }
    return 'Unknown';
}
/**
 * 获取设备类型
 * @returns 设备类型
 */
export function getDeviceType() {
    if (isInBrowser()) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        // 检测是否为移动设备
        if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            return 'Mobile';
        }
        // 检测是否为平板设备
        if (/ipad|tablet|playbook|silk/i.test(userAgent) ||
            (/android/i.test(userAgent) && !/mobile/i.test(userAgent))) {
            return 'Tablet';
        }
        // 默认为桌面设备
        return 'Desktop';
    }
    // 在 Node.js 环境中无法准确判断设备类型
    return 'Unknown';
}
/**
 * 获取浏览器类型
 * @returns 浏览器类型
 */
export function getBrowserType() {
    if (!isInBrowser()) {
        return 'Unknown';
    }
    const userAgent = window.navigator.userAgent;
    if (/Edge/i.test(userAgent)) {
        return 'Edge';
    }
    if (/Chrome/i.test(userAgent) && !/Chromium|Edg/i.test(userAgent)) {
        return 'Chrome';
    }
    if (/Firefox/i.test(userAgent)) {
        return 'Firefox';
    }
    if (/Safari/i.test(userAgent) && !/Chrome|Chromium/i.test(userAgent)) {
        return 'Safari';
    }
    if (/MSIE|Trident/i.test(userAgent)) {
        return 'IE';
    }
    if (/Opera|OPR/i.test(userAgent)) {
        return 'Opera';
    }
    return 'Unknown';
}
/**
 * 获取浏览器版本
 * @returns 浏览器版本号或 null
 */
export function getBrowserVersion() {
    if (!isInBrowser()) {
        return null;
    }
    const userAgent = window.navigator.userAgent;
    const browserType = getBrowserType();
    let match = null;
    switch (browserType) {
        case 'Chrome':
            match = userAgent.match(/Chrome\/(\d+\.\d+)/);
            break;
        case 'Firefox':
            match = userAgent.match(/Firefox\/(\d+\.\d+)/);
            break;
        case 'Safari':
            match = userAgent.match(/Version\/(\d+\.\d+)/);
            break;
        case 'Edge':
            match =
                userAgent.match(/Edg\/(\d+\.\d+)/) ||
                    userAgent.match(/Edge\/(\d+\.\d+)/);
            break;
        case 'IE':
            match =
                userAgent.match(/MSIE (\d+\.\d+)/) || userAgent.match(/rv:(\d+\.\d+)/);
            break;
        case 'Opera':
            match =
                userAgent.match(/OPR\/(\d+\.\d+)/) ||
                    userAgent.match(/Opera\/(\d+\.\d+)/);
            break;
    }
    return match && match[1] ? match[1] : null;
}
/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobile() {
    return getDeviceType() === 'Mobile';
}
/**
 * 检查是否为平板设备
 * @returns 是否为平板设备
 */
export function isTablet() {
    return getDeviceType() === 'Tablet';
}
/**
 * 检查是否为桌面设备
 * @returns 是否为桌面设备
 */
export function isDesktop() {
    return getDeviceType() === 'Desktop';
}
/**
 * 检查是否支持触摸事件
 * @returns 是否支持触摸事件
 */
export function isTouchDevice() {
    if (!isInBrowser()) {
        return false;
    }
    return ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0);
}
/**
 * 获取 Node.js 版本
 * @returns Node.js 版本或 null
 */
export function getNodeVersion() {
    if (!isInNode()) {
        return null;
    }
    return process.version.slice(1); // 移除版本号前的 'v'
}
/**
 * 获取环境信息摘要
 * @returns 环境信息对象
 */
export function getEnvironmentSummary() {
    const runtime = getRuntime();
    const summary = {
        runtime,
        os: getOSType()
    };
    if (runtime === 'browser') {
        summary.browser = getBrowserType();
        summary.browserVersion = getBrowserVersion();
        summary.device = getDeviceType();
        summary.touchSupported = isTouchDevice();
    }
    else if (runtime === 'node') {
        summary.nodeVersion = getNodeVersion();
    }
    return summary;
}
