import CryptoJS from 'crypto-js/core'

import _ from 'crypto-js/tripledes'

function encrypt(message: string, key: string) {
  return CryptoJS.DES.encrypt(message, key, {

  }).toString()
}

function decrypt(cipherText: string, key: string) {
  return CryptoJS.DES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8)
}

export const DES = {
  encrypt,
  decrypt
}
