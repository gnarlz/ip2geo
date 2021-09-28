'use strict'

const http = require('http-codes')
const _ = {
  get: require('lodash.get'),
  set: require('lodash.set')
}
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const validate = require('./lib/validate')
const authorize = require('./lib/authorize')
const rateLimiter = require('./lib/rateLimiter')
const requestCounter = require('./lib/requestCounter')
const ip2geo = require('./lib/ip2geo')
const ip2asn = require('./lib/ip2asn')
const utilities = require('./utility/utilities')

/**
 * Returns geo, asn, timezone and security data for an ip address.
 * If an ip address is included in the queryStringParameters, it will be used for the lookup.
 * Otherwise the ip address of the consumer making the request will be used for the lookup.
 * @param {Object} event (required)
 * @param {Object} event.queryStringParameters.ip (optional)
 * @param {Object} event.queryStringParameters.key (required) The api key for the request
 * @param {String} event.requestContext.identity.sourceIp (required)
 * @param {Array} [event.headers] (required)
 * @param {Object} context (required)
 * @param {String} context.awsRequestId (required)
 * @return {Object} Well formed JSON response containing geo, asn and security data for an ip address.
 * @public
 */
const lookup = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const requestId = context.awsRequestId
  const start = new Date()
  const response = {}
  const request = utilities.enrichRequest(event, context)

  let { ip, key } = event.queryStringParameters || {}
  if (!ip) {
    ip = event.requestContext.identity.sourceIp
  }
  // loadTest(ip, key)   // uncomment for quick and dirty load testing
  request.lookup_ip = ip
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration

  return Promise.all([validate.ip(ip, requestId), validate.key(key, requestId)])
    .then(() => {
      return authorize.key(key, requestId)
    })
    .then((authorizeResult) => {
      return rateLimiter.limit(key, authorizeResult, response, requestId)
    })
    .then(() => {
      return Promise.all([requestCounter.increment(key, requestId), ip2geo.lookup(ip, requestId), ip2asn.lookup(ip, requestId)])
    })
    .then(([requestCounterResult, ip2geoResult, ip2asnResult]) => {
      populateSuccessResponse(request, response, ip2geoResult, ip2asnResult, start)
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'handler.lookup', key, response, error, event })
      populateErrorResponse(request, response, error, start)
    })
    .then(() => {
      logger.log({ requestId, level: 'info', src: 'handler.lookup', key, response })
      const payload = _.get(response, 'body')
      _.set(response, 'body', JSON.stringify(payload))
      return response
    })
}

const populateErrorResponse = (request, response, err, start) => {
  const payload = {
    time_elapsed: new Date() - start,
    status: 'error',
    status_code: err.code,
    request: request,
    error: {
      message: err.message,
      code: err.code
    }
  }

  _.set(response, 'statusCode', err.code)
  _.set(response, 'body', payload)
}

const populateSuccessResponse = (request, response, geoResult, asnResult, start) => {
  const payload = {
    time_elapsed: new Date() - start,
    status: 'success',
    status_code: http.OK,
    request: request,
    location: {
      ip: geoResult.ip,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      city_name: geoResult.city_name,
      region_name: geoResult.subdivision_1_name,
      region_iso_code: geoResult.subdivision_1_iso_code,
      postal_code: geoResult.postal_code,
      country_name: geoResult.country_name,
      country_iso_code: geoResult.country_iso_code,
      continent_name: geoResult.continent_name,
      continent_code: geoResult.continent_code
    },
    timezone: {
      time_zone: geoResult.time_zone,
      time_zone_abbr: geoResult.time_zone_abbr,
      time_zone_offset: geoResult.time_zone_offset,
      time_zone_is_dst: geoResult.time_zone_is_dst,
      time_zone_current_time: geoResult.time_zone_current_time
    },
    security: {
      is_anonymous_proxy: geoResult.is_anonymous_proxy,
      is_satellite_provider: geoResult.is_satellite_provider
    },
    isp: {
      asn: asnResult.asn,
      organization: asnResult.organization
    }
  }

  _.set(response, 'statusCode', http.OK)
  _.set(response, 'body', payload)
}

/* istanbul ignore next */
/* eslint-disable no-unused-vars */
const loadTest = (ip, key) => {
  const ipInt = require('ip-to-int')
  ip = ipInt(Math.floor(Math.random() * Math.floor(4294967290))).toIP()
  key = process.env.VALID_KEY
}
/* eslint-enable no-unused-vars */

module.exports = { lookup }
