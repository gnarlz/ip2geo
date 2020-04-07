'use strict';

const redis = require('redis');

let client;
client = redis.createClient({
        port      : process.env.REDIS_PORT,
        host      : process.env.REDIS_IP_ADDRESS,
        password  : process.env.REDIS_PASS
});
client.on('connect', function() {
    console.log("redis client - connected");
});
client.on('error', function (err) {
    console.error("redis client - error:" + err);
});

// localhost
// client    = redis.createClient({});

module.exports = client;