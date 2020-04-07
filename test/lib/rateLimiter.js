'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const rateLimiter = require('../../lib/rateLimiter');

describe('rateLimiter.limit test',() => {

    it('valid key with no ratelimiting should add 0 extra response headers', () => {
        const response = {};
        const authorizationResults = {
            authorized:true,
            message:"Account creation",
            ts:"2019-11-22 11:13:29.607000"
        };
        return rateLimiter.limit(process.env.VALID_KEY, authorizationResults, response)
            .then((data) => {
                expect(data).to.be.null;
                expect(response).to.be.empty;
            })
    });

    it('valid key with ratelimiting and not over limit should add 2 extra response headers', () => {
        const response = {};
        const authorizationResults = {
            authorized:true,
            message:"Account creation",
            ts:"2019-11-22 11:13:29.607000",
            ratelimit_max:60,
            ratelimit_duration:60000
        };
        return rateLimiter.limit(process.env.VALID_KEY, authorizationResults, response)
            .then((data) => {
                /*
                response:
                {
                    "headers":
                        {
                            "X-Requested-With":"*",
                            "Access-Control-Allow-Headers":"*",
                            "Access-Control-Allow-Origin":"*",
                            "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
                            "X-RateLimit-Limit":60,
                            "X-RateLimit-Remaining":58
                        }
                }
                 */
                expect(data).to.be.null;
                expect(response.headers["X-RateLimit-Limit"]).to.be.not.null;
                expect(response.headers["X-RateLimit-Remaining"]).to.be.not.null;
            })
    });

    it('valid key with ratelimiting and over limit should throw error and add 3 extra response headers', () => {
        const response = {};
        const authorizationResults = {
            authorized:true,
            message:"Account creation",
            ts:"2019-11-22 11:13:29.607000",
            ratelimit_max:-1,
            ratelimit_duration:60000
        };
        return rateLimiter.limit(process.env.VALID_KEY, authorizationResults, response)
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message');
                expect(error.message).to.contain('Rate limit exceeded, retry in');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 429);

                expect(response.headers["X-RateLimit-Limit"]).to.be.not.null;
                expect(response.headers["X-RateLimit-Remaining"]).to.be.not.null;
                expect(response.headers["Retry-After"]).to.be.not.null;
            })
    });
});


