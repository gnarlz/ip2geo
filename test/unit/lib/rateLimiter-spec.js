'use strict'

/* eslint-env mocha */
const expect  = require("chai").expect
const proxyquire = require('proxyquire')

const unit = (fns) => {
    return proxyquire('../../../lib/rateLimiter', {
        'rate-limiter-flexible': {
            RateLimiterMemory: class {
               constructor(opts) {}
               consume = fns.consume || (it => it) 
           }
        }       
  })
 }

describe('lib/rateLimiter.limit test',() => {
    it('should return null when no ratelimit for the key', () => {
        const rateLimiterProxy = unit({})
        // (key, authorizationResults, response, requestId)
        return rateLimiterProxy.limit('abc123', {}, {},  'requestId-12345')
        .then ( response => {expect(response).to.be.an('null')})    
    })
    it('should return null when ratelimiter throws error', () => {
        const rateLimiterProxy = unit({consume: async (key, points) => {throw new Error('consume error')}})
        // (key, authorizationResults, response, requestId)
        return rateLimiterProxy.limit('abc123', {ratelimit_max: 1000, ratelimit_duration: 60}, {},  'requestId-12345')
        .then ( response => {expect(response).to.be.an('null')})    
    }) 
    it('should return and mutate response to contain ratelimit headers null when ratelimiter returns a value for remainingPoints', () => {
        const rateLimiterProxy = unit({consume: async (key, points) => {return {remainingPoints: 100 , msBeforeNext: 30000}}})
        // (key, authorizationResults, response, requestId)
        const responseObject = {}
        return rateLimiterProxy.limit('abc123', {ratelimit_max: 1000, ratelimit_duration: 60}, responseObject,  'requestId-12345')
        .then ( response => {
            expect(response).to.be.an('null')
            expect(responseObject.headers).to.be.an ('object')
            expect(responseObject.headers["X-RateLimit-Limit"]).to.equal(1000)
            expect(responseObject.headers["X-RateLimit-Remaining"]).to.equal(100)
            expect(responseObject.headers["X-RateLimit-Reset"]).to.be.ok
        })    
    })
    it('should return error and mutate response to contain ratelimit headers when ratelimiter returns no value for remainingPoints', () => {
        const rateLimiterProxy = unit({consume: async (key, points) => {return {remainingPoints: 0, msBeforeNext: 30000}}})
        // (key, authorizationResults, response, requestId)
        const responseObject = {}
        return rateLimiterProxy.limit('abc123', {ratelimit_max: 1000, ratelimit_duration: 60}, responseObject,  'requestId-12345')
        .then ( response => {
            throw new Error('should have thrown error, test failed')})
        .catch( (error) => {
            expect(error.message).to.be.contain('Rate limit exceeded')
            expect(responseObject.headers).to.be.an ('object')
            expect(responseObject.headers["X-RateLimit-Limit"]).to.equal(1000)
            expect(responseObject.headers["X-RateLimit-Remaining"]).to.equal(0)
            expect(responseObject.headers["X-RateLimit-Reset"]).to.be.ok
        })
    })
})
