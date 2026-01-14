import { getModulePath, existModule, isBuiltin } from './packages/be/module/resolve.ts'

console.log('--- Builtin Test ---')
console.log('fs is builtin:', isBuiltin('fs'))
console.log('node:path is builtin:', isBuiltin('node:path'))
console.log('lodash is builtin:', isBuiltin('lodash'))

console.log('\n--- Path Test ---')
console.log('vite path:', getModulePath('vite'))
console.log('package.json exists:', existModule('./package.json'))

console.log('\n--- Cache Test ---')
const start = performance.now()
for(let i=0; i<1000; i++) getModulePath('vite')
const end = performance.now()
console.log('1000 lookups with cache took:', (end - start).toFixed(4), 'ms')

const start2 = performance.now()
for(let i=0; i<1000; i++) getModulePath('vite', { useCache: false })
const end2 = performance.now()
console.log('1000 lookups WITHOUT cache took:', (end2 - start2).toFixed(4), 'ms')
