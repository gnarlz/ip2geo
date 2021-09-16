'use strict'

const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const util = require('util')
const http = require('http-codes')
const redisClient = require('../redis/redis-client')
const IP = require('../utility/ip')

const lookup = async (ip, requestId) => {
  const payload = {}
  payload.ip = ip
  const args = [process.env.IP2GEO_KEYSPACE, IP.numeric(ip, requestId), '+inf', 'withscores', 'LIMIT', 0, 1]
  const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)

  return redisClientSendCommand('ZRANGEBYSCORE', args)
    .then((results) => {
      if (results[0]) {
        const data = JSON.parse(results[0])
        payload.latitude = (data.latitude ? parseFloat(data.latitude) : 0.0)
        payload.longitude = (data.longitude ? parseFloat(data.longitude) : 0.0)
        payload.city_name = data.city_name
        payload.subdivision_1_name = data.subdivision_1_name
        payload.subdivision_1_iso_code = data.subdivision_1_iso_code
        payload.postal_code = data.postal_code
        payload.country_name = data.country_name
        payload.country_iso_code = data.country_iso_code
        payload.continent_name = data.continent_name
        payload.continent_code = data.continent_code
        payload.time_zone = data.time_zone
        payload.time_zone_abbr = data.time_zone_abbr
        payload.time_zone_offset = data.time_zone_offset ? parseInt(data.time_zone_offset) : 0
        payload.time_zone_is_dst = data.time_zone_is_dst ? Boolean(data.time_zone_is_dst) : false

        if (data.time_zone) {
          const locationDate = new Date(new Date().toLocaleString('en-US', { timeZone: data.time_zone }))
          payload.time_zone_current_time = formatDate(locationDate, data.time_zone_offset) // 2019-05-31T04:08:43-07:00
        }

        payload.is_anonymous_proxy = data.is_anonymous_proxy ? Boolean(data.is_anonymous_proxy) : false
        payload.is_satellite_provider = data.is_satellite_provider ? Boolean(data.is_satellite_provider) : false

        return payload
      } else {
        logger.log({ requestId, level: 'error', message: `lib/ip2geo.lookup - no results for ip: ${ip}` })
        const error = new Error()
        error.message = `ip2geo.lookup - no geo data for ip: ${ip}`
        error.code = http.BAD_REQUEST
        throw error // TODO: do we really want to throw? maybe just return empty asn instead?
      }
    })
    .catch((err) => {
      if (err.code && (err.code === http.BAD_REQUEST)) {
        throw err
      }
      logger.log({ requestId, level: 'error', message: `lib/ip2geo.lookup - error: ${err}` })
      const error = new Error()
      error.message = 'ip2geo.lookup -  internal server error'
      error.code = http.INTERNAL_SERVER_ERROR
      throw error
    })
}

const formatDate = (datex, offset) => {
  const tzo = offset / 60
  const dif = tzo >= 0 ? '+' : '-'

  const pad = (num) => {
    const norm = Math.floor(Math.abs(num))
    return (norm < 10 ? '0' : '') + norm
  }

  return datex.getFullYear() +
        '-' + pad(datex.getMonth() + 1) +
        '-' + pad(datex.getDate()) +
        'T' + pad(datex.getHours()) +
        ':' + pad(datex.getMinutes()) +
        ':' + pad(datex.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60)
}

module.exports = { lookup, formatDate }
