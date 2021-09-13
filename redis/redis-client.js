'use strict'

const redis = require('redis')
const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})

let client
const redisOpts = {
    port      : process.env.REDIS_PORT,
    host      : process.env.REDIS_IP_ADDRESS,
    password  : process.env.REDIS_PASS
}

// connects to local redis if opts empty
logger.log({level: 'info', message: `redis-client - opts: ${JSON.stringify(redisOpts,null,2)}`})
client = redis.createClient(redisOpts)  
client.on('connect', function() {
    logger.log({level: 'info', message: `redis-client - connected`})
})
 /* istanbul ignore next */
client.on('error', function (err) {
    logger.log({level: 'error', message: `redis-client - error: ${err}`})
})

module.exports = client