'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')

const http = require('http-codes')

const unit = (fns) => {
  return proxyquire('../../../lib/ip2asn', {
    '../redis/redis-client': {
      send_command: fns.send_command || (it => it)
    },
    util: {
      promisify (opts) {
        return {
          bind: () => {
            return fns.bind || (it => it)
          }
        }
      }
    }
  })
}

const validIP = '130.140.150.160'

describe('lib/ip2asn test', () => {
  it('should return successfgul response when zrangebyscore returns data for ip in redis', () => {
    const asnResponse = ['{"AS_number": "456", "AS_description": "foo"}']
    const ip2asnProxy = unit({ bind: async () => { return asnResponse } })
    return ip2asnProxy.lookup(validIP, 'requestId-12345')
      .then((response) => {
        expect(response).to.be.an('object')
        expect(response.asn).to.equal('456')
        expect(response.organization).to.equal('foo')
      })
  })
  it('should throw when zrangebyscore returns no data for ip in redis', () => {
    const ip2asnProxy = unit({ bind: async () => { return [] } })
    return ip2asnProxy.lookup(validIP, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => {
        expect(error.message).to.be.contain('no asn data for ip')
        expect(error.code).to.be.equal(http.BAD_REQUEST)
      })
  })
  it('should throw when zrangebyscore is not successful in redis', () => {
    const ip2asnProxy = unit({ bind: async () => { throw new Error() } })
    return ip2asnProxy.lookup(validIP, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => {
        expect(error.message).to.be.contain('internal server error')
        expect(error.code).to.be.equal(http.INTERNAL_SERVER_ERROR)
      })
  })
})
