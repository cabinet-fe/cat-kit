/*!
 * Ported from nanoid v5.1.11:
 * https://github.com/ai/nanoid/tree/main
 * Source files: index.js, index.browser.js, url-alphabet/index.js
 */

export const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

const POOL_SIZE_MULTIPLIER = 128

let pool: Uint8Array<ArrayBuffer> | undefined
let poolOffset = 0

function getCrypto(): Crypto {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('crypto.getRandomValues is not available in this runtime')
  }

  return globalThis.crypto
}

function fillPool(bytes: number): void {
  if (bytes < 0 || bytes > 1024) {
    throw new RangeError('Wrong ID size')
  }

  if (!pool || pool.length < bytes) {
    pool = new Uint8Array(bytes * POOL_SIZE_MULTIPLIER)
    getCrypto().getRandomValues(pool)
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    getCrypto().getRandomValues(pool)
    poolOffset = 0
  }

  poolOffset += bytes
}

export function random(bytes: number): Uint8Array {
  fillPool((bytes |= 0))

  return pool!.subarray(poolOffset - bytes, poolOffset)
}

export function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string {
  const safeByteCutoff = 256 - (256 % alphabet.length)

  if (safeByteCutoff === 256) {
    const mask = alphabet.length - 1

    return (size = defaultSize) => {
      if (!size) return ''

      let id = ''

      while (true) {
        const bytes = getRandom(size)
        let i = size

        while (i--) {
          id += alphabet[bytes[i]! & mask]!

          if (id.length >= size) {
            return id
          }
        }
      }
    }
  }

  const step = Math.ceil((1.6 * 256 * defaultSize) / safeByteCutoff)

  return (size = defaultSize) => {
    if (!size) return ''

    let id = ''

    while (true) {
      const bytes = getRandom(step)
      let i = step

      while (i--) {
        const byte = bytes[i]!

        if (byte < safeByteCutoff) {
          id += alphabet[byte % alphabet.length]!

          if (id.length >= size) {
            return id
          }
        }
      }
    }
  }
}

export function customAlphabet(alphabet: string, size = 21): (size?: number) => string {
  return customRandom(alphabet, size | 0, random)
}

export function nanoid(size = 21): string {
  fillPool((size |= 0))

  let id = ''

  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool![i]! & 63]!
  }

  return id
}
