import CryptoJS from 'crypto-js/core'

import _ from 'crypto-js/tripledes'


console.log(CryptoJS)

interface DESConfig {
  /** 算法模式 */
  mode: ''
}

function encrypt(message: string, key: string, cfg?: DESConfig) {
  return CryptoJS.DES.encrypt(message, key, {
    // mode:
  }).toString()
}

function decrypt(cipherText: string, key: string) {
  return CryptoJS.DES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8)
}

export const DES = {
  encrypt,
  decrypt
}
