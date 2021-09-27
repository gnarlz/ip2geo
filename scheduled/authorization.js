'use strict'

const util = require('util')
const moment = require('moment')
const http = require('http-codes')
const utilities = require('../utility/utilities')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const redisClient = require('../redis/redis-client')
const postgresClient = require('../postgres/postgres-client')

/**
 * Scheduled task, with frequency defined in serverless.yml
 * Implementation Details:
 * For all keys that are over their monthly limit AND whose latest row in key.authorization is TRUE
 *      1. Sets a row into redis indicating the authorization is false
 *      2. Inserts a new row into postgres key.authorization indicating the authorization is false
 * @param {Object} event
 * @param {Object} context (required)
 * @param {String} context.awsRequestId (required)
 * @return status code 200 if success, status code 500 for error
 * @public
 */
const run = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const requestId = context.awsRequestId
  logger.log({ requestId, level: 'info', message: 'authorization.run - start' })
  let rows
  const response = {}
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration

  return postgresClient.query(findOverLimitKeysSQL)
    .then(result => {
      logger.log({ requestId, level: 'info', message: `authorization.run - found  ${result.rows.length} keys that need to be expired` })
      rows = result.rows

      if (!rows.length) {
        logger.log({ requestId, level: 'info', message: 'authorization.run - no keys to update' })
        return null
      }

      logger.log({ requestId, level: 'info', message: 'authorization.run - attempting to set rows in redis for all expired keys' })
      return Promise.all(rows.map(row => setRedisAuthorization(row, requestId)))
    })
    .then((redisResponse) => {
      if (!redisResponse) return null

      logger.log({ requestId, level: 'info', message: 'authorization.run - successfully set rows in redis for all expired keys' })
      logger.log({ requestId, level: 'info', message: 'authorization.run - attempting to insert rows in postgres for all expired keys' })
      return Promise.all(rows.map(row => insertPostgresAuthorization(row, requestId)))
    })
    .then((postgresResponse) => {
      if (postgresResponse) {
        logger.log({ requestId, level: 'info', message: 'authorization.run - successfully inserted rows in postgres for all expired keys' })
      }
      response.statusCode = http.OK
      return response
    })
    .catch(error => {
      logger.log({ requestId, level: 'error', message: `authorization.run - error: ${error}` })
      response.statusCode = http.INTERNAL_SERVER_ERROR
      return response
    })
}

const setRedisAuthorization = async (row, requestId) => {
  const key = row.key // key will always exist, is not nullable in source table key.limit

  const payload = {}
  payload.authorized = false
  payload.message = message
  payload.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
  payload.ratelimit_max = row.ratelimit_max ? row.ratelimit_max : null
  payload.ratelimit_duration = row.ratelimit_duration ? row.ratelimit_duration : null

  const akey = `authorized:${key}`
  logger.log({ requestId, level: 'info', message: `authorization.setRedisAuthorization - setting this key to expired in redis: ${akey}   (requests: ${row.request_total}  limit: ${row.limit_})` })

  const args = [akey, JSON.stringify(payload)]

  const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)
  return redisClientSendCommand('SET', args)
    .then(() => {
      logger.log({ requestId, level: 'info', message: `authorization.setRedisAuthorization - set expired authorization in redis    key: ${akey}` })
      return null
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', message: `authorization.setRedisAuthorization - error attempting to set expired authorization in redis    key: ${akey}    error: ${error}` })
      throw error
    })
}

const insertPostgresAuthorization = async (row, requestId) => {
  const key = row.key // key will always exist, is not nullable in source table key.limit
  const ratelimitMax = row.ratelimit_max ? row.ratelimit_max : null
  const ratelimitDuration = row.ratelimit_duration ? row.ratelimit_duration : null

  const sql = "INSERT INTO key.authorization (key, authorized, message, created_at, updated_at, ratelimit_max, ratelimit_duration) values ('" +
    key + "', false, '" + message + "', now(), now(), " + ratelimitMax + ' , ' + ratelimitDuration + ')'

  logger.log({ requestId, level: 'info', message: `authorization.insertPostgresAuthorization - inserting row into postgres key.authorization: ${row.key}   (requests: ${row.request_total}  limit: ${row.limit_})` })

  return postgresClient.query(sql)
    .then(result => {
      logger.log({ requestId, level: 'info', message: `authorization.insertPostgresAuthorization - inserted row into postgres key.authorization    key: ${key} ` })
      return null
    })
    .catch(error => {
      logger.log({ requestId, level: 'error', message: `authorization.insertPostgresAuthorization - error inserting into postgres key.authorization    key: ${key}    error: ${error}` })
      throw error
    })
}

// find all keys that are over their monthly limit AND whose latest row in key.authorization is TRUE
// (we dont want to clobber it is it is already FALSE)
const findOverLimitKeysSQL = 'SELECT ' +
    'key.limit.key, ' +
    'key.limit.limit_, ' +
    'key.limit.ratelimit_max, ' +
    'key.limit.ratelimit_duration, ' +
    'key.limit.updated_at as limit_updated_date, ' +
    'key.request.total as request_total, ' +
    'key.authorization.authorized, ' +
    'key.authorization.updated_at as authorization_updated_date ' +
    'FROM ' +
    'key.limit, key.request, key.authorization ' +
    'WHERE ' +
    'key.limit.updated_at = (SELECT MAX(c.updated_at) FROM key.limit c WHERE key.limit.key = c.key)  and ' +
    'key.authorization.updated_at = (SELECT MAX(d.updated_at) FROM key.authorization d WHERE key.authorization.key = d.key) ' +
    'and key.limit.key=key.request.key ' +
    'and key.authorization.key=key.request.key ' +
    'and key.request.total > key.limit.limit_ ' +
    'and key.authorization.authorized is true'
const message = 'Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue.'

module.exports = { run, setRedisAuthorization, insertPostgresAuthorization }
