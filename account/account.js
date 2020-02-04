'use strict';

const async = require('async');
const redis_client = require('../redis/redis-client');
const postgres_client = require('../postgres/postgres-client');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
let AWS = require('aws-sdk');
const plans = require('./plans');
const emailer = require('../email/emailer');


/*

account.create:
CURRENT:    invoked by stripe overlay POSTing to subscribe/subscribe.js
DEPRECATED: invoked by a webhook POST request from recurly to webhooks/recurly.js

    creates new key (uuid)
    inserts row into postgres key.account
    inserts row into postgres key.request
    inserts row into postgres key.limit
    inserts row into postgres key.authorization
    inserts "row" authorized:key into redis
    uses sendgrid to email new subscriber with API key and documentation links
    sends sms text to admin with success/failure details of the new subscription
*/

module.exports.create = (event, context, callback) => {

    console.log("account.create - start:");
    console.log("event: " + JSON.stringify(event));

    context.callbackWaitsForEmptyEventLoop = false;
    AWS.config.region = process.env.IP2GEO_AWS_REGION;

    const response = {};
    response.headers = {"Access-Control-Allow-Origin": "*"}; // enable CORS in api gateway when using lambda proxy integration

    const account_data = {};

    async.waterfall(
        [
            function validate(callback){
                console.log('event.subscription_id: ' + event.subscription_id);
                if(((typeof event.subscription_id === 'undefined')) || (event.subscription_id === '')){
                    let error = new Error();
                    error.message = "null or empty subscription_id";
                    error.code = 400;
                    callback(error);
                }else if(((typeof event.stripeEmail === 'undefined')) || (event.stripeEmail === '')){
                    let error = new Error();
                    error.message = "null or empty stripeEmail";
                    error.code = 400;
                    callback(error);
                } else if(((typeof event.planID === 'undefined')) || (event.planID === '')){
                    let error = new Error();
                    error.message = "null or empty planID";
                    error.code = 400;
                    callback(error);
                }
                else if(((typeof event.plan_name === 'undefined')) || (event.plan_name === '')){
                    let error = new Error();
                    error.message = "null or empty plan_name";
                    error.code = 400;
                    callback(error);
                }
                else{
                    callback (null);
                }
            },

            function populateAccountData(callback){
                account_data.action = "account.create";
                account_data.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
                account_data.key = uuidv4();
                account_data.subscription_id = event.subscription_id;
                account_data.email = event.stripeEmail;
                account_data.plan_id = event.planID;
                account_data.plan_name = event.plan_name;

                account_data.plan_created_at = plans[event.plan_name].created_at;
                account_data.display_name = plans[event.plan_name].display_name;
                account_data.limit = plans[event.plan_name].limit;
                account_data.ratelimit_max = plans[event.plan_name].ratelimit_max;
                account_data.ratelimit_duration = plans[event.plan_name].ratelimit_duration;
                account_data.price = plans[event.plan_name].price;
                console.log("creating account: " + JSON.stringify(account_data));
                callback(null);
            },

            function insertPostgresKeyAccount(callback) {
                postgres_client.query("insert into key.account (key, subscription_id, plan_id, email, active, created_at,updated_at) values ('" +
                    account_data.key + "', '" +
                    account_data.subscription_id + "', '" +
                    account_data.plan_name + "', '" +
                    account_data.email + "', " +
                    "true, now(), now())", (error, result) => {
                    if (error) {
                        console.error("account.create - error inserting into key.account: " + error);
                        callback(error);
                    }
                    else {
                        console.log("account.create - inserted row into key.account:     key: " + account_data.key);
                        callback(null);
                    }
                });
            },
            function insertPostgresKeyRequest(callback) {
                postgres_client.query("insert into key.request (key,total,created_at,updated_at) values ('" +
                    account_data.key + "', 0, now(), now())", (error, result) => {
                    if (error) {
                        console.error("account.create - error inserting into key.request: " + error);
                        callback(error);
                    }
                    else {
                        console.log("account.create - inserted row into key.request:     key: " + account_data.key);
                        callback(null);
                    }
                });
            },
            function insertPostgresKeyLimit(callback) {
                postgres_client.query("insert into key.limit (key,limit_,created_at,updated_at, ratelimit_max, ratelimit_duration) values ('" +
                    account_data.key + "', " +
                    account_data.limit + ", now(), now()," +
                    (account_data.ratelimit_max? account_data.ratelimit_max : null) + ", " +
                    (account_data.ratelimit_duration? account_data.ratelimit_duration : null) + ")",  (error, result) => {
                    if (error) {
                        console.error("account.create - error inserting into key.limit: " + error);
                        callback(error);
                    }
                    else {
                        console.log("account.create - inserted row into key.limit:     key: " + account_data.key);
                        callback(null);
                    }
                });
            },
            function insertPostgresKeyAuthorization(callback) {
                postgres_client.query("insert into key.authorization (key,authorized,created_at,updated_at, ratelimit_max, ratelimit_duration, message) values ('" +
                    account_data.key + "', true,  now(), now()," +
                    (account_data.ratelimit_max? account_data.ratelimit_max : null) + ", " +
                    (account_data.ratelimit_duration? account_data.ratelimit_duration : null) + ", '" + "Account creation" + "')",  (error, result) => {
                    if (error) {
                        console.error("account.create - error inserting into key.authorization: " + error);
                        callback(error);
                    }
                    else {
                        console.log("account.create - inserted row into key.authorization:     key: " + account_data.key);
                        callback(null);
                    }
                });
            },
            function insertRedisAuthorization(callback) {
                const redis_row = {};
                redis_row.authorized = true;
                redis_row.message = 'Account created.';
                redis_row.ts = account_data.ts;
                if(account_data.ratelimit_max){
                    redis_row.ratelimit_max = account_data.ratelimit_max;
                }
                if(account_data.ratelimit_duration){
                    redis_row.ratelimit_duration = account_data.ratelimit_duration;
                }
                redis_row.status = "success";

                let akey = "authorized:" + account_data.key;
                redis_client.set(akey, JSON.stringify(redis_row), function (err, reply) {
                    if (err) {
                        console.error("account.create - error attempting to set authorization in redis:      key: " + akey + "        error: " + err);
                        return callback(err);
                    }
                    else{
                        console.log("account.create - set authorized in redis:     key: " + akey);
                        callback(null);
                    }
                });
            },

            function sendNewSubscriberEmail(callback) {
                emailer.sendNewSubscriberEmail(account_data, callback);
            }
        ],
        function (err, results) {
            if (err) {
                console.error("account.create - error creating account: " + JSON.stringify(account_data) + "   error: " + err);
                account_data.status = 'ERROR';
                account_data.message = err.toString();

                response.statusCode = 500;
                response.body = JSON.stringify(  {error: err.toString()} );
            } else {
                console.log("account.create - successfully created account: " + JSON.stringify(account_data));
                account_data.status = 'SUCCESS';
                account_data.message = 'account created';

                response.statusCode = 200;
                response.body = JSON.stringify(  {key: account_data.key} );
            }


            // send text and email to admin via sns topic with success/failure and details of new subscription details
            let sns = new AWS.SNS();
            let params = {
                Message: JSON.stringify(account_data),
                TopicArn: process.env.CREATE_ACCOUNT_SNS_TOPIC,
            };
            sns.publish(params, function(sns_err, data) {
                if(sns_err){
                    console.error("problem publishing to sns topic in account.create: " + sns_err.toString());
                    // intentionally throw this error on the floor - its annoying but not life threatening
                }

                if(err){
                    callback(err, response);
                }
                else{
                    callback(null, response);
                }
            });

            /*
            if( process.env.MODE === 'test'){
                if(err){
                    callback(err, response);
                }
                else{
                    callback(null, response);
                }
            } else{
                // send text and email to admin via sns topic with success/failure and details of new subscription details
                let sns = new AWS.SNS();
                let params = {
                    Message: JSON.stringify(account_data),
                    TopicArn: process.env.CREATE_ACCOUNT_SNS_TOPIC,
                };
                sns.publish(params, function(sns_err, data) {
                    if(sns_err){
                        console.error("problem publishing to sns topic in account.create: " + sns_err.toString());
                        // intentionally throw this error on the floor - its annoying but not life threatening
                    }

                    if(err){
                        callback(err, response);
                    }
                    else{
                        callback(null, response);
                    }
                });


            }
             */






        }
    );

};


















/*
account.display:
    returns a snapshot of the current status for the account associated with the supplied key
 */

module.exports.display = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    console.log("account.display - start:");

    const start = new Date();
    let time_elapsed;
    let {key} = event.queryStringParameters || {};
    const request_id = context.awsRequestId;
    let source_ip =  event['requestContext']['identity']['sourceIp'];
    let request_ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');

    const payload = {};
    const request = {};
    const account = {};

    let monthly_request_limit;
    let monthly_limit_last_updated_date;
    let current_month_request_count;
    let ratelimit_max;
    let ratelimit_duration;
    let authorized;
    let authorized_last_message;
    let authorized_last_updated_date;

    const response = {};
    response.headers = {"Access-Control-Allow-Origin": "*"};    // enable CORS in api gateway when using lambda proxy integration

    async.waterfall(
        [
            function getAccountStatus(callback) {
                postgres_client.query("SELECT " +
                    "key.limit.key, " +
                    "key.limit.ratelimit_max, " +
                    "key.limit.ratelimit_duration, " +
                    "key.limit.limit_, " +
                    "key.limit.updated_at as limit_updated_date, " +
                    "key.request.total as request_total, " +
                    "key.authorization.authorized, " +
                    "key.authorization.message, " +
                    "key.authorization.updated_at as authorization_updated_date  " +
                    "FROM " +
                    "key.limit, key.request, key.authorization " +
                    "WHERE " +
                    "key.limit.updated_at = (SELECT MAX(c.updated_at) FROM key.limit c WHERE key.limit.key = c.key)  and " +
                    "key.authorization.updated_at = (SELECT MAX(d.updated_at) FROM key.authorization d WHERE key.authorization.key = d.key) " +
                    "and key.limit.key=key.request.key " +
                    "and key.authorization.key=key.request.key " +
                    "and request.key = '" + key + "'", (error, result) => {

                    if (error) {
                        console.error("account.display - error getting account status       key: " + key + "   error: " + error);
                        let postgres_error = new Error();
                        postgres_error.message = error.message;
                        postgres_error.code = 500;
                        return callback(postgres_error);
                    }
                    else {
                        const rows = result.rows;
                        if(rows.length < 1){
                            console.log("account.display - no rows returned for key: " + key);
                            let no_rows_error = new Error();
                            no_rows_error.message = "No data returned for key: " + key;
                            no_rows_error.code = 400;
                            return callback(no_rows_error);
                        }
                        else if(rows.length > 1){
                            console.log("account.display - multiple rows returned for key: " + key);
                            let multiple_rows_error = new Error();
                            multiple_rows_error.message = "Inconsistent data returned for key: " + key;
                            multiple_rows_error.code = 400;
                            return callback(multiple_rows_error);
                        }
                        else{
                            monthly_request_limit = rows[0].limit_;
                            ratelimit_max = rows[0].ratelimit_max;
                            ratelimit_duration = rows[0].ratelimit_duration;
                            monthly_limit_last_updated_date = rows[0].limit_updated_date;
                            current_month_request_count = rows[0].request_total;
                            authorized = rows[0].authorized;
                            authorized_last_message = rows[0].message;
                            authorized_last_updated_date = rows[0].authorization_updated_date;
                            callback(null);
                        }
                    }
                });
            }
        ],
        function (err, results) {
            request.request_id = request_id;
            request.request_ts = request_ts;
            request.source_ip = source_ip;
            request.is_desktop = (event['headers']['CloudFront-Is-Desktop-Viewer'] === "true");
            request.is_mobile = (event['headers']['CloudFront-Is-Mobile-Viewer'] === "true");
            request.is_smart_tv = (event['headers']['CloudFront-Is-SmartTV-Viewer'] === "true");
            request.is_tablet = (event['headers']['CloudFront-Is-Tablet-Viewer'] === "true");
            request.viewer_country = event['headers']['CloudFront-Viewer-Country'];
            request.accept_language = event['headers']['Accept-Language'];
            request.origin = event['headers']['origin'];
            request.referer = event['headers']['Referer'];
            request.user_agent = event['headers']['User-Agent'];

            payload.time_elapsed = new Date() - start;
            payload.request = request;

            if (err) {
                console.error("account.display - error returned from async.waterfall: " + err);
                payload.status = "error";
                payload.status_code = err.code;
                payload.error = {message: err.message};

                response.statusCode = err.code;
                response.body = JSON.stringify(payload);
            }
            else {
                payload.status = "success";
                payload.status_code = 200;

                account.monthly_request_limit = monthly_request_limit;
                account.ratelimit_max = ratelimit_max;
                account.ratelimit_duration = ratelimit_duration;
                account.monthly_limit_last_updated_date = monthly_limit_last_updated_date;
                account.current_month_request_count = current_month_request_count;
                account.authorized = authorized;
                account.authorized_last_message = authorized_last_message;
                account.authorized_last_updated_date = authorized_last_updated_date;

                payload.account = account;

                response.statusCode = 200;
                response.body = JSON.stringify(payload);
            }

            // ====================================   CLOUDWATCH LOGGING   ===============================================
            console.log(JSON.stringify(payload));
            callback(null, response);
        }
    );
};

