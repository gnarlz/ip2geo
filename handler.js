'use strict';

const async = require('async');
const validate = require('./lib/validate');
//const uuidValidate = require('uuid-validate');
const isIp = require('is-ip');
const authorize = require('./lib/authorize');
const ip2geo  = require('./lib/ip2geo');
const ip2asn  = require('./lib/ip2asn');
const postgres_client = require('./postgres/postgres-client');
const moment = require('moment');




module.exports.lookup = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    //console.log(JSON.stringify(event));

    // TODO: potentially revisit, or just let pingdom warm the lambda
    /*
    // serverless warmup plugin did weird unpredictible stuff, thats why this is commented out
    if (event.source === 'serverless-plugin-warmup') {
        return callback(null, 'Lambda is warm!')
    }
    */


    const start = new Date();
    let time_elapsed;


    let {ip, key, cb} = event.queryStringParameters || {};
    if (!ip) {
        ip = event['requestContext']['identity']['sourceIp'];
    }


    // =============== LOAD TESTING ===============================================
    // uncomment for quick and dirty load testing only
    // const ipInt = require('ip-to-int');
    // ip = ipInt(Math.floor(Math.random() * Math.floor(4294967290))).toIP();
    // key = 'c0ee3250-6a73-11e9-9ee1-f528bffeceb6';
    // =============== LOAD TESTING ===============================================

    const log = {};
    const payload = {};
    const request = {};
    const location = {};
    const timezone = {};
    const security = {};
    const isp = {};

    const response = {};
    // enable CORS in api gateway when using lambda proxy integration
    response.headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Request-Method": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    };


    const request_id = context.awsRequestId;
    let source_ip = event['requestContext']['identity']['sourceIp'];
    let request_ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');




    async.waterfall(
        [
            function validateArgs(callback) {
                validate.args(ip, key, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    else {
                        callback(null);
                    }
                });
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
            },

            function lookup(callback) {
                async.parallel(
                    [
                        function lookup_geo(callback) {
                            ip2geo.lookup(ip, (err, data) => {
                                if (err) {
                                    console.error("error returned from geo lookup for ip =  " + ip + "      ERROR: " + err);
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
                                    console.error("error returned from asn lookup for ip =  " + ip + "      ERROR: " + err);
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
                            results[0].asn = results[1].asn;
                            results[0].organization = results[1].organization;
                            callback(null, results[0]);
                        }
                    }
                );
            }
        ],
        function (err, results) {

            request.request_id = request_id;
            request.request_ts = request_ts;
            request.source_ip = source_ip;
            request.lookup_ip = ip;

            request.is_desktop = (event['headers']['CloudFront-Is-Desktop-Viewer'] == "true")? true:false;
            request.is_mobile = (event['headers']['CloudFront-Is-Mobile-Viewer'] == "true")? true:false;
            request.is_smart_tv = (event['headers']['CloudFront-Is-SmartTV-Viewer'] == "true")? true:false;
            request.is_tablet = (event['headers']['CloudFront-Is-Tablet-Viewer'] == "true")? true:false;

            request.viewer_country = event['headers']['CloudFront-Viewer-Country'];
            request.accept_language = event['headers']['Accept-Language'];
            request.origin = event['headers']['origin'];
            request.referer = event['headers']['Referer'];
            request.user_agent = event['headers']['User-Agent'];

            time_elapsed = new Date() - start;

            if (err) {
                console.error("handler.lookup - error returned from outer async.waterfall: " + err);

                payload.status = "error";
                payload.status_code = err.code;
                payload.time_elapsed = time_elapsed;
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
            else {

                payload.status = "success";
                payload.status_code = 200;
                payload.time_elapsed = time_elapsed;
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

                if (cb) {
                    response.body = cb + '(' + JSON.stringify(payload) + ')';
                }
                else {
                    response.body = JSON.stringify(payload);
                }

            }


            // ====================================   CLOUDWATCH LOGGING   ===============================================
            payload.key = key;
            console.log(JSON.stringify(payload));




            //TODO: this slows things down and is it really needed? review
            // ====================================    POSTGRES LOGGING   ===============================================

            const sql = "INSERT INTO log.lookup (" +
                "request_id,request_ts,key,lookup_ip,source_ip,is_desktop,is_mobile,is_smart_tv,is_tablet,viewer_country, accept_language, host,path,origin,referer,user_agent," +
                "status,status_code,time_elapsed," +
                "latitude,longitude,city_name,subdivision_1_name,subdivision_1_iso_code," +
                "postal_code,country_name,country_iso_code,continent_name,continent_code," +
                "time_zone,time_zone_abbr,time_zone_offset,time_zone_is_dst,time_zone_current_time," +
                "is_anonymous_proxy,is_satellite_provider,asn,organization,error_message) " +
                "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38, $39)"
            const values = [
                payload.request.request_id,
                payload.request.request_ts,
                payload.key,
                (isIp(payload.request.lookup_ip)? payload.request.lookup_ip : null),
                payload.request.source_ip,
                payload.request.is_desktop,
                payload.request.is_mobile,
                payload.request.is_smart_tv,
                payload.request.is_tablet,
                payload.request.viewer_country,
                payload.request.accept_language,
                payload.request.host,
                payload.request.path,
                payload.request.origin,
                payload.request.referer,
                payload.request.user_agent,

                payload.status,
                payload.status_code,
                payload.time_elapsed,

                (payload.location ? payload.location.latitude : 0.0),
                (payload.location ? payload.location.longitude : 0.0),
                (payload.location ? payload.location.city_name : null),
                (payload.location ? payload.location.subdivision_1_name : null),
                (payload.location ? payload.location.subdivision_1_iso_code : null),
                (payload.location ? payload.location.postal_code : null),
                (payload.location ? payload.location.country_name : null),
                (payload.location ? payload.location.country_iso_code : null),
                (payload.location ? payload.location.continent_name : null),
                (payload.location ? payload.location.continent_code : null),

                (payload.timezone ? payload.timezone.time_zone : null),
                (payload.timezone ? payload.timezone.time_zone_abbr : null),
                (payload.timezone ? payload.timezone.time_zone_offset : 0),
                (payload.timezone ? payload.timezone.time_zone_is_dst : false),
                (payload.timezone ? payload.timezone.time_zone_current_time : null),

                (payload.security ? payload.security.is_anonymous_proxy : false),
                (payload.security ? payload.security.is_satellite_provider : false),

                (payload.isp ? payload.isp.asn : null),
                (payload.isp ? payload.isp.organization : null),

                (payload.error ? payload.error.message : null)
            ];


            postgres_client.query(sql, values, (err, res) => {
                if (err) {
                    console.error("handler.lookup - problem persisting log statement in postgres: " + err);
                }

                payload.key = '';
                callback(null, response);

            });






        }
    );



};
