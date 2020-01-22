'use strict';

const redis_client = require('../redis/redis-client');
const IP = require('../lib/ip');

exports.lookup = function(ip,  callback) {

    let error;
    const payload = {};
    payload.ip = ip;

    let network_last_integer = IP.numeric(ip);

    // TODO: REMOVE DATE PART from this redis keyspace
    //let keyspace = "ip2geo-09.24.2019";
    let keyspace = "ip2geo-11.20.2019";

    let args = [keyspace, network_last_integer, '+inf', 'LIMIT', 0, 1];
    redis_client.zrangebyscore(args, function (err, response) {

        if (err) {
            console.error("ip2geo.lookup - redis error: " + err) ;
            error = new Error();
            error.message = "Server Error";
            error.info = "ip2geo.lookup - redis error: " + err;
            error.code = 500;
            return callback(error);
        }

        if(response[0]) {
            let data = JSON.parse(response[0]);
            payload.latitude = (data.latitude? parseFloat(data.latitude) : 0.0);
            payload.longitude = (data.longitude? parseFloat(data.longitude) : 0.0);
            payload.city_name = data.city_name;
            payload.subdivision_1_name = data.subdivision_1_name;
            payload.subdivision_1_iso_code = data.subdivision_1_iso_code;
            payload.postal_code = data.postal_code;
            payload.country_name = data.country_name;
            payload.country_iso_code = data.country_iso_code;
            payload.continent_name = data.continent_name;
            payload.continent_code = data.continent_code;
            payload.time_zone = data.time_zone;
            payload.time_zone_abbr = data.time_zone_abbr;
            payload.time_zone_offset = (data.time_zone_offset? parseInt(data.time_zone_offset) : 0);
            payload.time_zone_is_dst = (data.time_zone_is_dst && data.time_zone_is_dst == 1)? true : false;

            //let location_date = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
            if(data.time_zone){
                let location_date = new Date().toLocaleString("en-US", {timeZone: data.time_zone});
                location_date = new Date(location_date);
                payload.time_zone_current_time = formatDate(location_date, data.time_zone_offset);   // 2019-05-31T04:08:43-07:00
            }

            payload.is_anonymous_proxy = (data.is_anonymous_proxy && data.is_anonymous_proxy == "t")? true : false;
            payload.is_satellite_provider = (data.is_satellite_provider && data.is_satellite_provider == "t")? true : false;

            callback(null, payload);
        }
        else {
            console.error("ip2geo.lookup - no geo data for ip = " + ip) ;
            callback(null, payload);
        }

    });

}



function formatDate(datex, offset){

    var tzo = offset/60,
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return datex.getFullYear() +
        '-' + pad(datex.getMonth() + 1) +
        '-' + pad(datex.getDate()) +
        'T' + pad(datex.getHours()) +
        ':' + pad(datex.getMinutes()) +
        ':' + pad(datex.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}



