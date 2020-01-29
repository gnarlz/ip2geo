'use strict';

const redis_client = require('../redis/redis-client');
const postgres_client = require('../postgres/postgres-client');
const Limiter = require('ratelimiter');


exports.key = function(key, callback) {

    let akey = "authorized:" + key;
    let authorized;
    let message;
    let ratelimit_max;
    let ratelimit_duration;

    redis_client.get(akey, function (err, reply) {
        if (err) {
            console.error("authorize.key - redis error attempting to authorize key:      key: " + akey + "        error: " + err) ;
            return callback(err);
        }

        let error;

        //key doesnt exist in redis, null is returned
        if (!reply){
            console.error("authorize.key - API key unrecognized (not found in Redis):       key: " + akey + "     redis reply: " + reply);
            error = new Error();
            error.message = "API Key is unrecognized: " + key;
            error.code = 401;
            callback(error);
        }
        else
        {
            // sample redis reply:
            /*
            {
	            "authorized":true,
	            "message":"Account creation",
	            "ts":"2019-11-22 11:13:29.607000",
	            "ratelimit_max":60,
	            "ratelimit_duration":60000
            }
            */
            let data = JSON.parse(reply);
            authorized = data.authorized; // boolean
            message = data.message;
            ratelimit_max = data.ratelimit_max;
            ratelimit_duration = data.ratelimit_duration;

            if(authorized === true){

                // rate limiting for Free plan subscribers
                if(ratelimit_max){
                    applyRateLimiting(key, ratelimit_max, ratelimit_duration, callback);
                }
                else{
                    callback(null);
                }

                // increment request counter for this key in postgres
                // TODO: replace with a dynamodb global table
                postgres_client.query("update key.request set total = total+1 , updated_at = now() where key='" + key + "' RETURNING total",  (error, result) => {
                    if (error) {
                        console.error("authorize.key - problem incrementing key.request:      key: " + akey + "        error: " + error) ;
                        // intentionally drop error on floor - this error is unfortunate, but not fatal
                    }
                });
            }
            else if (authorized === false){
                console.error("authorize.key - Unauthorized API key returned from Redis :       key: " + akey + "     redis reply: " + reply);
                error = new Error();
                error.message = message;
                error.code = 403;
                callback(error);
            }
            else{
                console.error("authorize.key - garbage redis reply :       key: " + akey + "     redis reply: " + reply);
                error = new Error();
                error.message = "Internal server error";
                error.code = 500;
                callback(error);
            }
        }
    });
};


function applyRateLimiting(key, ratelimit_max, ratelimit_duration, callback){
    let limit = new Limiter({
        id: key,
        db: redis_client,
        max: ratelimit_max,
        duration: ratelimit_duration
    });

    limit.get(function(err, limit) {
        if (err){
            console.log("rate limiter error: " + err);
            //intentionally drop error on floor - this error is unfortunate, but not fatal
            callback(null);
        }
        else{
            const ratelimit = {};
            ratelimit.total = limit.total;
            ratelimit.remaining = limit.remaining;

            if(Number(limit.remaining) <= 0){
                let delta = (limit.reset * 1000) - Date.now() | 0;
                let error = new Error();
                error.message = "Rate limit exceeded, retry in " + delta + " ms";
                error.code = 429;
                error.limit = limit.total;
                error.remaining = limit.remaining;
                error.retry = (limit.reset * 1000);
                callback(error);
            }
            else{
                callback(null, JSON.stringify(ratelimit));
            }
        }
    });
}