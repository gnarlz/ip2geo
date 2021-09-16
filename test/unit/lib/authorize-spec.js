'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')

const unit = (fns) => {
  return proxyquire('../../../lib/authorize', {
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

describe('lib/authorize test', () => {
  it('should return data when get is successful (key is authorized in redis)', () => {
    const redisResponseAuthorized = '{ "authorized":true, "message":"Account creation", "ts":"2019-11-22 11:13:29.607000", "ratelimit_max":60, "ratelimit_duration":60000}'
    const authorizeProxy = unit({ bind: async () => { return redisResponseAuthorized } })
    return authorizeProxy.key('abc123', 'requestId-12345')
      .then((response) => {
        expect(response).to.be.a('object')
        expect(response.authorized).to.be.a('boolean')
      })
  })
  it('should throw when get is successful (key is not authorized in redis)', () => {
    const redisResponseAuthorized = '{ "authorized":false, "message":"key not authorized", "ts":"2019-11-22 11:13:29.607000", "ratelimit_max":60, "ratelimit_duration":60000}'
    const authorizeProxy = unit({ bind: async () => { return redisResponseAuthorized } })
    return authorizeProxy.key('def456', 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.contain('key not authorized') })
  })
  it('should throw when get is is unsuccessful (key is not found in redis)', () => {
    const authorizeProxy = unit({ bind: async () => { return null } })
    return authorizeProxy.key('def456', 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.contain('API key is unrecognized') })
  })
  it('should throw when get is unsuccessful (redis throws an error)', () => {
    const authorizeProxy = unit({ bind: async () => { throw new Error() } })
    return authorizeProxy.key('def456', 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.contain('Internal server error') })
  })
})
