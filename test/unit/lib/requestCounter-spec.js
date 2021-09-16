'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')

const unit = (fns) => {
  return proxyquire('../../../lib/requestCounter', {
    '../postgres/postgres-client': {
      query: fns.query || (it => it)
    }
  })
}

describe('lib/requestHelper test', () => {
  it('should return null when query() is successful in increment()', () => {
    const requestCounterProxy = unit({ query: async (data) => { return null } })
    return requestCounterProxy.increment('abc123', 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when query() is unsuccessful in increment()', () => {
    const requestCounterProxy = unit({ query: async (data) => { throw new Error() } })
    return requestCounterProxy.increment('def456', 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
})
