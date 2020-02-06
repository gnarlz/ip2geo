'use strict';

const redis_client = require('../../redis/redis-client');
const postgres_client = require('../../postgres/postgres-client');
const async = require('async');
const IP = require('../../lib/ip');




exports.run = function(callback) {

    const valid_key = process.env.VALID_KEY;
    const suspended_key = process.env.SUSPENDED_KEY;

    // waterfall because speed isnt crucial and its easier/quicker to write
    // could def be made faster by mixing parallel and waterfall together
    async.waterfall(
        [
            function createValidKeyAuthorizationRedis(callback) {
                redis_client.set("authorized:" + valid_key,
                    '{"authorized":true,"message":"testing key","ts":"2020-01-21 12:17:51.335000"}', function (err, reply) {
                        if (err) {
                            console.error("problem creating valid authorization in redis for key: " + valid_key);
                            callback(err);
                        }
                        else{
                            console.log("created valid authorization in redis for key: " + valid_key);
                            callback(null);
                        }
                    });
            },

            function createSuspendedKeyAuthorizationRedis(callback) {
                redis_client.set("authorized:" + suspended_key,
                    '{"authorized":false,' +
                    '"message":"Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue.",' +
                    '"ts":"2020-01-21 12:17:51.335000"}',
                    function (err) {
                        if (err) {
                            console.error("problem creating suspended authorization in redis for key: " + suspended_key);
                            callback(err);
                        }
                        else{
                            console.log("created suspended authorization in redis for key: " + suspended_key);
                            callback(null);
                        }
                    });
            },





            function createIP2GEORedisGoogle(callback) {
                let json = '{"network":"8.8.0.0/19","network_start_ip":"8.8.0.0","network_last_ip":"8.8.31.255","network_start_integer":"134742016",' +
                    '"network_last_integer":"134750207","geoname_id":"6252001","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"",' +
                    '"latitude":"37.7510","longitude":"-97.8220","accuracy_radius":"1000","continent_code":"NA","continent_name":"North America",' +
                    '"country_iso_code":"US","country_name":"United States","subdivision_1_iso_code":"","subdivision_1_name":"","city_name":"",' +
                    '"time_zone":"America/Chicago","time_zone_abbr":"CDT","time_zone_offset":"-21600","time_zone_is_dst":"0"}';
                let args = [ process.env.IP2GEO_KEYSPACE, 134750207,  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2geo google entry in redis for ip 8.8.8.8");
                        callback(err);
                    }
                    else{
                        console.log("created ip2geo google entry in redis for ip 8.8.8.8");
                        callback(null);
                    }
                });
            },
            function verifyIP2GEORedisGoogle(callback) {
                let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('8.8.8.8'), '+inf', 'withscores', 'LIMIT', 0, 1];

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2geo google entry in redis for ip 8.8.8.8");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2geo google entry in redis for ip 8.8.8.8: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2geo google entry in redis for ip 8.8.8.8");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },
            function createIP2ASNRedisGoogle(callback) {
                let json = '{"range_start":"8.8.8.0","range_end":"8.8.8.255","AS_number":"15169","country_code":"US","AS_description":"GOOGLE - Google LLC"}';
                let args = [ process.env.IP2ASN_KEYSPACE, 134750207,  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2asn google entry in redis for ip 8.8.8.8");
                        callback(err);
                    }
                    else{
                        console.log("created ip2asn google entry in redis for ip 8.8.8.8");
                        callback(null);
                    }
                });
            },
            function verifyIP2ASNRedisGoogle(callback) {
                let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('8.8.8.8'), '+inf', 'withscores', 'LIMIT', 0, 1];

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2asn google entry in redis for ip 8.8.8.8");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2asn google entry in redis for ip 8.8.8.8: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2asn google entry in redis for ip 8.8.8.8");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },


            function createIP2GEORedisMadison(callback) {
                let json = '{"network":"137.27.69.72/30","network_start_ip":"137.27.69.72","network_last_ip":"137.27.69.75","network_start_integer":"2300265800",' +
                    '"network_last_integer":"2300265803","geoname_id":"5261457","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"53711",' +
                    '"latitude":"43.0334","longitude":"-89.4512","accuracy_radius":"20","continent_code":"NA","continent_name":"North America","country_iso_code":"US",' +
                    '"country_name":"United States","subdivision_1_iso_code":"WI","subdivision_1_name":"Wisconsin","city_name":"Madison","time_zone":"America/Chicago",' +
                    '"time_zone_abbr":"CDT","time_zone_offset":"-21600","time_zone_is_dst":"0"}';
                let args = [ process.env.IP2GEO_KEYSPACE, 2300265803,  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2geo madison entry in redis for ip 137.27.69.73");
                        callback(err);
                    }
                    else{
                        console.log("created ip2geo madison entry in redis for ip 137.27.69.73");
                        callback(null);
                    }
                });
            },
            function verifyIP2GEORedisMadison(callback) {
                let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('137.27.69.73'), '+inf', 'withscores', 'LIMIT', 0, 1];

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2geo madison entry in redis for ip 137.27.69.73");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2geo madison entry in redis for ip 137.27.69.73: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2geo madison entry in redis for ip 137.27.69.73");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },
            function createIP2ASNRedisMadison(callback) {
                let json = '{"range_start":"137.26.128.0","range_end":"137.27.251.255","AS_number":"20115","country_code":"US","AS_description":"CHARTER-NET-HKY-NC - Charter Communications"}';
                let args = [ process.env.IP2ASN_KEYSPACE, 2300265803,  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2asn madison entry in redis for ip 137.27.69.73");
                        callback(err);
                    }
                    else{
                        console.log("created ip2asn madison entry in redis for ip 137.27.69.73");
                        callback(null);
                    }
                });
            },
            function verifyIP2ASNRedisMadison(callback) {
                let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('137.27.69.73'), '+inf', 'withscores', 'LIMIT', 0, 1];

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2asn madison entry in redis for ip 137.27.69.73");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2asn madison entry in redis for ip 137.27.69.73: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2asn madison entry in redis for ip 137.27.69.73");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },

            //TODO: revisit - redis-mock is not working correctly for zrangebyscore for BIG INTs
            /*
            function createIP2GEORedisYokohama(callback) {
                let json = '{"network":"2001:200:100::/40","network_start_ip":"2001:200:100::","network_last_ip":"2001:200:1ff:ffff:ffff:ffff:ffff:ffff",' +
                    '"network_start_integer":"42540528727104535073712549388527599616","network_last_integer":"42540528727414020083533894457252380671",' +
                    '"geoname_id":"1848354","is_anonymous_proxy":"f","is_satellite_provider":"f","postal_code":"223-0061","latitude":"35.5569","longitude":"139.6444",' +
                    '"accuracy_radius":"20","continent_code":"AS","continent_name":"Asia","country_iso_code":"JP","country_name":"Japan",' +
                    '"subdivision_1_iso_code":"14","subdivision_1_name":"Kanagawa","city_name":"Yokohama","time_zone":"Asia/Tokyo","time_zone_abbr":"JST",' +
                    '"time_zone_offset":"32400","time_zone_is_dst":"0"}';
                let args = [ process.env.IP2GEO_KEYSPACE, '42540528727414020083533894457252380671',  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2geo yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                        callback(err);
                    }
                    else{
                        console.log("created ip2geo yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                        callback(null);
                    }
                });
            },

            function verifyIP2GEORedisYokohama(callback) {
                let args = [process.env.IP2GEO_KEYSPACE, IP.numeric('2001:200:1c0:2000:0:0:0:0'), '+inf', 'withscores', 'LIMIT', 0, 1];
                // network last integer: 42540528727414020083533894457252380671
                // ip to find:  42540528727336799946806010018718023680   2001:200:1c0:2000:0:0:0:0   IP.numeric('2001:200:1c0:2000:0:0:0:0')

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2geo yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0 ");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2geo yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2geo yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },



            function createIP2ASNRedisYokohama(callback) {
                let json = '{"range_start":"2001:200::","range_end":"2001:200:5ff:ffff:ffff:ffff:ffff:ffff","AS_number":"2500","country_code":"JP","AS_description":"WIDE-BB WIDE Project"}';
                let args = [ process.env.IP2ASN_KEYSPACE, '42540528727414020083533894457252380671',  json];
                redis_client.zadd(args, function (err) {
                    if (err) {
                        console.error("problem creating ip2asn yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                        callback(err);
                    }
                    else{
                        console.log("created ip2asn yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                        callback(null);
                    }
                });
            },
            function verifyIP2ASNRedisYokohama(callback) {
                let args = [process.env.IP2ASN_KEYSPACE, IP.numeric('2001:200:1c0:2000:0:0:0:0'), '+inf', 'withscores', 'LIMIT', 0, 1];

                redis_client.zrangebyscore(args, function (err, response) {
                    if (err) {
                        console.error("problem selecting zrangebyscore ip2asn yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                        callback(err);
                    }
                    else {
                        console.log("selecting zrangebyscore ip2asn yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0: " + response[0]);
                        if(!response[0]){
                            let error = new Error();
                            error.message = ("failed to select ip2asn yokohama entry in redis for ip 2001:200:1c0:2000:0:0:0:0");
                            callback(error);
                        }
                        else{
                            callback(null);
                        }
                    }
                });
            },

             */

            function createSchemaLog(callback){
                const sql = "CREATE SCHEMA IF NOT EXISTS log";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating schema log in elephantsql  postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("created schema log in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function creatTableLogLookup(callback){
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
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating table log.lookup in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("   created table log.lookup in elephantsql postgres ");
                        callback(null);
                    }
                });

            },


            function createSchemaKey(callback){
                const sql = "CREATE SCHEMA IF NOT EXISTS key";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating schema key in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("created schema key in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function createTableKeyRequest(callback){
                const sql = "CREATE TABLE IF NOT EXISTS key.request (key character varying NOT NULL,total bigint NOT NULL," +
                    "created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating table key.request in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("   created table key.request in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function insertTableKeyRequest(callback){
                const sql = "insert into key.request (key,total,created_at,updated_at) values ('" + valid_key + "', 0, now(), now())";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem inserting into key.request in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("       inserted row into key.request for key " + valid_key);
                        callback(null);
                    }
                });
            },

            function createTableKeyLimit(callback){
                const sql = "CREATE TABLE IF NOT EXISTS key.limit (key character varying NOT NULL,limit_ bigint NOT NULL,ratelimit_max bigint,ratelimit_duration bigint," +
                    "created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating table key.limit in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("   created table key.limit in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function insertTableKeyLimit(callback){
                const sql = "insert into key.limit (key,limit_,created_at,updated_at, ratelimit_max, ratelimit_duration) values ('" + valid_key + "',1000, now(), now(), 0, 0)";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem inserting into key.limit in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("       inserted row into key.limit for key " + valid_key);
                        callback(null);
                    }
                });
            },

            function createTableKeyAuthorization(callback){
                const sql = "CREATE TABLE IF NOT EXISTS key.authorization (key character varying NOT NULL,authorized bool default true,message character varying," +
                    "ratelimit_max bigint,ratelimit_duration bigint,created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating table key.authorization in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("   created table key.authorization in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function insertTableKeyAuthorization(callback){
                const sql = "insert into key.authorization (key,authorized,created_at,updated_at, ratelimit_max, ratelimit_duration, message) values ('" + valid_key +
                    "',true, now(), now(), 0, 0, 'test API key created')";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem inserting into key.authorization in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("       inserted row into key.authorization for key " + valid_key);
                        callback(null);
                    }
                });
            },

            function createTableKeyAccount(callback){
                const sql = "CREATE TABLE IF NOT EXISTS key.account (key character varying NOT NULL,subscription_id character varying NOT NULL," +
                    "plan_id character varying NOT NULL,email character varying NOT NULL,fname character varying,lname character varying,company character varying," +
                    "active bool NOT NULL,created_at timestamp default now() NOT NULL,updated_at timestamp default now() NOT NULL)";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem creating table key.account in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("   created table key.account in elephantsql postgres ");
                        callback(null);
                    }
                });
            },

            function insertTableKeyAccount(callback){
                const sql = "insert into key.account (key, subscription_id, plan_id, email, active, created_at,updated_at) values ('" + valid_key +
                    "', 'test', 'test', 'test@foo.com', true, now(), now())";
                const values = [];
                postgres_client.query(sql, values, (err, res) => {
                    if (err) {
                        console.error("problem inserting into key.account in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("       inserted row into key.account for key " + valid_key);
                        callback(null);
                    }
                });
            }

        ],
        function (err) {
            if (err) {
                console.error("setup.run - error: " + err);
                callback(err);
            } else {
                console.log("setup.run - success ");
                callback(null);
            }
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
                        console.error("problem dropping schema key in elephantsql postgres: " + err);
                        callback(err);
                    }
                    else{
                        console.log("dropped schema key in elephantsql postgres ");
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