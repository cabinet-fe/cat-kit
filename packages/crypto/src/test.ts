import { AES, AES_MODE, AES_PADDING } from './index'

AES.encrypt('hello world', {
  key: 'szyhszyhszyhszyh',
  iv: 'szyhszyhszyhszyh',
  mode: AES_MODE.CBC,
  padding: AES_PADDING.PKCS7,
  output: 'hex'
})
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })
