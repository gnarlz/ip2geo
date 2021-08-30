'use strict'

const redisClient = require('../redis/redis-client')
const postgresClient = require('../postgres/postgres-client')
const moment = require('moment')
const uuidv4 = require('uuid/v4')
let AWS = require('aws-sdk')
const plans = require('./plans')
const emailer = require('../email/emailer')
const validate = require('../lib/validate')
const util = require('util')

/*
account.create:
    invoked by a stripe overlay POSTing to subscribe/subscribe.js

    validates data
    creates new key (uuid)
    inserts row into postgres key.account
    inserts row into postgres key.request
    inserts row into postgres key.limit
    inserts row into postgres key.authorization
    inserts "row" authorized:key into redis
    uses postmark to email new subscriber with API key and documentation links
    publish to sns topic (text and email to admin with success/failure details of the new account creation)
*/

module.exports.create = (event, context) => {
    return new Promise((resolve, reject) => {
        console.log("account.create - event: " + JSON.stringify(event))

        const accountData = {}
        let subscribed = false
        let accountCreationError

        validate.accountEvent(event)
            .then(() => {
                populateAccountData(accountData, event)
                return  Promise.all([
                    insertPostgresKeyAccount(accountData),
                    insertPostgresKeyRequest(accountData),
                    insertPostgresKeyLimit(accountData),
                    insertPostgresKeyAuthorization(accountData),
                    insertRedisAuthorization(accountData)
                ])
            })
            .then(() => {
                return emailer.sendNewSubscriberEmail(accountData)
            })
            .then(() => {
                // success
                console.log("account.create - successfully created account: " + JSON.stringify(accountData))
                subscribed = true
                accountData.status = 'SUCCESS'
                accountData.message = 'account created'
                return sendAccountCreationTextAndEmail(accountData)
            })
            .catch((error) => {
                // error
                console.error("account.create - error creating account: " + JSON.stringify(accountData) + "   error: " + error)
                subscribed = false
                accountCreationError = error
                accountData.status = 'ERROR'
                accountData.message = error.toString()
                return sendAccountCreationTextAndEmail(accountData)
            })
            .catch((error) => {
                // ignore
                console.error("account.create - problem publishing to sns topic for  account: " + JSON.stringify(accountData) + "   error: " + error)
            })
            .then(() => {
                if(subscribed){
                    resolve(null)
                } else{
                    reject(accountCreationError)
                }

            })
    })
}


function populateAccountData(accountData, event){
    accountData.action = "account.create"
    accountData.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
    accountData.key = uuidv4()
    accountData.subscription_id = event.subscription_id
    accountData.email = event.stripeEmail
    accountData.plan_id = event.planID
    accountData.plan_name = event.plan_name

    accountData.plan_created_at = plans[event.plan_name].created_at
    accountData.display_name = plans[event.plan_name].display_name
    accountData.limit = plans[event.plan_name].limit
    accountData.ratelimit_max = plans[event.plan_name].ratelimit_max
    accountData.ratelimit_duration = plans[event.plan_name].ratelimit_duration
    accountData.price = plans[event.plan_name].price
    console.log("creating account: " + JSON.stringify(accountData))
}




function insertPostgresKeyAccount(accountData){
    return new Promise((resolve, reject) => {
        postgresClient.query("insert into key.account (key, subscription_id, plan_id, email, active, created_at," +
            " updated_at) values ('" +
            accountData.key + "', '" +
            accountData.subscription_id + "', '" +
            accountData.plan_name + "', '" +
            accountData.email + "', " +
            "true, now(), now())")
            .then(result => {
                console.log("account.create - inserted row into key.account:     key: " + accountData.key)
                resolve()
            })
            .catch(error => {
                console.error("account.create - error inserting into key.account: " + error)
                reject(error)
            })
    })
}
function insertPostgresKeyRequest(accountData){
    return new Promise((resolve, reject) => {
        postgresClient.query("insert into key.request (key,total,created_at,updated_at) values ('" +
            accountData.key + "', 0, now(), now())")
            .then(result => {
                console.log("account.create - inserted row into key.request:     key: " + accountData.key)
                resolve()
            })
            .catch(error => {
                console.error("account.create - error inserting into key.request: " + error)
                reject(error)
            })
    })
}
function insertPostgresKeyLimit(accountData){
    return new Promise((resolve, reject) => {
        postgresClient.query("insert into key.limit (key,limit_,created_at,updated_at, ratelimit_max, " +
            "ratelimit_duration) values ('" +
            accountData.key + "', " +
            accountData.limit + ", now(), now()," +
            (accountData.ratelimit_max? accountData.ratelimit_max : null) + ", " +
            (accountData.ratelimit_duration? accountData.ratelimit_duration : null) + ")")
            .then(result => {
                console.log("account.create - inserted row into key.limit:     key: " + accountData.key)
                resolve()
            })
            .catch(error => {
                console.error("account.create - error inserting into key.limit: " + error)
                reject(error)
            })
    })
}
function insertPostgresKeyAuthorization(accountData){
    return new Promise((resolve, reject) => {
        postgresClient.query("insert into key.authorization (key,authorized,created_at,updated_at, ratelimit_max, " +
            "ratelimit_duration, message) values ('" +
            accountData.key + "', true,  now(), now()," +
            (accountData.ratelimit_max? accountData.ratelimit_max : null) + ", " +
            (accountData.ratelimit_duration? accountData.ratelimit_duration : null) + ", '" + "Account creation" + "')")
            .then(result => {
                console.log("account.create - inserted row into key.authorization:     key: " + accountData.key)
                resolve()
            })
            .catch(error => {
                console.error("account.create - error inserting into key.authorization: " + error)
                reject(error)
            })
    })
}
function insertRedisAuthorization(accountData){
    return new Promise((resolve, reject) => {
        const akey = "authorized:" + accountData.key
        const redis_row = {}
        redis_row.authorized = true
        redis_row.message = 'Account created.'
        redis_row.ts = accountData.ts
        if(accountData.ratelimit_max){
            redis_row.ratelimit_max = accountData.ratelimit_max
        }
        if(accountData.ratelimit_duration){
            redis_row.ratelimit_duration = accountData.ratelimit_duration
        }
        redis_row.status = "success"

        const args = [akey, JSON.stringify(redis_row)]
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)
        return redisClientSendCommand('SET', args)
            .then(() => {
                console.log("account.create - set authorized in redis:     key: " + akey)
                resolve()
            })
            .catch((error) => {
                console.error("account.create - error attempting to set authorization in redis:      " +
                    "key: " + akey + "        error: " + error)
                reject(error)
            })
    })
}


function sendAccountCreationTextAndEmail(accountData){
    return new Promise((resolve, reject) => {
        AWS.config.region = process.env.IP2GEO_AWS_REGION
        const params = {
            Message: JSON.stringify(accountData),
            TopicArn: process.env.CREATE_ACCOUNT_SNS_TOPIC,
        }
        const snsPublishPromise = new AWS.SNS().publish(params).promise()

        snsPublishPromise
            .then( (data) => {
                console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`)
                console.log("MessageID is " + data.MessageId)
                resolve(null)
            })
            .catch((error) => {
                console.error(`account.sendAccountCreationTextAndEmail - failed to send sns:  
                accountData = ${accountData}      error: ${error}`)
                resolve(null)  // throw this error on the floor - its annoying but not life threatening
            })
    })
}












/*
account.display:
    returns a snapshot of the current status for the account associated with the supplied key
 */
/*

module.exports.display = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false
    console.log("account.display - start:")

    const start = new Date()
    let time_elapsed
    let {key} = event.queryStringParameters || {}
    const request_id = context.awsRequestId
    let source_ip =  event['requestContext']['identity']['sourceIp']
    let request_ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')

    const payload = {}
    const request = {}
    const account = {}

    let monthly_request_limit
    let monthly_limit_last_updated_date
    let current_month_request_count
    let ratelimit_max
    let ratelimit_duration
    let authorized
    let authorized_last_message
    let authorized_last_updated_date

    const response = {}
    // enable CORS in api gateway when using lambda proxy integration
    response.headers = {
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }

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
                        console.error("account.display - error getting account status       key: " + key + "   error: " + error)
                        let postgres_error = new Error()
                        postgres_error.message = error.message
                        postgres_error.code = 500
                        return callback(postgres_error)
                    }
                    else {
                        const rows = result.rows
                        if(rows.length < 1){
                            console.log("account.display - no rows returned for key: " + key)
                            let no_rows_error = new Error()
                            no_rows_error.message = "No data returned for key: " + key
                            no_rows_error.code = 400
                            return callback(no_rows_error)
                        }
                        else if(rows.length > 1){
                            console.log("account.display - multiple rows returned for key: " + key)
                            let multiple_rows_error = new Error()
                            multiple_rows_error.message = "Inconsistent data returned for key: " + key
                            multiple_rows_error.code = 400
                            return callback(multiple_rows_error)
                        }
                        else{
                            monthly_request_limit = rows[0].limit_
                            ratelimit_max = rows[0].ratelimit_max
                            ratelimit_duration = rows[0].ratelimit_duration
                            monthly_limit_last_updated_date = rows[0].limit_updated_date
                            current_month_request_count = rows[0].request_total
                            authorized = rows[0].authorized
                            authorized_last_message = rows[0].message
                            authorized_last_updated_date = rows[0].authorization_updated_date
                            callback(null)
                        }
                    }
                })
            }
        ],
        function (err, results) {
            request.request_id = request_id
            request.request_ts = request_ts
            request.source_ip = source_ip
            request.is_desktop = (event['headers']['CloudFront-Is-Desktop-Viewer'] === "true")
            request.is_mobile = (event['headers']['CloudFront-Is-Mobile-Viewer'] === "true")
            request.is_smart_tv = (event['headers']['CloudFront-Is-SmartTV-Viewer'] === "true")
            request.is_tablet = (event['headers']['CloudFront-Is-Tablet-Viewer'] === "true")
            request.viewer_country = event['headers']['CloudFront-Viewer-Country']
            request.accept_language = event['headers']['Accept-Language']
            request.origin = event['headers']['origin']
            request.referer = event['headers']['Referer']
            request.user_agent = event['headers']['User-Agent']

            payload.time_elapsed = new Date() - start
            payload.request = request

            if (err) {
                console.error("account.display - error returned from async.waterfall: " + err)
                payload.status = "error"
                payload.status_code = err.code
                payload.error = {message: err.message}

                response.statusCode = err.code
                response.body = JSON.stringify(payload)
            }
            else {
                payload.status = "success"
                payload.status_code = 200

                account.monthly_request_limit = monthly_request_limit
                account.ratelimit_max = ratelimit_max
                account.ratelimit_duration = ratelimit_duration
                account.monthly_limit_last_updated_date = monthly_limit_last_updated_date
                account.current_month_request_count = current_month_request_count
                account.authorized = authorized
                account.authorized_last_message = authorized_last_message
                account.authorized_last_updated_date = authorized_last_updated_date

                payload.account = account

                response.statusCode = 200
                response.body = JSON.stringify(payload)
            }

            // ====================================   CLOUDWATCH LOGGING   ===============================================
            console.log(JSON.stringify(payload))
            callback(null, response)
        }
    )
}

 */
