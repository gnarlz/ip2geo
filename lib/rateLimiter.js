'use strict'

const rateLimiter = require('rate-limiter-flexible')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const http = require('http-codes')
const redisClient = require('../redis/redis-client')

const limit = async (key, authorizationResults, response, requestId) => {
  if (!authorizationResults.ratelimit_max) { return null }

  const rateLimiterConfig = {
    storeClient: redisClient,
    points: authorizationResults.ratelimit_max,
    duration: authorizationResults.ratelimit_duration
  }

  const rateLimiterMemory = new rateLimiter.RateLimiterMemory(rateLimiterConfig)
  return rateLimiterMemory.consume(key, 1)
    .then((rateLimiterResponse) => {
      if (!response.headers) { response.headers = {} }
      response.headers['X-RateLimit-Limit'] = authorizationResults.ratelimit_max
      response.headers['X-RateLimit-Remaining'] = rateLimiterResponse.remainingPoints
      response.headers['X-RateLimit-Reset'] = new Date(Date.now() + rateLimiterResponse.msBeforeNext)

      if (!rateLimiterResponse.remainingPoints) {
        response.headers['Retry-After'] = rateLimiterResponse.msBeforeNext / 1000
        const error = new Error()
        error.message = 'Rate limit exceeded'
        error.code = http.TOO_MANY_REQUESTS
        logger.log({ requestId, level: 'error', src: 'lib/rateLimiter.limit', key: key, authorizationResults, rateLimiterResponse, message: 'Rate limit exceeded' })
        throw error
      }
      return null
    })
    .catch((error) => {
      if (error.code && (error.code === http.TOO_MANY_REQUESTS)) {
        throw error
      }
      // if the error was thrown by rateLimiterMemory.consume(), swallow it
      logger.log({ requestId, level: 'error', src: 'lib/rateLimiter.limit', key: key, message: 'error', error: error.message })
      return null
    })
}

module.exports = { limit }
