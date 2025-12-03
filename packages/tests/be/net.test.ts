import { createServer } from 'node:net'

import { getLocalIP, isPortAvailable } from '@cat-kit/be/src/net'

describe('@cat-kit/be net utilities', () => {
  it('detects port availability', async () => {
    const server = createServer()
    const port = await new Promise<number>(resolve => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        resolve(typeof address === 'object' && address ? address.port : 0)
      })
    })

    expect(await isPortAvailable(port)).toBe(false)
    await new Promise(resolve => server.close(resolve))
    expect(await isPortAvailable(port)).toBe(true)
  })

  it('retrieves local IP address', () => {
    const ip = getLocalIP({ includeInternal: true })
    expect(ip).toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
  })
})

