import path from '../path/path'
import { isArray, isString } from './data-type'
/**
 * 引入静态图片
 * @param src 图片路径，默认为/src/assets
 * @param img 图片名称
 * @param type 图片格式，默认为jpg
 */
export function requireImg(
  img: string | string[],
  src: string = '/src/assets',
  type: string = 'jpg'
) {
  if (isString(img)) {
    return new URL(`${path.join(src, img)}.${type}`, import.meta.url).href
  } else if (isArray(img)) {
    return img.map((item) => {
      return new URL(`${path.join(src, item)}.${type}`, import.meta.url).href
    })
  }
}
