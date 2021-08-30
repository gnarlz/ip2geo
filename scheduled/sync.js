'use strict';

const postgres_client = require('../postgres/postgres-client');
const redis_client = require('../redis/redis-client');
const moment = require('moment');

/*
sync.run:
    gets the current state of postgres key.authorization and pushes it into redis
        (redis is used as an authorization lookup for each api request)
 */

module.exports.run = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    console.log("sync.run - start:");

    // get current state of key.authorization
    const sql = "select * from key.authorization where key.authorization.updated_at = " +
        "(SELECT MAX(d.updated_at) FROM key.authorization d WHERE key.authorization.key = d.key) ";

    postgres_client.query(sql, (error, result) => {
        if (error) {
            console.error("sync.run - error selecting current state of key.authorization from postgres: " + error);
            callback(error);
        }
        else {
            const rows = result.rows;

            if(rows.length < 1){
                console.log("sync.run - no rows in key.authorization");
                callback(null);
            }

            for (let i = 0; i < rows.length; i++) {
                let payload = {};
                payload.authorized = rows[i].authorized;
                payload.message = rows[i].message;
                payload.ts = moment(rows[i].updated_at).format('YYYY-MM-DD HH:mm:ss.SSSSSS');
                if(rows[i].ratelimit_max){
                    payload.ratelimit_max = Number(rows[i].ratelimit_max);
                }
                if(rows[i].ratelimit_duration){
                    payload.ratelimit_duration = Number(rows[i].ratelimit_duration);
                }

                console.log("sync.run -      key: " + rows[i].key + "    authorized: " + rows[i].authorized + "     message: " + rows[i].message +
                    "     updated_at: " + moment(rows[i].updated_at).format('YYYY-MM-DD HH:mm:ss.SSSSSS') +
                    "      ratelimit_max: " + rows[i].ratelimit_max + "     ratelimit_duration: " + rows[i].ratelimit_duration);


                let akey = "authorized:" +  rows[i].key;
                redis_client.set(akey, JSON.stringify(payload), function (err, reply) {
                    if (err) {
                        console.error("sync.run - problem upserting row into redis:     key: " + akey + "    authorized: " + payload.authorized +
                            "     message:" + payload.message + "     updated_at: " + payload.ts +
                            "      ratelimit_max: " + payload.ratelimit_max + "     ratelimit_duration: " + payload.ratelimit_duration + "      error:" + err);
                        return callback(err);
                    }
                    else {
                        console.log("sync.run - upserted row into redis:     key: " + akey + "    authorized: " + payload.authorized +
                            "     message:" + payload.message + "     updated_at: " + payload.ts +  "      ratelimit_max: " + payload.ratelimit_max + "     ratelimit_duration: " + payload.ratelimit_duration);
                        return callback(null);
                    }
                });
            }
        }
    });
};

