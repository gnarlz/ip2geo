'use strict';

const async = require('async');
const redis_client = require('../redis/redis-client');
const postgres_client = require('../postgres/postgres-client');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const sgMail = require('@sendgrid/mail');
let AWS = require('aws-sdk');
const plans = require('./plans');


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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const response = {};
    response.headers = {"Access-Control-Allow-Origin": "*"}; // enable CORS in api gateway when using lambda proxy integration

    const account_data = {};
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


    async.waterfall(
        [
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
                // TODO: all this string building should be externalized
                let name_details = "You have subscribed to the " + account_data.display_name + " plan.";
                let limit_details = " This key is allowed " + Number(account_data.limit).toLocaleString() + " requests a month." ;

                let ratelimit_details;
                if ((account_data.ratelimit_max) && (Number(account_data.ratelimit_max) > 0)){
                    ratelimit_details = " The Free plan is rate limited to " + account_data.ratelimit_max + " requests per minute.";
                }
                else
                {
                    ratelimit_details = "";
                }
                let plan_details = name_details.concat(limit_details, ratelimit_details);

                const msg = {
                    to: account_data.email,
                    cc: 'support@ip2geo.co',
                    bcc: ['tom@telematic.io'],
                    from: 'support@ip2geo.co',
                    replyTo: 'support@ip2geo.co',
                    templateId: 'd-f79b447d5a2e4dd083d70aaa2294fcf1',
                    dynamicTemplateData: {
                        "fname": "",
                        "key": account_data.key,
                        "plan_details": plan_details
                    }
                };

                sgMail.send(msg).then(() => {
                        console.log('SENDGRID: Mail sent successfully');
                        callback(null);
                    }).catch(error => {
                        console.error('SENDGRID ERROR: ' + error.toString());
                        return callback(error);
                    });
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
    console.log("account.display - key: " + key);

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
    // enable CORS in api gateway when using lambda proxy integration
    response.headers = {"Access-Control-Allow-Origin": "*"};

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

            request.is_desktop = (event['headers']['CloudFront-Is-Desktop-Viewer'] == "true")? true:false;
            request.is_mobile = (event['headers']['CloudFront-Is-Mobile-Viewer'] == "true")? true:false;
            request.is_smart_tv = (event['headers']['CloudFront-Is-SmartTV-Viewer'] == "true")? true:false;
            request.is_tablet = (event['headers']['CloudFront-Is-Tablet-Viewer'] == "true")? true:false;


            request.viewer_country = event['headers']['CloudFront-Viewer-Country'];
            request.accept_language = event['headers']['Accept-Language'];
            request.origin = event['headers']['origin'];
            request.referer = event['headers']['Referer'];
            request.user_agent = event['headers']['User-Agent'];

            if (err) {
                console.error("account.display - error returned from async.waterfall: " + err);

                payload.status = "error";
                payload.status_code = err.code;
                time_elapsed = new Date() - start;
                payload.time_elapsed = time_elapsed;
                payload.request = request;

                payload.error = {message: err.message};
                response.statusCode = err.code;
                response.body = JSON.stringify(payload);
            }
            else {

                payload.status = "success";
                payload.status_code = 200;
                time_elapsed = new Date() - start;
                payload.time_elapsed = time_elapsed;
                payload.request = request;

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



            /*

            SAMPLE RESPONSE

            {
                "status": "success",
                "status_code": 200,
                "time_elapsed": 41,
                "request": {
                    "request_id": "34a16a7e-c048-4d2e-b226-fb4714d98fb3",
                    "request_ts": "2020-01-11 17:37:08.012000",
                    "source_ip": "137.27.69.78",
                    "is_desktop": true,
                    "is_mobile": false,
                    "is_smart_tv": false,
                    "is_tablet": false,
                    "viewer_country": "US",
                    "accept_language": "en-US,en;q=0.9",
                    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
                },
                "account": {
                    "monthly_request_limit": "10000000",
                    "ratelimit_max": null,
                    "ratelimit_duration": null,
                    "monthly_limit_last_updated_date": "2020-01-08T12:35:48.109Z",
                    "current_month_request_count": "2",
                    "authorized": true,
                    "authorized_last_message": "Account creation",
                    "authorized_last_updated_date": "2020-01-08T12:35:48.111Z"
                }
            }

            */

            callback(null, response);

        }
    );
};

