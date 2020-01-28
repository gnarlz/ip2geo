'use strict';

const redis_client = require('../redis/redis-client');
const IP = require('../lib/ip');

exports.lookup = function(ip, callback) {

    let error;
    const payload = {};
    let args = [process.env.IP2ASN_KEYSPACE, IP.numeric(ip), '+inf', 'withscores', 'LIMIT', 0, 1];

    redis_client.zrangebyscore(args, function (err, response) {

        if (err) {
            console.error("ip2asn.lookup - redis error: " + err) ;
            error = new Error();
            error.message = "Server Error";
            error.info = "ip2asn.lookup - redis error: " + err;
            error.code = 500;
            return callback(error);
        }
        if(response[0]) {
            // sample response[0]
            /*
            {
                "range_start":"137.27.64.0",
                "range_end":"137.27.127.255",
                "AS_number":"20115",
                "country_code":"US",
                "AS_description":"CHARTER-NET-HKY-NC - Charter Communications"
            }
            */
            let data = JSON.parse(response[0]);
            payload.asn = data.AS_number;
            payload.organization = data.AS_description;
            callback(null, payload);
        }
        else{
            console.error("ip2asn.lookup - no asn data for ip = " + ip) ;
            error = new Error();
            error.message = "ip2asn.lookup - no asn data for ip = " + ip;
            error.code = 400;
            callback(null, error);
        }
    });
};

