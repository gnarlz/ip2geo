'use strict'

const redis = require('redis')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

/* istanbul ignore next */
if (process.env.NODE_ENV === 'int') {
  const config = require('../test/integration/config')
  config.run()
}

const redisOpts = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_IP_ADDRESS,
  password: process.env.REDIS_PASS
}

let client

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'unit') {
  // logger.log({ level: 'info', src: 'redis/redis-client', opts })

  client = redis.createClient(redisOpts)
  client.on('connect', function () {
    logger.log({ level: 'info', src: 'redis/redis-client', message: 'connected' })
  })
  /* istanbul ignore next */
  client.on('error', function (err) {
    logger.log({ level: 'error', src: 'redis/redis-client', message: 'error', error: err.message })
  })
}

module.exports = client
