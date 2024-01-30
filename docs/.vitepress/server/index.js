import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { createServer } from 'http'

const server = createServer((req, res) => {
  req.on('data', chunk => {
    console.log(chunk.toString('utf-8'))
  })

  req.on('end', () => {
    res.end('hello world')
  })
}).listen(2334, () => {
  console.log('服务已启动')
})

const fastify = Fastify({
  logger: true
})

fastify.register(multipart)

fastify.register(
  (app, _, done) => {
    app.post('/test', (req, res) => {
      const { sleep } = req.body || {}

      setTimeout(
        () => {
          res.send('请求完成')
        },
        typeof sleep === 'number' ? sleep : 0
      )
    })

    app.post('/test3', (req, res) => {
      setTimeout(() => {
        res.send(req.body.toString('utf-8'))
      }, 0)
    })

    done()
  },
  {
    prefix: '/api'
  }
)

fastify
  .listen({
    port: 2334
  })
  .then(async () => {
    fastify.log.info('服务已启动')
  })
  .catch(err => {
    fastify.log.error(err)
    process.exit(1)
  })
