export default {
  join(...args: string[]) {
    let left = /^\/*/
    let right = /\/*$/
    const joined = args.map(arg => arg.replace(left, '').replace(right, '')).join('/')
    return joined.startsWith('/') ? joined : '/' + joined
  }
}
