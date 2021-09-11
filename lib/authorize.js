'use strict'

const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})
const util = require('util')
const http = require('http-codes')
const redisClient = require('../redis/redis-client')

const key = async (key, requestId)  => {
    const akey = "authorized:" + key
    const args = [akey]
    const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)
    return redisClientSendCommand('GET', args)
    .catch((error) => {
        logger.log({requestId, level: 'error', message: `authorize.key - redis error attempting to authorize key - key: ${akey} error: ${error}`})
        error.message = `Internal server error`
        error.code = http.INTERNAL_SERVER_ERROR
        throw error
    })
    .then((results) => {
        if (results) {
            let data = JSON.parse(results)
            if(data.authorized) {
                return data
            } else {
                logger.log({requestId, level: 'error', message: `authorize.key - unauthorized API key returned from Redis - key: ${akey}  redis reply: ${results}`})
                const error = new Error()
                error.message = data.message
                error.code = http.UNAUTHORIZED
                throw error
            }
        } else {   //key doesnt exist in redis, null is returned
            logger.log({requestId, level: 'error', message: `authorize.key - API key unrecognized (not found in Redis) - key: ${akey}`})
            const error = new Error()
            error.message = `API key is unrecognized: ${key}`
            error.code = http.BAD_REQUEST
            throw error
        }
    })
}

module.exports = {key}