'use strict';

const redisClient = require('../redis/redis-client');
const util = require('util');

exports.key = function(key, callback) {
    return new Promise((resolve, reject) => {
        const akey = "authorized:" + key;
        const args = [akey];
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);

        redisClientSendCommand('GET', args)
            .then((results) => {
                if (results) {
                    /*
                    sample redis reply for valid key with rate limiting:
                    {
                        "authorized":true,
                        "message":"Account creation",
                        "ts":"2019-11-22 11:13:29.607000",
                        "ratelimit_max":60,
                        "ratelimit_duration":60000
                     }
                     */
                    let data = JSON.parse(results);

                    if(data.authorized === true) {
                        resolve(data);
                    }
                    else if (data.authorized  === false){
                        console.error("authorize.key - Unauthorized API key returned from Redis :       key: " +
                            akey + "     redis reply: " + results);
                        const error = new Error();
                        error.message = data.message;
                        error.code = 403;
                        reject(error);
                    }
                    else{
                        console.error("authorize.key - garbage redis reply :       key: " +
                            akey + "     redis reply: " + results);
                        const error = new Error();
                        error.message = "Internal server error";
                        error.code = 500;
                        reject(error);
                    }

                } else {   //key doesnt exist in redis, null is returned
                    console.error("authorize.key - API key unrecognized (not found in Redis):       key: " +
                        akey + "     redis reply: " + results);
                    const error = new Error();
                    error.message = "API Key is unrecognized: " + key;
                    error.code = 401;
                    reject(error);
                }
            })
            .catch((error) => {
                console.error("authorize.key - redis error attempting to authorize key: " +
                    akey + "        error: " + error) ;
                reject(error);
            });
    });
};