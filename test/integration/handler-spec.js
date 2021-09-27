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

describe('handler test', () => {
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
  expect(response.body).to.be.a('object')
  expect(response.body.status).to.equal('success')
  expect(response.body.request).to.be.a('object')
  expect(response.body.request.request_id).to.be.a('string')
  expect(response.body.request.source_ip).to.be.a('string')
  expect(response.body.request.lookup_ip).to.be.a('string')
  expect(response.body.status_code).to.be.a('number')
  expect(response.body.status_code).to.equal(200)
  expect(response.body.error).to.be.a('undefined')

  expect(response.body.location).to.be.a('object')
  expect(response.body.location.latitude).to.be.a('number')
  expect(response.body.location.longitude).to.be.a('number')
  expect(response.body.location.city_name).to.be.a('string')
  expect(response.body.location.region_name).to.be.a('string')
  expect(response.body.location.region_iso_code).to.be.a('string')
  expect(response.body.location.postal_code).to.be.a('string')
  expect(response.body.location.country_name).to.be.a('string')
  expect(response.body.location.country_iso_code).to.be.a('string')
  expect(response.body.location.continent_name).to.be.a('string')
  expect(response.body.location.continent_code).to.be.a('string')

  expect(response.body.timezone).to.be.a('object')
  expect(response.body.timezone.time_zone).to.be.a('string')
  expect(response.body.timezone.time_zone_abbr).to.be.a('string')
  expect(response.body.timezone.time_zone_offset).to.be.a('number')
  expect(response.body.timezone.time_zone_is_dst).to.be.a('boolean')
  expect(response.body.timezone.time_zone_current_time).to.be.a('string')

  expect(response.body.security).to.be.a('object')
  expect(response.body.security.is_anonymous_proxy).to.be.a('boolean')
  expect(response.body.security.is_satellite_provider).to.be.a('boolean')

  expect(response.body.isp).to.be.a('object')
  expect(response.body.isp.asn).to.be.a('string')
  expect(response.body.isp.organization).to.be.a('string')
}

/*
const validateErrorResponse = (response) => {
  expect(response).to.be.a('object')
  expect(response.headers).to.be.a('object')
  expect(response.headers['X-Requested-With']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Headers']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Origin']).to.be.a('string')
  expect(response.headers['Access-Control-Allow-Methods']).to.be.a('string')
  expect(response.body).to.be.a('object')
  expect(response.body.status).to.equal('error')
  expect(response.body.request).to.be.a('object')
  expect(response.body.request.request_id).to.be.a('string')
  expect(response.body.status_code).to.be.a('number')
  expect(response.body.status_code).to.not.equal(200)
  expect(response.body.error).to.be.a('object')
  expect(response.body.error.message).to.be.a('string')
  expect(response.body.error.code).to.be.a('number')
  expect(response.body.error.code).to.not.equal(200)
}
*/
