'use strict';

const redis = require('redis');

let client;
if (typeof client === 'undefined') {

    client    = redis.createClient({
        port      : process.env.REDIS_PORT,
        host      : process.env.REDIS_IP_ADDRESS,
        password  : process.env.REDIS_PASS
    });

    // localhost
    /*
    client    = redis.createClient({
    });
    */

    client.on('connect', function() {
        console.log("redis - connected");
    });

    client.on('error', function (err) {
        console.error("redis-client.js - error:" + err);
    });

}
module.exports = client;