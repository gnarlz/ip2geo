'use strict'

const redis = require('redis')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

const redisOpts = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_IP_ADDRESS,
  password: process.env.REDIS_PASS
}

let client 
/* istanbul ignore next */
if (process.env.NODE_ENV != 'unit') {
  logger.log({ level: 'info', message: `redis-client - opts: ${JSON.stringify(redisOpts, null, 2)}` })
  const client = redis.createClient(redisOpts)
  client.on('connect', function () {
    logger.log({ level: 'info', message: 'redis-client - connected' })
  })
  /* istanbul ignore next */
  client.on('error', function (err) {
    logger.log({ level: 'error', message: `redis-client - error: ${err}` })
  })
}

module.exports = client
