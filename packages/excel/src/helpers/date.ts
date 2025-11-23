/**
 * 日期格式处理工具函数
 */

/**
 * 将 Date 对象转换为 Excel 日期数字
 *
 * Excel 日期从 1900-01-01 开始计数（实际上从 1899-12-30 开始，因为有闰年 bug）
 *
 * @param date - 要转换的日期
 * @returns Excel 日期数字
 */
export function dateToExcelNumber(date: Date): number {
  // Excel 的基准日期（1899-12-30）
  const epoch = new Date(Date.UTC(1899, 11, 30)).getTime()
  const days = (date.getTime() - epoch) / (24 * 60 * 60 * 1000)

  // 处理 Excel 的 1900 年闰年 bug
  // Excel 错误地将 1900 年当作闰年，所以 1900-03-01 之后的日期需要加 1
  if (days >= 61) {
    return days + 1
  }

  return days
}

/**
 * 将 Excel 日期数字转换为 Date 对象
 *
 * @param excelDate - Excel 日期数字
 * @returns Date 对象
 */
export function excelNumberToDate(excelDate: number): Date {
  // Excel 的基准日期（1899-12-30）
  const epoch = new Date(Date.UTC(1899, 11, 30)).getTime()

  // 处理 Excel 的 1900 年闰年 bug
  let days = excelDate
  if (days >= 61) {
    days -= 1
  }

  const milliseconds = days * 24 * 60 * 60 * 1000
  return new Date(epoch + milliseconds)
}

/**
 * Excel 内置日期格式 ID
 *
 * 参考：https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.spreadsheet.numberingformat
 */
export const DATE_FORMAT_IDS = new Set([
  14, // m/d/yy
  15, // d-mmm-yy
  16, // d-mmm
  17, // mmm-yy
  18, // h:mm AM/PM
  19, // h:mm:ss AM/PM
  20, // h:mm
  21, // h:mm:ss
  22, // m/d/yy h:mm
  27, // yyyy年m月
  28, // m月d日
  29, // m月d日
  30, // m-d-yy
  31, // yyyy年m月d日
  32, // h时mm分
  33, // h时mm分ss秒
  34, // 上午/下午h时mm分
  35, // 上午/下午h时mm分ss秒
  36, // yyyy年m月
  45, // mm:ss
  46, // [h]:mm:ss
  47, // mm:ss.0
  50, // yyyy年m月
  51, // m月d日
  52, // yyyy年m月
  53, // m月d日
  54, // m月d日
  55, // 上午/下午h时mm分
  56, // 上午/下午h时mm分ss秒
  57, // yyyy年m月
  58 // m月d日
])

/**
 * 判断数字格式是否为日期格式
 *
 * @param numFmtId - 数字格式 ID
 * @param numFmt - 数字格式字符串（可选）
 * @returns 是否为日期格式
 */
export function isDateFormat(numFmtId?: number, numFmt?: string): boolean {
  // 检查内置日期格式 ID
  if (numFmtId !== undefined && DATE_FORMAT_IDS.has(numFmtId)) {
    return true
  }

  // 检查自定义格式字符串是否包含日期关键字
  if (numFmt) {
    const datePatterns = /[ymd]|h:mm|hh:mm|mmm|mmmm|am\/pm|a\/p/i
    return datePatterns.test(numFmt)
  }

  return false
}

/**
 * 默认日期格式
 */
export const DEFAULT_DATE_FORMAT = 'yyyy-mm-dd'

/**
 * 默认日期时间格式
 */
export const DEFAULT_DATETIME_FORMAT = 'yyyy-mm-dd hh:mm:ss'
