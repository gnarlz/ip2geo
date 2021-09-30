'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const uuidv4 = require('uuid/v4')
const _ = {
  cloneDeep: require('lodash.clonedeep'),
  unset: require('lodash.unset')
}
const handler = require('../../handler')

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  queryStringParameters: {
    key: '514fe88e-d892-4785-b87d-a77b6b3c1c7a',
    ip: '200.100.200.100'
  },
  requestContext: {
    identity: {
      sourceIp: '137.64.177.32'
    }
  },
  headers: {}
}

describe('handler.lookup test', () => {
  it('should happily work with ip in query string', () => {
    return handler.lookup(validEvent, validContext)
      .then((response) => {
        validateSuccessResponse(response)
      })
  })

  it('should happily work with ip in request context', () => {
    const requestContextEvent = _.cloneDeep(validEvent)
    _.unset(requestContextEvent.queryStringParameters, 'ip')
    return handler.lookup(requestContextEvent, validContext)
      .then((response) => {
        validateSuccessResponse(response)
      })
  })
})

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

/* eslint-disable no-unused-vars */
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
/* eslint-enable no-unused-vars */
