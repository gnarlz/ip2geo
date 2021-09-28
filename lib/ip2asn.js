'use strict'

const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const util = require('util')
const http = require('http-codes')
const redisClient = require('../redis/redis-client')
const IP = require('../utility/ip')

const lookup = async (ip, requestId) => {
  const args = [process.env.IP2ASN_KEYSPACE, IP.numeric(ip, requestId), '+inf', 'withscores', 'LIMIT', 0, 1]
  const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)

  return redisClientSendCommand('ZRANGEBYSCORE', args)
    .then((results) => {
      if (results[0]) {
        const data = JSON.parse(results[0])
        const payload = {
          asn: data.AS_number,
          organization: data.AS_description
        }
        return payload
      } else {
        logger.log({ requestId, level: 'error', src: 'lib/ip2asn.lookup', ip, message: 'no results found' })
        const error = new Error()
        error.message = `no asn data for ip: ${ip}`
        error.code = http.BAD_REQUEST
        throw error // TODO: do we really want to throw? maybe just return empty asn instead?
      }
    })
    .catch((err) => {
      if (err.code && (err.code === http.BAD_REQUEST)) {
        throw err
      }

      const error = new Error()
      error.message = 'internal server error'
      error.code = http.INTERNAL_SERVER_ERROR
      logger.log({ requestId, level: 'error', src: 'lib/ip2asn.lookup', ip, message: 'internal server error' })
      throw error
    })
}

module.exports = { lookup }
