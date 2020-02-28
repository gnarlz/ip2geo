'use strict';

const async = require('async');
const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const ip2geo  = require('./lib/ip2geo');
const ip2asn  = require('./lib/ip2asn');
const moment = require('moment');
const payloadLogger = require('./postgres/payload-logger');


module.exports.lookup = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    const start = new Date();
    const payload = {};
    const request = {};
    const response = {};

    let {ip, key} = event.queryStringParameters || {};
    if (!ip) {
        ip = event['requestContext']['identity']['sourceIp'];
    }

    request.lookup_ip = ip;
    enrichRequest(request, event, context);
    setResponseHeadersCORS(response);   // enable CORS in api gateway when using lambda proxy integration

    // =============== LOAD TESTING ===============================================
    // uncomment for quick and dirty load testing only
    // const ipInt = require('ip-to-int');
    // ip = ipInt(Math.floor(Math.random() * Math.floor(4294967290))).toIP();
    // key = 'c0ee3250-6a73-11e9-9ee1-f528bffeceb6';
    // =============== LOAD TESTING ===============================================

    async.series(
        [
            function verifyRequest(callback){
                doVerifyRequest (ip, key, response, callback);
            },
            function lookup(callback) {
                doLookup(ip, callback);
            }
        ],
        function (err, results) {
            payload.time_elapsed = new Date() - start;
            if (err) {
                console.error("handler.lookup - error returned from async.series: " + err);
                createErrorResponse(request, response, payload, err);
            }
            else {
                // results[0] is data returned from verifyRequest
                // results[1] is data returned from lookup
                createSuccessResponse(request, response, payload, results[1])
            }

            // ====================================   CLOUDWATCH LOGGING   =============================================
            payload.key = key;
            console.log(JSON.stringify(payload));

            // ====================================    POSTGRES LOGGING   ==============================================
            //TODO: this is awful - replace with a pipleline that consumes cloudwatch logs and inserts them into postgres
            payloadLogger.log(payload, () => {
                payload.key = '';
                callback(null, response);
            });
        }
    );

};



function enrichRequest(request, event, context){

    request.request_id = context.awsRequestId;
    request.request_ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    request.source_ip = event['requestContext']['identity']['sourceIp'];
    request.is_desktop = (event['headers']['CloudFront-Is-Desktop-Viewer'] === "true");
    request.is_mobile = (event['headers']['CloudFront-Is-Mobile-Viewer'] === "true");
    request.is_smart_tv = (event['headers']['CloudFront-Is-SmartTV-Viewer'] === "true");
    request.is_tablet = (event['headers']['CloudFront-Is-Tablet-Viewer'] === "true");
    request.viewer_country = event['headers']['CloudFront-Viewer-Country'];
    request.accept_language = event['headers']['Accept-Language'];
    request.origin = event['headers']['origin'];
    request.referer = event['headers']['Referer'];
    request.user_agent = event['headers']['User-Agent'];

}

function setResponseHeadersCORS(response){

    response.headers = {
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

}


function createErrorResponse(request, response, payload, err){

    payload.status = "error";
    payload.status_code = err.code;
    payload.request = request;
    payload.error = {message: err.message};

    response.statusCode = err.code;
    response.body = JSON.stringify(payload);

    // key exceeded rate limit
    if(Number(err.code) === 429){
        response.headers["X-RateLimit-Limit"] = err.limit ;
        response.headers["X-RateLimit-Remaining"] = err.remaining;
        response.headers["X-RateLimit-Retry-After"] = err.retry;
    }
}


function createSuccessResponse(request, response, payload, results){

    const location = {};
    const timezone = {};
    const security = {};
    const isp = {};

    payload.status = "success";
    payload.status_code = 200;
    payload.request = request;

    location.ip = results.ip;
    location.latitude = results.latitude;
    location.longitude = results.longitude;
    location.city_name = results.city_name;
    location.region_name = results.subdivision_1_name;
    location.region_iso_code = results.subdivision_1_iso_code;
    location.postal_code = results.postal_code;
    location.country_name = results.country_name;
    location.country_iso_code = results.country_iso_code;
    location.continent_name = results.continent_name;
    location.continent_code = results.continent_code;
    payload.location = location;

    timezone.time_zone = results.time_zone;
    timezone.time_zone_abbr = results.time_zone_abbr;
    timezone.time_zone_offset = results.time_zone_offset;
    timezone.time_zone_is_dst = results.time_zone_is_dst;
    timezone.time_zone_current_time = results.time_zone_current_time;
    payload.timezone = timezone;

    security.is_anonymous_proxy = results.is_anonymous_proxy;
    security.is_satellite_provider = results.is_satellite_provider;
    payload.security = security;

    isp.asn = results.asn;
    isp.organization = results.organization;
    payload.isp = isp;

    response.statusCode = 200;
    response.body = JSON.stringify(payload);

}


function doVerifyRequest (ip, key, response, callback){
    async.parallel([
            function validateIP(callback) {
                callback(validate.ip(ip));
            },
            function validateKey(callback) {
                callback(validate.key(key));
            },
            function authorizeKey(callback) {
                authorize.key(key, (err, data) => {
                    if (err) {
                        return callback(err);
                    }
                    else {
                        if(data){
                            let ratelimit = JSON.parse(data);
                            response.headers["X-RateLimit-Limit"] = ratelimit.total;
                            response.headers["X-RateLimit-Remaining"] = ratelimit.remaining;
                        }
                        callback(null);
                    }
                });
            }
        ],
        function (err, results) {
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        }
    );
}




function doLookup(ip, callback) {
    async.parallel(
        [
            function lookup_geo(callback) {
                ip2geo.lookup(ip, (err, data) => {
                    if (err) {
                        console.error("error returned from geo lookup for ip =  " +
                            ip + "      ERROR: " + err);
                        return callback(err);
                    }
                    else{
                        callback(null, data);
                    }
                })
            },
            function lookup_asn(callback) {
                ip2asn.lookup(ip, (err, data) => {
                    if (err) {
                        console.error("error returned from asn lookup for ip =  " +
                            ip + "      ERROR: " + err);
                        return callback(err);
                    }
                    else {
                        callback(null, data);
                    }
                })
            }
        ],
        function (err, results) {
            if (err) {
                callback(err);
            }
            else {
                // results[0] is data returned from ip2geo.lookup
                // results[1] is data returned from ip2asn.lookup
                results[0].asn = results[1].asn;
                results[0].organization = results[1].organization;
                callback(null, results[0]);
            }
        }
    );
}