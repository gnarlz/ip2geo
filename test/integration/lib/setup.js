'use strict';

const redisClient = require('../../redis/redis-client');
const postgresClient = require('../../postgres/postgres-client');
const util = require('util');
const IP = require('../../lib/ip');

exports.run = function() {
    Promise.all([
        setValidKey(), setRevokedKey(), setExceededPlanLimitKey(),setExceededRateLimitKey(),
        setPaymentPastDueKey(), setAccountTerminatedKey(), setFreeTrialEndedKey(),
        createIP2GEORedisGoogle(), verifyIP2GEORedisGoogle(),
        createIP2ASNRedisGoogle(), verifyIP2ASNRedisGoogle(),
        createIP2GEORedisMadison(), verifyIP2GEORedisMadison(),
        createIP2ASNRedisMadison(), verifyIP2ASNRedisMadison(),
        createIP2GEORedisYokahama(), verifyIP2GEORedisYokahama(),
        createIP2ASNRedisYokahama(), verifyIP2ASNRedisYokahama(),
        createSchemaLog(), creatTableLogLookup(),
        createSchemaKey(), createTableKeyRequest(), insertTableKeyRequest(),
        createTableKeyLimit(), insertTableKeyLimit(),
        createTableKeyAuthorization(), insertTableKeyAuthorization(),
        createTableKeyAccount(), insertTableKeyAccount()
    ])
        .then((result) =>{
            console.log("setup.run - completed successfully");
        })
        .catch((error) => {
            console.error("setup.run - error: " + error);
        })
}


function setValidKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.VALID_KEY,
            '{"authorized":true,"message":"Reset key.request.total","ts":"2019-10-19 12:01:32.818000",' +
            '"ratelimit_max":5,"ratelimit_duration":60000}'];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setRevokedKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.REVOKED_KEY,
            '{"authorized":false,"message":"Your API key has been revoked due to abuse. ' +
            'Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-06 14:02:38.595000"}'];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setExceededPlanLimitKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.EXCEEDED_PLAN_LIMIT_KEY,
            '{"authorized":false,"message":"Your API key has been suspended because you have exceeded your plans ' +
            'monthly request limit. Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-07 10:25:23.984000"}'];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setExceededRateLimitKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.EXCEEDED_RATE_LIMIT_KEY,
            '{"authorized":false,"message":"Your API key has been suspended because you have exceeded the rate limit. ' +
            'Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-06 14:05:50.768000"}'];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setPaymentPastDueKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.PAYMENT_PAST_DUE__KEY,
            '{"authorized":false,"message":"Your API key has been suspended because your account payment is past due. ' +
            'Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-06 14:06:53.492000"}'
        ];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setAccountTerminatedKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.ACCOUNT_TERMINATED__KEY,
            '{"authorized":false,"message":"Your API key has been suspended because your account has been terminated. ' +
            'Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-06 14:07:02.190000"}'
        ];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}

function setFreeTrialEndedKey(){
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = ["authorized:"+ process.env.FREE_TRIAL_ENDED_KEY,
            '{"authorized":false,"message":"Your API key has been suspended because your free trial has ended. ' +
            'Please contact support@ip2geo.co to resolve this issue.","ts":"2019-09-06 14:07:09.790000"}'
        ];
        return redisClientSendCommand('SET', args)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("redis error: " + JSON.stringify(error));
                reject(error);
            })
    });
}


function createIP2GEORedisGoogle() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"network":"8.8.0.0/19","network_start_ip":"8.8.0.0","network_last_ip":"8.8.31.255","network_start_integer":"134742016",' +
        '"network_last_integer":"134750207","geoname_id":"6252001","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"",' +
        '"latitude":"37.7510","longitude":"-97.8220","accuracy_radius":"1000","continent_code":"NA","continent_name":"North America",' +
        '"country_iso_code":"US","country_name":"United States","subdivision_1_iso_code":"","subdivision_1_name":"","city_name":"",' +
        '"time_zone":"America/Chicago","time_zone_abbr":"CDT","time_zone_offset":"-21600","time_zone_is_dst":"0"}';
        let args = [ process.env.IP2GEO_KEYSPACE, 134750207,  json];
        return redisClientSendCommand('ZADD', args)
            .then(() => {
                console.log("created ip2geo google entry in redis for ip 8.8.8.8");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2geo google entry in redis for ip 8.8.8.8");
                reject(error);
            })
    });
}
function verifyIP2GEORedisGoogle() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('8.8.8.8'), '+inf', 'withscores', 'LIMIT', 0, 1];
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2geo google entry in redis for ip 8.8.8.8: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore ip2geo google entry in redis for ip 8.8.8.8");
                reject(error);
            })
    });
}

function createIP2ASNRedisGoogle() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"range_start":"8.8.8.0","range_end":"8.8.8.255","AS_number":"15169","country_code":"US","AS_description":"GOOGLE - Google LLC"}';
        let args = [ process.env.IP2ASN_KEYSPACE, 134750207,  json];
        return redisClientSendCommand('ZADD', args)
            .then((response) => {
                console.log("created ip2asn google entry in redis for ip 8.8.8.8");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2asn google entry in redis for ip 8.8.8.8");
                reject(error);
            })
    });
}
function verifyIP2ASNRedisGoogle() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('8.8.8.8'), '+inf', 'withscores', 'LIMIT', 0, 1];
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2asn google entry in redis for ip 8.8.8.8: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore ip2asn google entry in redis for ip 8.8.8.8\"");
                reject(error);
            })
    });
}



function createIP2GEORedisMadison() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"network":"137.27.69.72/30","network_start_ip":"137.27.69.72","network_last_ip":"137.27.69.75","network_start_integer":"2300265800",' +
            '"network_last_integer":"2300265803","geoname_id":"5261457","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"53711",' +
            '"latitude":"43.0334","longitude":"-89.4512","accuracy_radius":"20","continent_code":"NA","continent_name":"North America","country_iso_code":"US",' +
            '"country_name":"United States","subdivision_1_iso_code":"WI","subdivision_1_name":"Wisconsin","city_name":"Madison","time_zone":"America/Chicago",' +
            '"time_zone_abbr":"CDT","time_zone_offset":"-21600","time_zone_is_dst":"0"}';
        let args = [ process.env.IP2GEO_KEYSPACE, 2300265803,  json];
        return redisClientSendCommand('ZADD', args)
            .then(() => {
                console.log("created ip2geo madison entry in redis for ip 137.27.69.73");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2geo madison entry in redis for ip 137.27.69.73");
                reject(error);
            })
    });
}
function verifyIP2GEORedisMadison() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('137.27.69.73'), '+inf', 'withscores', 'LIMIT', 0, 1];
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2geo madison entry in redis for ip 137.27.69.73: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore ip2geo madison entry in redis for ip 137.27.69.73");
                reject(error);
            })
    });
}


function createIP2ASNRedisMadison() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"range_start":"137.26.128.0","range_end":"137.27.251.255","AS_number":"20115","country_code":"US","AS_description":"CHARTER-NET-HKY-NC - Charter Communications"}';
        let args = [ process.env.IP2ASN_KEYSPACE, 2300265803,  json];
        return redisClientSendCommand('ZADD', args)
            .then((response) => {
                console.log("created ip2asn madison entry in redis for ip 137.27.69.73");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2asn madison entry in redis for ip 137.27.69.73");
                reject(error);
            })
    });
}
function verifyIP2ASNRedisMadison() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('137.27.69.73'), '+inf', 'withscores', 'LIMIT', 0, 1];
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2asn madison entry in redis for ip 137.27.69.73: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore ip2asn madison entry in redis for ip 137.27.69.73");
                reject(error);
            })
    });
}


function createIP2GEORedisYokahama() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"network":"2001:200:100::/40","network_start_ip":"2001:200:100::","network_last_ip":"2001:200:1ff:ffff:ffff:ffff:ffff:ffff",' +
            '"network_start_integer":"42540528727104535073712549388527599616","network_last_integer":"42540528727414020083533894457252380671",' +
            '"geoname_id":"1848354","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"223-0061","latitude":"35.5569","longitude":"139.6444",' +
            '"accuracy_radius":"20","continent_code":"AS","continent_name":"Asia","country_iso_code":"JP","country_name":"Japan",' +
            '"subdivision_1_iso_code":"14","subdivision_1_name":"Kanagawa","city_name":"Yokohama","time_zone":"Asia/Tokyo","time_zone_abbr":"JST",' +
            '"time_zone_offset":"32400","time_zone_is_dst":"0"}';
        let args = [ process.env.IP2GEO_KEYSPACE, '42540528727414020083533894457252380671',  json];
        return redisClientSendCommand('ZADD', args)
            .then(() => {
                console.log("created ip2geo yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2geo yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                reject(error);
            })
    });
}
function verifyIP2GEORedisYokahama() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('2001:200:1c0:2000:0:0:0:0'), '+inf', 'withscores', 'LIMIT', 0, 1];
        // network last integer: 42540528727414020083533894457252380671
        // ip to find:  42540528727336799946806010018718023680   2001:200:1c0:2000:0:0:0:0   IP.numeric('2001:200:1c0:2000:0:0:0:0')
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2geo yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore yokahama madison entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                reject(error);
            })
    });
}


function createIP2ASNRedisYokahama() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let json = '{"range_start":"2001:200::","range_end":"2001:200:5ff:ffff:ffff:ffff:ffff:ffff","AS_number":"2500","country_code":"JP","AS_description":"WIDE-BB WIDE Project"}';
        let args = [ process.env.IP2ASN_KEYSPACE, '42540528727414020083533894457252380671',  json];
        return redisClientSendCommand('ZADD', args)
            .then((response) => {
                console.log("created ip2asn yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                resolve();
            })
            .catch((error) => {
                console.error("problem creating ip2asn yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                reject(error);
            })
    });
}
function verifyIP2ASNRedisYokahama() {
    return new Promise((resolve, reject) => {
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient);
        let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('2001:200:1c0:2000:0:0:0:0'), '+inf', 'withscores', 'LIMIT', 0, 1];
        return redisClientSendCommand('ZRANGEBYSCORE', args)
            .then((response) => {
                console.log("selected zrangebyscore ip2asn yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0: " + response[0]);
                resolve();
            })
            .catch((error) => {
                console.error("problem selecting zrangebyscore ip2asn yokahama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                reject(error);
            })
    });
}

function createSchemaLog(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE SCHEMA IF NOT EXISTS log";
        postgresClient.query(sql)
            .then(result => {
                console.log("created schema log in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating schema log in postgres: " + error);
                reject(error);
            })
            //.then(() => postgresClient.end());
    });
}

function creatTableLogLookup(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS log.lookup (request_id uuid PRIMARY KEY,request_ts timestamp NOT NULL,key uuid," +
            "lookup_ip inet,source_ip inet,is_desktop boolean,is_mobile boolean,is_smart_tv boolean,is_tablet boolean," +
            "viewer_country character varying,accept_language character varying,host character varying,path character varying," +
            "origin character varying,referer character varying,user_agent character varying,status character varying," +
            "status_code smallint,time_elapsed smallint,latitude float,longitude float,city_name character varying," +
            "subdivision_1_name character varying,subdivision_1_iso_code character varying,postal_code character varying," +
            "country_name character varying,country_iso_code character varying,continent_name character varying," +
            "continent_code character varying,time_zone character varying,time_zone_abbr character varying,time_zone_offset smallint," +
            "time_zone_is_dst boolean,time_zone_current_time character varying,is_anonymous_proxy boolean,is_satellite_provider boolean," +
            "asn character varying,organization character varying,error_message character varying)";
        postgresClient.query(sql)
            .then(result => {
                console.log("created table log.lookup in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating table log.lookup in postgres: " + error);
                reject(error);
            })
    });
}

function createSchemaKey(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE SCHEMA IF NOT EXISTS key";
        postgresClient.query(sql)
            .then(result => {
                console.log("created schema key in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating schema key in postgres: " + error);
                reject(error);
            })
    });
}

function createTableKeyRequest(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS key.request (key character varying NOT NULL,total bigint NOT NULL," +
            "created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
        postgresClient.query(sql)
            .then(result => {
                console.log("created table key.request in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating table key.request in postgres: " + error);
                reject(error);
            })
    });
}

function insertTableKeyRequest(){
    return new Promise((resolve, reject) => {
        const sql = "insert into key.request (key,total,created_at,updated_at) values ('" + process.env.VALID_KEY + "', 0, now(), now())";
        postgresClient.query(sql)
            .then(result => {
                console.log("inserted row into key.request for key " + process.env.VALID_KEY);
                resolve();
            })
            .catch(error => {
                console.error("problem inserting into table key.request in postgres: " + error);
                reject(error);
            })
    });
}

function createTableKeyLimit(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS key.limit (key character varying NOT NULL,limit_ bigint NOT NULL,ratelimit_max bigint,ratelimit_duration bigint," +
            "created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
        postgresClient.query(sql)
            .then(result => {
                console.log("created table key.limit in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating table key.limit in postgres: " + error);
                reject(error);
            })
    });
}

function insertTableKeyLimit(){
    return new Promise((resolve, reject) => {
        const sql = "insert into key.limit (key,limit_,created_at,updated_at, ratelimit_max, ratelimit_duration) values ('" + process.env.VALID_KEY + "',1000, now(), now(), 0, 0)";
        const values = [];
        postgresClient.query(sql)
            .then(result => {
                console.log("inserted row into key.limit for key " + process.env.VALID_KEY);
                resolve();
            })
            .catch(error => {
                console.error("problem inserting into table key.limit in postgres: " + error);
                reject(error);
            })
    });
}

function createTableKeyAuthorization(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS key.authorization (key character varying NOT NULL,authorized bool default true,message character varying," +
            "ratelimit_max bigint,ratelimit_duration bigint,created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
        postgresClient.query(sql)
            .then(result => {
                console.log("created table key.authorization in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating table key.authorization in postgres: " + error);
                reject(error);
            })
    });
}

function insertTableKeyAuthorization(){
    return new Promise((resolve, reject) => {
        const sql = "insert into key.authorization (key,authorized,created_at,updated_at, ratelimit_max, ratelimit_duration, message) values ('" + process.env.VALID_KEY +
            "',true, now(), now(), 0, 0, 'test API key created')";
        postgresClient.query(sql)
            .then(result => {
                console.log("inserted row into key.authorization for key " + process.env.VALID_KEY);
                resolve();
            })
            .catch(error => {
                console.error("problem inserting into table key.authorization in postgres: " + error);
                reject(error);
            })
    });
}

function createTableKeyAccount(){
    return new Promise((resolve, reject) => {
        const sql = "CREATE TABLE IF NOT EXISTS key.account (key character varying NOT NULL,subscription_id character varying NOT NULL," +
            "plan_id character varying NOT NULL,email character varying NOT NULL,fname character varying,lname character varying,company character varying," +
            "active bool NOT NULL,created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
        postgresClient.query(sql)
            .then(result => {
                console.log("created table key.account in postgres");
                resolve();
            })
            .catch(error => {
                console.error("problem creating table key.account in postgres: " + error);
                reject(error);
            })
    });
}

function insertTableKeyAccount(){
    return new Promise((resolve, reject) => {
        const sql = "insert into key.account (key, subscription_id, plan_id, email, active, created_at,updated_at) values ('" + process.env.VALID_KEY +
            "', 'test', 'test', 'test@foo.com', true, now(), now())";
        postgresClient.query(sql)
            .then(result => {
                console.log("inserted row into key.account for key " + process.env.VALID_KEY);
                resolve();
            })
            .catch(error => {
                console.error("problem inserting into table key.account in postgres: " + error);
                reject(error);
            })
    });
}








exports.cleanup = function(callback) {
    async.waterfall(
        [
            function dropSchemaKey(callback) {
                const sql = "drop schema key cascade";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem dropping schema key in  postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("dropped schema key in  postgres ");
                        callback(null);
                    }
                });
            },
            function dropSchemaLog(callback) {
                const sql = "drop schema log cascade";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem dropping schema log in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("dropped schema log in elephantsql postgres ");
                        callback(null);
                    }
                });
            }
        ],
        function (err) {
            if (err) {
                console.error("setup.cleanup - error: " + err);
                callback(err);
            } else {
                console.log("setup.cleanup - success ");
                callback(null);
            }
        });
};

