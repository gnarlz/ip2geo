'use strict'

const expect  = require("chai").expect
const proxyquire = require('proxyquire')
const _ = {
    cloneDeep: require('lodash.clonedeep'),
    unset: require('lodash.unset')
  }

const unit = (fns) => {
    return proxyquire('../../../account/emailer', {
        'aws-sdk': {
            S3: class {
               constructor() {}
               getObject (data) {
                   return {promise: fns.promise || (it => it)}
                 }  
           }
        },      
        'postmark': {
            ServerClient: class {
                constructor(opts) {}
                sendEmail = fns.sendEmail || (it => it) 
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

describe('account/emailer test',() => {
    it('should return a string when getHtmlContent() is successful', () => {
        const emailerProxy = unit({
            promise: async () => {return { Body: "HTML CONTENT"}}
        })
        return emailerProxy.getHtmlContent(validAccountData, 'requestId-12345')
        .then ( response => {
            expect(response).to.be.a('string')
        })    
    })
    it('should throw when error is thrown in getHtmlContent()', () => {
        const emailerProxy = unit({
            promise: async () => {throw new Error('getHtmlContent error')}
        })
        return emailerProxy.getHtmlContent(validAccountData, 'requestId-12345')
        .then ( response => {
            throw new Error('should have thrown error, test failed')})
        .catch( (error) => {
            expect(error.message).to.be.contain('getHtmlContent error')
        })
    })

    it('should return a string when getTextContent() is successful', () => {
        const emailerProxy = unit({
            promise: async () => {return { Body: "TEXT CONTENT"}}
        })
        return emailerProxy.getTextContent(validAccountData, 'requestId-12345')
        .then ( response => {
            expect(response).to.be.a('string')
        })    
    })
    it('should throw when error is thrown in getTextContent()', () => {
        const emailerProxy = unit({
            promise: async () => {throw new Error('getTextContent error')}
        })
        return emailerProxy.getTextContent(validAccountData, 'requestId-12345')
        .then ( response => {
            throw new Error('should have thrown error, test failed')})
        .catch( (error) => {
            expect(error.message).to.be.contain('getTextContent error')
        })
    })

    it('should return null when sendEmail() is successful', () => {
        const emailerProxy = unit({
            sendEmail: async (message) => {return null}
        })
        return emailerProxy.sendEmail(validAccountData, 'HTML CONTENT', 'TEXT CONTENT', 'requestId-12345')
        .then ( response => {
            expect(response).to.be.null
        })
    })
    it('should throw when error is thrown in sendEmail()', () => {
        const emailerProxy = unit({
            sendEmail: async (message) => {throw new Error('sendEmail error')}
        })
        return emailerProxy.sendEmail(validAccountData, 'HTML CONTENT', 'TEXT CONTENT', 'requestId-12345')
        .then ( response => {
            throw new Error('should have thrown error, test failed')})
        .catch( (error) => {
            expect(error.message).to.be.contain('sendEmail error')
        })
    })

    it('should return null when sendNewSubscriberEmail() is successful', () => {
        const emailerProxy = unit({
            sendEmail: async (message) => {return null},
            promise: async () => {return { Body: "SOME CONTENT FROM S3"}}
        })
        return emailerProxy.sendNewSubscriberEmail(validAccountData,  'requestId-12345')
        .then ( response => {
            expect(response).to.be.null
        })
    })
    it('should throw when sendNewSubscriberEmail() is not successful', () => {
        const emailerProxy = unit({
            sendEmail: async (message) => {throw new Error('sendEmail error')},
            promise: async () => {return { Body: "SOME CONTENT FROM S3"}}
        })
        return emailerProxy.sendNewSubscriberEmail(validAccountData,  'requestId-12345')
        .then ( response => {
            throw new Error('should have thrown error, test failed')})
        .catch( (error) => {
            expect(error.message).to.be.contain('sendEmail error')
        })
    })
})
