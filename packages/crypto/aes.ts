import CryptoJS from 'crypto-js/core'
import _ from 'crypto-js/aes'
import enc from 'crypto-js/enc-latin1'


function encrypt(message: string, key: string) {
  const cipher = CryptoJS.algo.AES.createEncryptor(enc.parse(key) , )
  return CryptoJS.AES.encrypt(message, key, {

  }).toString()
}



export const AES = {

}