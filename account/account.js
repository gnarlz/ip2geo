'use strict'

const moment = require('moment')
const uuidv4 = require('uuid/v4')
const http = require('http-codes')
const _ = {
  get: require('lodash.get'),
  set: require('lodash.set')
}
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
const plans = require('./plans')
const errors = require('../lib/errors')
const utilities = require('../utility/utilities')
const emailer = require('./emailer')
const validate = require('./validate')
const {
  insertPostgresKeyAccount, insertPostgresKeyRequest, insertPostgresKeyLimit,
  insertPostgresKeyAuthorization, insertRedisAuthorization, sendAccountCreationTextAndEmail
} = require('./helper')

/**
 * Creates an ip2geo account.
 * The second step in creating a new subscription.
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
 * @param {String} event.requestContext.identity.sourceIp (required)
 * @param {Array} [event.headers] (required)
 * @param {Object} context (required)
 * @param {String} context.awsRequestId (required)
 * @return {Object} Well formed JSON response containing information on whether the accout creation was successful or not.
 * @public
 */
const create = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const start = new Date()
  const requestId = context.awsRequestId
  const request = utilities.enrichRequest(event, context)

  try {
    validate.accountEvent(event)
  } catch (error) {
    logger.log({ requestId, level: 'error', src: 'account.create', error: error.message, event })
    return createErrorResponse(request, start)
  }

  const accountData = populateAccountData(event)
  logger.log({ requestId, level: 'info', src: 'account.create', accountData })

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
      _.set(accountData, 'status', 'success')
      _.set(accountData, 'message', 'account created')
      logger.log({ requestId, level: 'info', src: 'account.create', message: 'successfully created account', accountData })
    })
    .catch((error) => {
      _.set(accountData, 'status', 'error')
      _.set(accountData, 'message', 'account not created')
      logger.log({ requestId, level: 'error', src: 'account.create', message: 'error creating account', accountData, error: error.message })
      return error
    })
    .then((error) => {
      sendAccountCreationTextAndEmail(accountData, requestId) // this will be called for both success and failure

      if (error) return createErrorResponse(request, start)
      return createSuccessResponse(request, start)
    })
}

const populateAccountData = (event) => {
  const accountData = {
    action: 'account.create',
    ts: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    key: uuidv4(),
    subscription_id: event.subscription_id,
    email: event.stripeEmail,
    plan_id: event.planID,
    plan_name: event.plan_name,
    plan_created_at: plans[event.plan_name].created_at,
    display_name: plans[event.plan_name].display_name,
    limit: plans[event.plan_name].limit,
    ratelimit_max: plans[event.plan_name].ratelimit_max,
    ratelimit_duration: plans[event.plan_name].ratelimit_duration,
    price: plans[event.plan_name].price
  }
  return accountData
}

const createErrorResponse = (request, start) => {
  const response = {}
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration

  const payload = {
    time_elapsed: new Date() - start,
    status: 'error',
    status_code: http.INTERNAL_SERVER_ERROR,
    request: request,
    error: {
      message: errors.ACCOUNT_CREATION_UNSUCCESSFUL,
      code: http.INTERNAL_SERVER_ERROR
    }
  }

  _.set(response, 'statusCode', http.INTERNAL_SERVER_ERROR)
  _.set(response, 'body', JSON.stringify(payload))
  return response
}

const createSuccessResponse = (request, start) => {
  const response = {}
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration

  const payload = {
    time_elapsed: new Date() - start,
    status: 'success',
    status_code: http.OK,
    request: request
  }

  _.set(response, 'statusCode', http.OK)
  _.set(response, 'body', JSON.stringify(payload))
  return response
}

module.exports = { create }
