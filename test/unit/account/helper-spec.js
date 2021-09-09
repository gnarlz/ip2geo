'use strict'

const expect  = require("chai").expect
const proxyquire = require('proxyquire')
const _ = {
    cloneDeep: require('lodash.clonedeep'),
    unset: require('lodash.unset')
  }

const unit = (fns) => {
    return proxyquire('../../../account/helper', {
        '../redis/redis-client': {
            send_command: fns.send_command || (it => it)
        },
        '../postgres/postgres-client': {
            query: fns.query || (it => it)
        },
        'util':  {
            promisify (opts) {
                return  {
                    bind:  () => {
                      return fns.bind || (it => it)
                   } 
                 } 
            }        
        },
        'aws-sdk': {
            SNS: class {
               constructor() {}
               publish (data) {
                   return {promise: fns.promise || (it => it)}
                 }  
           }
        }       
  })
}

const validAccountData = {
    action: "account.create",
    ts: "2021-09-04 09:20:06.777000",
    key: "934c6e53-f326-4d21-a263-9b877f8a70fe",
    subscription_id: "7579f1a3-c9d9-44c4-8d33-06c8b016acc4",
    email: "test@ip2geo.co",
    plan_id: "plan_GVK3dbrCJxAEqa",
    plan_name: "mvp_001",
    plan_created_at: "2019-11-03 13:30:11.606000",
    display_name: "MVP",
    limit: 300000,
    ratelimit_max: 100,
    ratelimit_duration: 60000,
    price: 19
  }

const validAccountDataNoRateLimit = _.cloneDeep(validAccountData)
_.unset(validAccountDataNoRateLimit, 'ratelimit_max')
_.unset(validAccountDataNoRateLimit, 'ratelimit_duration')

describe('account helper test',() => {
    it('should return null when query() is successful in insertPostgresKeyAccount()', () => {
        const helperProxy = unit({ query: async (data) => {return null} })
        return helperProxy.insertPostgresKeyAccount(validAccountData, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyAccount()', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyAccount query error')} })
        return helperProxy.insertPostgresKeyAccount(validAccountData, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.contain('insertPostgresKeyAccount query error')} )
    })

    it('should return null when query() is successful in insertPostgresKeyRequest()', () => {
        const helperProxy = unit({ query: async (data) => {return null} })
        return helperProxy.insertPostgresKeyRequest(validAccountData, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyRequest()', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyRequest query error')} })
        return helperProxy.insertPostgresKeyRequest(validAccountData, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.contain('insertPostgresKeyRequest query error')} )
    })

    it('should return null when query() is successful in insertPostgresKeyLimit()', () => {
        const helperProxy = unit({ query: async (data) => {return null} })
        return helperProxy.insertPostgresKeyLimit(validAccountData, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyLimit() (rateLimit)', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyLimit query error')} })
        return helperProxy.insertPostgresKeyLimit(validAccountData, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.contain('insertPostgresKeyLimit query error')} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyLimit() (no rateLimit)', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyLimit query error')} })
        return helperProxy.insertPostgresKeyLimit(validAccountDataNoRateLimit, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.contain('insertPostgresKeyLimit query error')} )
    })

    it('should return null when query() is successful in insertPostgresKeyAuthorization()', () => {
        const helperProxy = unit({ query: async (data) => {return null} })
        return helperProxy.insertPostgresKeyAuthorization(validAccountData, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyAuthorization() (rateLimit)', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyAuthorization query error')} })
        return helperProxy.insertPostgresKeyAuthorization(validAccountData, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.be.contain('insertPostgresKeyAuthorization query error')} )
    })
    it('should throw when error is thrown by query() in insertPostgresKeyAuthorization() (no rateLimit)', () => {
        const helperProxy = unit({ query: async (data) => {throw new Error('insertPostgresKeyAuthorization query error')} })
        return helperProxy.insertPostgresKeyAuthorization(validAccountDataNoRateLimit, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')} )
        .catch( (error) => {expect(error.message).to.be.contain('insertPostgresKeyAuthorization query error')} )
    })

    it('should return null when insert is successful in redis (ratelimit)', () => {
        const helperProxy = unit({bind: async () => {return null}})
        return helperProxy.insertRedisAuthorization(validAccountData, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should return null when insert is successful in redis (no ratelimit)', () => {
        const helperProxy = unit({bind: async () => {return null}})        
        return helperProxy.insertRedisAuthorization(validAccountDataNoRateLimit, 'requestId-12345')
        .then( (response) => {expect(response).to.be.null} )
    })
    it('should throw when insert is not successful in redis', () => {
        const helperProxy = unit({bind: async () => { throw new Error('redisClientSendCommand error') }} )   
        return helperProxy.insertRedisAuthorization(validAccountData, 'requestId-12345')
        .then( (response) => {throw new Error('should have thrown error, test failed')})
        .catch( (error) => {expect(error.message).to.be.contain('redisClientSendCommand error')} )
    })

    it('should return null when SNS is not successfully sent', () => {
        const helperProxy = unit({promise: async () => { throw new Error('AWS.SNS().publish(params).promise() error') }})
        return helperProxy.sendAccountCreationTextAndEmail(validAccountData, 'requestId-12345')
        .then ( (response) => {expect(response).to.be.null} ) 
    })
    it('should return null when SNS is successfully sent', () => {
        const helperProxy = unit({promise: async () => { return {foo: 'bar'} }})
        return helperProxy.sendAccountCreationTextAndEmail(validAccountData, 'requestId-12345')
        .then ( (response) => {expect(response).to.be.null} )
    })
})