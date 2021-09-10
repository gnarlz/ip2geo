'use strict';

const postgresClient = require('../postgres/postgres-client');

exports.increment = function (key, requestId){
    return new Promise((resolve, reject) => {
        const sql = "update key.request set total = total+1 , updated_at = " +
            "now() where key='" + key + "' RETURNING total";
        postgresClient.query(sql)
            .then(result => {
                resolve();
            })
            .catch(error => {
                console.error("requestCounter.increment - problem incrementing key.request:      key: " + key +
                    "        error: " + error);
                resolve(); // intentionally drop error on floor - this error is unfortunate, but not fatal
            })
    });
}