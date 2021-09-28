'use strict'

const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const postgresClient = require('../postgres/postgres-client')

const increment = async (key, requestId) => {
  const sql = `update key.request set total = total+1 , updated_at = now() where key='${key}' RETURNING total`
  return postgresClient.query(sql)
    .then(result => {
      return null
    })
    .catch(error => {
      logger.log({ requestId, level: 'error', src: 'lib/requestCounter.increment', message: 'postgres error', error: error.message })
      return null // intentionally drop error on floor - this error is unfortunate, but not fatal
    })
}

module.exports = { increment }
