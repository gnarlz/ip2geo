'use strict';

const redis_client = require('../redis/redis-client');
const IP = require('../lib/ip');

exports.lookup = function(ip, callback) {

    let error;
    const payload = {};

    let network_last_integer = IP.numeric(ip);

    // TODO: REMOVE DATE PART from this redis keyspace
    let keyspace = "ip2asn-09.24.2019";


    let args = [keyspace, network_last_integer, '+inf', 'LIMIT', 0, 1];

    redis_client.zrangebyscore(args, function (err, response) {

        if (err) {
            console.error("ip2asn.lookup - redis error: " + err) ;
            error = new Error();
            error.message = "Server Error";
            error.info = "ip2asn.lookup - redis error: " + err;
            error.code = 500;
            return callback(error);
        }

        // console.log('ip2asn json from redis: ', response[0]);
        // {"range_start":"137.27.64.0","range_end":"137.27.127.255","AS_number":"20115","country_code":"US","AS_description":"CHARTER-NET-HKY-NC - Charter Communications"}

        if(response[0]) {
            let data = JSON.parse(response[0]);
            payload.asn = data.AS_number;
            payload.organization = data.AS_description;
            callback(null, payload);
        }
        else{
            console.error("ip2asn.lookup - no asn for ip = " + ip) ;
            callback(null, payload);
        }
    });


}

