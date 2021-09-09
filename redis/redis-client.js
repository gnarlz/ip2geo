'use strict'

const redis = require('redis')

let client
const redisOpts = {
    port      : process.env.REDIS_PORT,
    host      : process.env.REDIS_IP_ADDRESS,
    password  : process.env.REDIS_PASS
}

if (!(process.env.NODE_ENV && process.env.NODE_ENV === 'unit')){
    console.log(`redisOpts: ${JSON.stringify(redisOpts,null,2)}`)
    client = redis.createClient(redisOpts)  

    client.on('connect', function() {
        console.log("redis client - connected")
    })
    client.on('error', function (err) {
        console.error("redis client - error:" + err)
    })
}

module.exports = client