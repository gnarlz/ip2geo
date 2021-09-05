'use strict'

const moment = require('moment')
const uuidv4 = require('uuid/v4')
const http = require('http-codes')
const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})


const plans = require('./plans')
const errors = require('../lib/errors')
const utilities  = require('../utility/utilities')
const emailer = require('../email/emailer')
const validate = require('./validate')
const {
    insertPostgresKeyAccount,insertPostgresKeyRequest, insertPostgresKeyLimit,
    insertPostgresKeyAuthorization,insertRedisAuthorization,sendAccountCreationTextAndEmail
} = require('./helper')


/**
 * Creates an ip2geo account.
 * Invoked by a stripe overlay POSTing to subscribe/subscribe.js
 * Implementation Details:
 *      Validates data
 *      Creates new key (uuid)
 *      Inserts row into postgres key.account
 *      Inserts row into postgres key.request
 *      Inserts row into postgres key.limit
 *      Inserts row into postgres key.authorization
 *      Inserts "row" authorized:key into redis
 *      Calls Postmark to email new subscriber with API key and documentation links
 *      Publish to sns topic (text and email to admin with success/failure details of the new account creation)
 * 
 * @param {Object} event (required)
 * @param {String} event.subscription_id (required)
 * @param {String} event.stripeEmail (required)
 * @param {String} event.planID (required)
 * @param {String} event.plan_name (required)
 * @param {Object} event.queryStringParameters (required)
 * @param {Object} event.requestContext (required)
 * @param {Object} event.requestContext.identity (required)
 * @param {String} event.requestContext.identity.sourceIp (required)
 * @param {Array} [event.headers] (required)
 * @param {Object} context (required)
 * @param {String} context.awsRequestId (required)
 * @return {Object} Well formed JSON response containing information on whether the accout creation was successful or not.
 * @public
 */
module.exports.create = async (event, context) => {
    const start = new Date()
    const request = {}
    const requestId = context.awsRequestId
   
    utilities.enrichRequest(request, event, context)

    try {
        validate.accountEvent(event)
    } catch (error) {
        logger.log({requestId, level: 'error',message: `account.create - validation error: ${error}`})
        return createErrorResponse(request, start)
    }
    
    const accountData = populateAccountData(event)
    logger.log({requestId, level: 'info', message: `account.create - accountData: ${JSON.stringify(accountData)}`})

    return Promise.all([
        insertPostgresKeyAccount(accountData, requestId),
        insertPostgresKeyRequest(accountData, requestId),
        insertPostgresKeyLimit(accountData, requestId),
        insertPostgresKeyAuthorization(accountData, requestId),
        insertRedisAuthorization(accountData, requestId)
    ])
    .then(() => {
        return emailer.sendNewSubscriberEmail(accountData, requestId)
    })
    .then(() => {
        accountData.status = 'SUCCESS'
        accountData.message = 'account created'
        logger.log({requestId, level: 'info', message: `account.create - successfully created account: ${JSON.stringify(accountData)}`})
        return
    })
    .catch((error) => {
        accountData.status = 'FAILURE'
        accountData.message = `account not created - error: ${error}`
        logger.log({requestId, level: 'error',  message: `account.create - error creating account: ${JSON.stringify(accountData)}`})
        return error
    })
    .then((error) => {
        sendAccountCreationTextAndEmail(accountData, requestId) 

        if (error) return createErrorResponse(request, start)
        return createSuccessResponse(request, start)
    })
}


const populateAccountData = (event) => {
    const accountData = {}
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
    return accountData
}


const createErrorResponse = (request, start) => {
    const response = {}
    utilities.setResponseHeadersCORS(response)    // enable CORS in api gateway when using lambda proxy integration

    const payload = {}
    payload.time_elapsed = new Date() - start
    payload.status = "error"
    payload.status_code = http.INTERNAL_SERVER_ERROR
    payload.request = request
    payload.error = {
        message: errors.ACCOUNT_CREATION_UNSUCCESSFUL, 
        code: http.INTERNAL_SERVER_ERROR
    }

    response.statusCode = http.INTERNAL_SERVER_ERROR
    response.body = payload
    return response
}


const createSuccessResponse = (request, start) =>{
    const response = {}
    utilities.setResponseHeadersCORS(response)    // enable CORS in api gateway when using lambda proxy integration

    const payload = {}
    payload.time_elapsed = new Date() - start
    payload.status = "success"
    payload.status_code = http.OK
    payload.request = request

    response.statusCode = http.OK
    response.body = payload
    return response
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
