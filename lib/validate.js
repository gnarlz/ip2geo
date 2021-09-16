'use strict'

const isIp = require('is-ip')
const uuidValidate = require('uuid-validate')
const http = require('http-codes')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

// note: these functions are not ~really~ async but it allows the caller (handler.js) to these nicely in a promise chain
const ip = async (ip, requestId) => {
  if (!ip) {
    logger.log({ requestId, level: 'error', message: 'lib/validate.ip - insufficient ip' })
    const error = new Error()
    error.message = 'No IP address included in the request'
    error.code = http.BAD_REQUEST
    throw error
  } else if (!isIp(ip)) {
    logger.log({ requestId, level: 'error', message: `lib/validate.ip - invalid ip: ${ip}` })
    const error = new Error()
    error.message = 'Invalid IP address included in the request'
    error.code = http.BAD_REQUEST
    throw error
  } else {
    return null
  }
}

const key = async (key, requestId) => {
  if (!key) {
    logger.log({ requestId, level: 'error', message: 'lib/validate.key - insufficient key' })
    const error = new Error()
    error.message = 'No API key included in the request'
    error.code = http.BAD_REQUEST
    throw error
  } else if (!uuidValidate(key)) {
    logger.log({ requestId, level: 'error', message: `lib/validate.ip - invalid key: ${key}` })
    const error = new Error()
    error.message = 'Invalid API key included in the request'
    error.code = http.BAD_REQUEST
    throw error
  } else {
    return null
  }
}

module.exports = { ip, key }
