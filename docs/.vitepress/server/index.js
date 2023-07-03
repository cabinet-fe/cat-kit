const Fastify = require('fastify')

const fastify = Fastify({
  logger: true
})

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
