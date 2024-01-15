import type { IPadding } from './type'
import { WordArray } from './word-array'

function definePadding<Pad extends IPadding>(pad: Pad): Pad {
  return pad
}

export const Pkcs7 = definePadding({
  pad(data, blockSize) {
    const blockSizeBytes = blockSize * 4

    const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes)

    const paddingWord =
      (nPaddingBytes << 24) |
      (nPaddingBytes << 16) |
      (nPaddingBytes << 8) |
      nPaddingBytes

    const paddingWords: number[] = []
    for (let i = 0; i < nPaddingBytes; i += 4) {
      paddingWords.push(paddingWord)
    }
    const padding = new WordArray(paddingWords, nPaddingBytes)

    // Add padding
    data.concat(padding)

    return data
  },

  unpad(data) {
    const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2]! & 0xff

    data.sigBytes -= nPaddingBytes
    return data
  }
})

export const ZeroPadding = definePadding({
  pad(data, blockSize) {
    const blockSizeBytes = blockSize * 4

    // Pad
    data.clamp()
    data.sigBytes +=
      blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes)

    return data
  },

  unpad(data) {
    const dataWords = data.words

    // Unpad
    for (let i = data.sigBytes - 1; i >= 0; i--) {
      if ((dataWords[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff) {
        data.sigBytes = i + 1
        break
      }
    }
    return data
  }
})

export const NoPadding = definePadding({
  pad(data) {
    return data
  },
  unpad(data) {
    return data
  }
})

export const ISO10126 = definePadding({
  pad(data, blockSize) {
    const blockSizeBytes = blockSize * 4

    const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes)

    // Pad
    data
      .concat(WordArray.random(nPaddingBytes - 1))
      .concat(new WordArray([nPaddingBytes << 24], 1))

    return data
  },
  unpad(data) {
    const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2]! & 0xff

    // Remove padding
    data.sigBytes -= nPaddingBytes
    return data
  }
})

export const ISO97971 = definePadding({
  pad(data, blockSize) {
    // Add 0x80 byte
    data.concat(new WordArray([0x80000000], 1))

    // Zero pad the rest
    return ZeroPadding.pad(data, blockSize)
  },

  unpad(data) {
    // Remove zero padding
    ZeroPadding.unpad(data)
    // Remove one more byte -- the 0x80 byte
    data.sigBytes--

    return data
  }
})

export const AnsiX923 = definePadding({
  pad(data, blockSize) {
    // Shortcuts
    const dataSigBytes = data.sigBytes
    const blockSizeBytes = blockSize * 4

    // Count padding bytes
    const nPaddingBytes = blockSizeBytes - (dataSigBytes % blockSizeBytes)

    // Compute last byte position
    const lastBytePos = dataSigBytes + nPaddingBytes - 1

    // Pad
    data.clamp()
    data.words[lastBytePos >>> 2] |=
      nPaddingBytes << (24 - (lastBytePos % 4) * 8)
    data.sigBytes += nPaddingBytes

    return data
  },

  unpad(data) {
    // Get number of padding bytes from last byte
    const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2]! & 0xff

    // Remove padding
    data.sigBytes -= nPaddingBytes

    return data
  }
})
