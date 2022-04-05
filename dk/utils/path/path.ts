export default {
  join(firstPath: string, ...args: string[]) {
    let left = /^\/*/
    let right = /\/*$/
    let protocolRE = /^(https?|ftp|file):/

    let isProtocal = protocolRE.test(firstPath)

    let prefix = isProtocal ? firstPath : ''
    args = isProtocal ? args : [firstPath, ...args]
    const joined = args.map((arg) => arg.replace(left, '').replace(right, '')).join('/')
    return prefix.replace(right, '') + (joined.startsWith('/') ? joined : '/' + joined)
  }
}
