'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const uuidv4 = require('uuid/v4')
const http = require('http-codes')
const _ = {
  cloneDeep: require('lodash.clonedeep'),
  unset: require('lodash.unset')
}

const unit = (fns) => {
  return proxyquire('../../handler', {
    './lib/validate': { ip: fns.validateIP || (it => it), key: fns.validateKey || (it => it) },
    './lib/authorize': { key: fns.authorizeKey || (it => it) },
    './lib/rateLimiter': { limit: fns.limit || (it => it) },
    './lib/requestCounter': { increment: fns.increment || (it => it) },
    './lib/ip2geo': { lookup: fns.geoLookup || (it => it) },
    './lib/ip2asn': { lookup: fns.asnLookup || (it => it) }
  })
}

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  queryStringParameters: {
    key: '3ad9fbb4-7635-43bf-a87b-b3cac1809e58',
    ip: '200.100.200.100'
  },
  requestContext: {
    identity: {
      sourceIp: '137.64.177.32'
    }
  },
  headers: {}
}

const validGEOResponse = {
  latitude: 70.123,
  longitude: 120.567,
  city_name: 'Madison',
  subdivision_1_name: 'Wisconsin',
  subdivision_1_iso_code: 'WI',
  postal_code: '53711',
  country_name: 'America',
  country_iso_code: 'US',
  continent_name: 'North America',
  continent_code: 'NA',
  time_zone: 'America/Chicago',
  time_zone_abbr: 'CDT',
  time_zone_offset: -21600,
  time_zone_is_dst: true,
  time_zone_current_time: '2021-09-12T16:46:09-06:00',
  is_anonymous_proxy: true,
  is_satellite_provider: true
}
const validASNResponse = {
  asn: '456',
  organization: 'foo'
}

describe('handler.lookup test', () => {
  it('should return well formed success response for valid request that includes an ip address', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return validGEOResponse },
      asnLookup: async (data) => { return validASNResponse }
    })
    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateSuccessResponse(response)
      })
  })
  it('should return well formed success response for valid request that does not include an ip address', () => {
    const validEventNoIP = _.cloneDeep(validEvent)
    _.unset(validEventNoIP.queryStringParameters, 'ip')
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return validGEOResponse },
      asnLookup: async (data) => { return validASNResponse }
    })

    return handlerProxy.lookup(validEventNoIP, validContext)
      .then(response => {
        validateSuccessResponse(response)
      })
  })

  it('should return well formed error response when empty queryStringParameters passed', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => {
        const error = new Error()
        error.message = 'key validation error'
        error.code = http.BAD_REQUEST
        throw error
      },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })
    const invalidEventEmptyQueryStringParameters = _.cloneDeep(validEvent)
    _.unset(invalidEventEmptyQueryStringParameters.queryStringParameters, 'ip')
    _.unset(invalidEventEmptyQueryStringParameters.queryStringParameters, 'key')

    return handlerProxy.lookup(invalidEventEmptyQueryStringParameters, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when no queryStringParameters passed', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => {
        const error = new Error()
        error.message = 'key validation error'
        error.code = http.BAD_REQUEST
        throw error
      },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })
    const invalidEventNoQueryStringParameters = _.cloneDeep(validEvent)
    _.unset(invalidEventNoQueryStringParameters, 'queryStringParameters')

    return handlerProxy.lookup(invalidEventNoQueryStringParameters, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when ip validation fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => {
        const error = new Error()
        error.message = 'ip validation error'
        error.code = http.BAD_REQUEST
        throw error
      },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when key validation fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => {
        const error = new Error()
        error.message = 'key validation error'
        error.code = http.BAD_REQUEST
        throw error
      },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when key authorization fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => {
        const error = new Error()
        error.message = 'key authorization error'
        error.code = http.UNAUTHORIZED
        throw error
      },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when ratelimiter fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => {
        const error = new Error()
        error.message = 'ratelimiter error'
        error.code = http.TOO_MANY_REQUESTS
        throw error
      },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it.skip('should return well formed success response when requestCounter fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateSuccessResponse(response)
      })
  })
  it('should return well formed error response when ip2geo lookup fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => {
        const error = new Error()
        error.message = 'ip2geo lookup error'
        error.code = http.BAD_REQUEST
        throw error
      },
      asnLookup: async (data) => { return null }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
  it('should return well formed error response when ip2asn lookup fails', () => {
    const handlerProxy = unit({
      validateIP: async (data) => { return null },
      validateKey: async (data) => { return null },
      authorizeKey: async (data) => { return null },
      limit: async (data) => { return null },
      increment: async (data) => { return null },
      geoLookup: async (data) => { return null },
      asnLookup: async (data) => {
        const error = new Error()
        error.message = 'ip2asn lookup error'
        error.code = http.BAD_REQUEST
        throw error
      }
    })

    return handlerProxy.lookup(validEvent, validContext)
      .then(response => {
        validateErrorResponse(response)
      })
  })
})

const validateErrorResponse = (response) => {
  expect(response).to.be.a('object')
  expect(response.headers).to.be.a('object')
  expect(response.headers['X-Requested-With']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Headers']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Origin']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Methods']).to.be.a('string')

  expect(response.body).to.be.a('string')
  const payload = JSON.parse(response.body)

  expect(payload.status).to.equal('error')
  expect(payload.request).to.be.a('object')
  expect(payload.request.request_id).to.be.a('string')
  expect(payload.status_code).to.be.a('number')
  expect(payload.status_code).to.not.equal(200)
  expect(payload.error).to.be.a('object')
  expect(payload.error.message).to.be.a('string')
  expect(payload.error.code).to.be.a('number')
  expect(payload.error.code).to.not.equal(200)
}

const validateSuccessResponse = (response) => {
  expect(response).to.be.a('object')
  expect(response.headers).to.be.a('object')
  expect(response.headers['X-Requested-With']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Headers']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Origin']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Methods']).to.be.a('string')

  expect(response.body).to.be.a('string')
  const payload = JSON.parse(response.body)

  expect(payload.status).to.equal('success')
  expect(payload.request).to.be.a('object')
  expect(payload.request.request_id).to.be.a('string')
  expect(payload.request.source_ip).to.be.a('string')
  expect(payload.request.lookup_ip).to.be.a('string')
  expect(payload.status_code).to.be.a('number')
  expect(payload.status_code).to.equal(200)
  expect(payload.error).to.be.a('undefined')

  expect(payload.location).to.be.a('object')
  expect(payload.location.latitude).to.be.a('number')
  expect(payload.location.longitude).to.be.a('number')
  expect(payload.location.city_name).to.be.a('string')
  expect(payload.location.region_name).to.be.a('string')
  expect(payload.location.region_iso_code).to.be.a('string')
  expect(payload.location.postal_code).to.be.a('string')
  expect(payload.location.country_name).to.be.a('string')
  expect(payload.location.country_iso_code).to.be.a('string')
  expect(payload.location.continent_name).to.be.a('string')
  expect(payload.location.continent_code).to.be.a('string')

  expect(payload.timezone).to.be.a('object')
  expect(payload.timezone.time_zone).to.be.a('string')
  expect(payload.timezone.time_zone_abbr).to.be.a('string')
  expect(payload.timezone.time_zone_offset).to.be.a('number')
  expect(payload.timezone.time_zone_is_dst).to.be.a('boolean')
  expect(payload.timezone.time_zone_current_time).to.be.a('string')

  expect(payload.security).to.be.a('object')
  expect(payload.security.is_anonymous_proxy).to.be.a('boolean')
  expect(payload.security.is_satellite_provider).to.be.a('boolean')

  expect(payload.isp).to.be.a('object')
  expect(payload.isp.asn).to.be.a('string')
  expect(payload.isp.organization).to.be.a('string')
}
