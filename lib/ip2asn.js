'use strict'

const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})
const util = require('util')
const http = require('http-codes')
const redisClient = require('../redis/redis-client')
const IP = require('../utility/ip')

const lookup = async (ip, requestId) => {
    const payload = {}
    const args = [process.env.IP2ASN_KEYSPACE, IP.numeric(ip, requestId), '+inf', 'withscores', 'LIMIT', 0, 1]
    const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)

    return redisClientSendCommand('ZRANGEBYSCORE', args)
    .then((results) => {
        if (results[0]) {
            let data = JSON.parse(results[0])
            payload.asn = data.AS_number
            payload.organization = data.AS_description
            return payload
        } else {
            logger.log({requestId, level: 'error', message: `lib/ip2asn.lookup - no results for ip: ${ip}`})
            const error = new Error()
            error.message = `ip2asn.lookup - no asn data for ip: ${ip}`
            error.code = http.BAD_REQUEST
            throw error  // TODO: do we really want to throw? maybe just return empty asn instead?
        }
    })
    .catch((err) => {
        if (err.code && (err.code === http.BAD_REQUEST)) {
            throw err
        }
        logger.log({requestId, level: 'error', message: `lib/ip2asn.lookup - error: ${err}`})
        const error = new Error()
        error.message = "ip2asn.lookup -  internal server error"
        error.code = http.INTERNAL_SERVER_ERROR
        throw error
    })
}

module.exports = {lookup}