'use strict';

const postgres_client = require('./postgres-client');
const isIp = require('is-ip');

exports.log = function(payload, callback) {

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
            console.error("payload-logger.log - problem persisting log statement in postgres: " + err);
        }
        callback(null);
    });

};

