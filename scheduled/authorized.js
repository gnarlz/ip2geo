'use strict';

const postgres_client = require('../postgres/postgres-client');
const moment = require('moment');

/*
authorized.run:
    this is a scheduled task, with frequency defined in serverless.yml
    it looks in postgres for keys that have exceeded their monthly request limit
    when it finds a key that is over limit, it inserts a new row into postgres key.authorization indicating authorization is false

    a more elegant solution would be to determine in real time when a key has exceeded its limit  (i.e. each time a request is made), and de-authorize it then.
    seems excessive at this point, may revisit later
*/

module.exports.run = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    console.log("authorized.run - start:");

    // find all keys that are over their monthly limit AND whose latest row in key.authorization is TRUE
    // (we dont want to clobber it is it is already FALSE)
    const sql = "SELECT " +
        "key.limit.key, " +
        "key.limit.limit_, " +
        "key.limit.ratelimit_max, " +
        "key.limit.ratelimit_duration, " +
        "key.limit.updated_at as limit_updated_date, " +
        "key.request.total as request_total, " +
        "key.authorization.authorized, " +
        "key.authorization.updated_at as authorization_updated_date " +
        "FROM " +
        "key.limit, key.request, key.authorization " +
        "WHERE " +
        "key.limit.updated_at = (SELECT MAX(c.updated_at) FROM key.limit c WHERE key.limit.key = c.key)  and " +
        "key.authorization.updated_at = (SELECT MAX(d.updated_at) FROM key.authorization d WHERE key.authorization.key = d.key) " +
        "and key.limit.key=key.request.key " +
        "and key.authorization.key=key.request.key " +
        "and key.request.total > key.limit.limit_ " +
        "and key.authorization.authorized is true;";

    const message = "Your API key has been suspended because you have exceeded your plans monthly request limit. " +
        "Please contact support@ip2geo.co to resolve this issue.";

    postgres_client.query(sql, (error, result) => {
        if (error) {
            console.error("authorized.run - error selecting keys, requests and totals from postgres: " + error);
            callback(error);
        }
        else {
            const rows = result.rows;
            let key;
            let requests;
            let limit;
            let ratelimit_max;
            let ratelimit_duration;

            if(rows.length < 1){
                console.log("authorized.run - no keys to update:");
                callback(null);
            }

            for (let i = 0; i < rows.length; i++) {
                key = rows[i].key;
                requests = rows[i].request_total;
                limit = rows[i].limit_;
                ratelimit_max = rows[i].ratelimit_max;
                ratelimit_duration = rows[i].ratelimit_duration;
                console.log("authorized.run -      key: " + key + "    requests: " + requests + "     limit:" + limit);

                //let 'em go 20% over limit
                if(Number(requests) > (1.2*(Number(limit)))){
                    postgres_client.query("INSERT INTO key.authorization (key, authorized, message, created_at, updated_at, ratelimit_max, ratelimit_duration) values ('" +
                        key + "', false, '" + message + "', now(), now(), " + ratelimit_max + " , " + ratelimit_duration + ")",  (error, result) => {
                        if (error) {
                            console.error("authorized.run - error inserting row into key.authorization:      key: " + key + "        error: " + error) ;
                        }
                        else {
                            console.log("authorized.run - inserted row into key.authorization:     key: " +
                                key + "    authorized: false    message: " + message + "   updated_at: "  +
                                moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS') +
                                "     ratelimit_max: " + ratelimit_max + "      ratelimit_duration: " + ratelimit_duration);
                        }
                    });
                }
            }
            callback(null);
        }
    });
};

