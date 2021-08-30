'use strict';

const redisClient = require('../redis/redis-client');
const RateLimiter = require('ratelimiter');

exports.limit = function (key, authorizationResults, response){
    return new Promise((resolve, reject) => {

        if(!authorizationResults.ratelimit_max){
            resolve(null);
        }

        const rateLimiterConfig =  {
            id: key,
            db: redisClient,
            max: authorizationResults.ratelimit_max,
            duration: authorizationResults.ratelimit_duration
        };
        const limiter = new RateLimiter(rateLimiterConfig);

        limiter.get(function(error, limit) {
            if (error){
                console.log("rateLimit.limit error: " + error);
                resolve(null); // this error is unfortunate, but not fatal
            }
            else{
                if(!response.headers){
                    response.headers = {};
                }
                response.headers["X-RateLimit-Limit"] = limit.total;
                response.headers["X-RateLimit-Remaining"] = limit.remaining-1;

                if (!limit.remaining){
                    const delta = (limit.reset * 1000) - Date.now() | 0;
                    response.headers["Retry-After"] = delta;
                    const error = new Error();
                    error.message = "Rate limit exceeded, retry in " + delta + " ms";
                    error.code = 429;
                    reject(error);
                }
                resolve(null);
            }
        });
    });
}