'use strict';

const redisClient = require('../redis/redis-client');
const IP = require('../utility/ip');
const util = require('util');

exports.lookup = function(ip, requestId) {
    return new Promise((resolve, reject) => {
        const payload = {};
        const args = [process.env.IP2ASN_KEYSPACE, IP.numeric(ip, requestId), '+inf', 'withscores', 'LIMIT', 0, 1];
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((results) => {
                if (results[0]) {
                    let data = JSON.parse(results[0]);
                    payload.asn = data.AS_number;
                    payload.organization = data.AS_description;
                    resolve(payload);
                } else {
                    const error = new Error();
                    error.message = "ip2asn.lookup - no asn data for ip = " + ip;
                    error.code = 400;
                    console.error(error.message);
                    reject(error);
                }
            })
            .catch((err) => {
                const error = new Error();
                error.message = "ip2asn.lookup - no asn data for ip = " + ip;
                error.code = 400;
                console.error(error.message);
                reject(error);
            });
    });
};

