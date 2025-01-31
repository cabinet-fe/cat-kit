function loadImage(imageFile: Blob) {
  return new Promise<HTMLImageElement>(rs => {
    const reader = new FileReader()
    let img = new Image()

    img.onload = function () {
      rs(img)
    }

    reader.onload = function () {
      img.src = reader.result as string
    }
    reader.readAsDataURL(imageFile)
  })
}

function compressImageSource(
  img: HTMLImageElement,
  type: string,
  quality: number
) {
  return new Promise<Blob>((rs, rj) => {
    const canvas = document.createElement('canvas')
    const { width, height } = img
    canvas.width = Math.floor(width * quality)
    canvas.height = Math.floor(height * quality)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => (blob ? rs(blob) : rj('压缩失败')), type)
  })
}

/**
 * 压缩图片文件
 * @param file 图片文件
 * @param max 压缩到最大的字节
 */
export async function compressImageFile(file: File, max: number) {
  if (max >= file.size) {
    console.warn(`对文件压缩的目标大小大于文件本身的大小`)
    return file
  }

  let result = file.slice()

  while (result.size > max) {
    let quality = Math.sqrt(max / file.size)
    let image = await loadImage(result)
    result = await compressImageSource(image, file.type, quality)
  }

  return new File([result], file.name, {
    type: file.type
  })
}
