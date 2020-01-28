'use strict';

const redis_client = require('../redis/redis-client');
const IP = require('../lib/ip');

exports.lookup = function(ip,  callback) {

    let error;
    const payload = {};
    payload.ip = ip;
    let args = [process.env.IP2GEO_KEYSPACE, IP.numeric(ip), '+inf', 'withscores', 'LIMIT', 0, 1];

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
            // sample response[0]
            /*
            {
                "network": "132.185.164.0/22",
                "network_start_ip": "132.185.164.0",
                "network_last_ip": "132.185.167.255",
                "network_start_integer": "2226758656",
                "network_last_integer": "2226759679",
                "geoname_id": "2643743",
                "is_anonymous_proxy": "f",
                "is_satellite_provider": "f",
                "postal_code": "N19",
                "latitude": "51.5649",
                "longitude": "-0.1351",
                "accuracy_radius": "200",
                "continent_code": "EU",
                "continent_name": "Europe",
                "country_iso_code": "GB",
                "country_name": "United Kingdom",
                "subdivision_1_iso_code": "ENG",
                "subdivision_1_name": "England",
                "city_name": "London",
                "time_zone": "Europe/London",
                "time_zone_abbr": "BST",
                "time_zone_offset": "0",
                "time_zone_is_dst": "0"
            }
            */

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
            payload.time_zone_is_dst = (data.time_zone_is_dst && data.time_zone_is_dst === 1)? true : false;

            if(data.time_zone){
                let location_date = new Date().toLocaleString("en-US", {timeZone: data.time_zone});
                location_date = new Date(location_date);
                payload.time_zone_current_time = formatDate(location_date, data.time_zone_offset);   // 2019-05-31T04:08:43-07:00
            }

            payload.is_anonymous_proxy = (data.is_anonymous_proxy && data.is_anonymous_proxy === "t")? true : false;
            payload.is_satellite_provider = (data.is_satellite_provider && data.is_satellite_provider === "t")? true : false;

            callback(null, payload);
        }
        else {
            console.error("ip2geo.lookup - no geo data for ip = " + ip) ;
            error = new Error();
            error.message = "ip2geo.lookup - no geo data for ip = " + ip;
            error.code = 400;
            callback(null, error);
        }
    });
};



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



