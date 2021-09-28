'use strict'

const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const util = require('util')
const http = require('http-codes')
const redisClient = require('../redis/redis-client')

const key = async (key, requestId) => {
  const akey = 'authorized:' + key
  const args = [akey]
  const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)
  return redisClientSendCommand('GET', args)
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'authorize.key', key: akey, message: 'error', error: error.message })
      error.message = 'Internal server error'
      error.code = http.INTERNAL_SERVER_ERROR
      throw error
    })
    .then((results) => {
      if (results) {
        const data = JSON.parse(results)
        if (data.authorized) {
          return data
        } else {
          logger.log({ requestId, level: 'error', src: 'authorize.key', key: akey, message: 'API key unauthorized in Redis' })
          const error = new Error()
          error.message = data.message
          error.code = http.UNAUTHORIZED
          throw error
        }
      } else { // key doesnt exist in redis, null is returned
        logger.log({ requestId, level: 'error', src: 'authorize.key', key: akey, message: 'API key not found in Redis' })
        const error = new Error()
        error.message = 'API key is unrecognized'
        error.code = http.BAD_REQUEST
        throw error
      }
    })
}

module.exports = { key }
