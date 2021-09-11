'use strict';

const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const rateLimiter = require('./lib/rateLimiter');
const requestCounter = require('./lib/requestCounter');
const ip2geo  = require('./lib/ip2geo');
const ip2asn  = require('./lib/ip2asn');
const utilities  = require('./utility/utilities');

module.exports.lookup = (event, context) => {
    return new Promise((resolve, reject) => {
        const requestId = context.awsRequestId
        const start = new Date();
        const payload = {};
        const request = {};
        const response = {};
        let {ip, key} = event.queryStringParameters || {};
        if (!ip) {
            ip = event['requestContext']['identity']['sourceIp'];
        }
        //loadTest(ip, key);   // uncomment for quick and dirty load testing
        request.lookup_ip = ip;
        utilities.enrichRequest(request, event, context);
        utilities.setResponseHeadersCORS(response);   // enable CORS in api gateway when using lambda proxy integration

        Promise.all([validate.ip(ip), validate.key(key) ])
            .then(([ipResult, keyResult]) =>{
                return authorize.key(key, requestId);})
            .then((authorizeResult) =>{
                return rateLimiter.limit(key, authorizeResult, response);})
            .then(() => {
                return Promise.all([requestCounter.increment(key, requestId), ip2geo.lookup(ip, requestId), ip2asn.lookup(ip, requestId)]);})
            .then(([requestCounterResult, ip2geoResult, ip2asnResult]) => {
                createSuccessResponse(request, response, payload, ip2geoResult, ip2asnResult, start);
            })
            .catch((error) => {
                console.error(`handler.lookup - error returned from promise chain: ${error}`);
                createErrorResponse(request, response, payload, error, start);
            })
            .then(() => {
                payload.key = key;  // we want the api key in the logs
                console.log(JSON.stringify(payload));   // cloudwatch logging of every response
                //TODO: create a pipleline that consumes those^ cloudwatch logs and inserts them into postgres
                resolve(response);
            });
    });
};

function createErrorResponse(request, response, payload, err, start){
    payload.time_elapsed = new Date() - start;
    payload.status = "error";
    payload.status_code = err.code;
    payload.request = request;
    payload.error = {message: err.message};

    response.statusCode = err.code;
    response.body = payload
}

function createSuccessResponse(request, response, payload, geoResult, asnResult, start){
    const location = {};
    const timezone = {};
    const security = {};
    const isp = {};

    payload.time_elapsed = new Date() - start;
    payload.status = "success";
    payload.status_code = 200;
    payload.request = request;

    location.ip = geoResult.ip;
    location.latitude = geoResult.latitude;
    location.longitude = geoResult.longitude;
    location.city_name = geoResult.city_name;
    location.region_name = geoResult.subdivision_1_name;
    location.region_iso_code = geoResult.subdivision_1_iso_code;
    location.postal_code = geoResult.postal_code;
    location.country_name = geoResult.country_name;
    location.country_iso_code = geoResult.country_iso_code;
    location.continent_name = geoResult.continent_name;
    location.continent_code = geoResult.continent_code;
    payload.location = location;

    timezone.time_zone = geoResult.time_zone;
    timezone.time_zone_abbr = geoResult.time_zone_abbr;
    timezone.time_zone_offset = geoResult.time_zone_offset;
    timezone.time_zone_is_dst = geoResult.time_zone_is_dst;
    timezone.time_zone_current_time = geoResult.time_zone_current_time;
    payload.timezone = timezone;

    security.is_anonymous_proxy = geoResult.is_anonymous_proxy;
    security.is_satellite_provider = geoResult.is_satellite_provider;
    payload.security = security;

    isp.asn = asnResult.asn;
    isp.organization = asnResult.organization;
    payload.isp = isp;

    response.statusCode = 200;
    response.body = payload
}


function loadTest(ip, key){
    const ipInt = require('ip-to-int');
    ip = ipInt(Math.floor(Math.random() * Math.floor(4294967290))).toIP();
    key = process.env.VALID_KEY;
}