'use strict'

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const AWS = require('aws-sdk')
const http = require('http-codes')
const _ = {
  set: require('lodash.set')
}
const validate = require('./validate')
const utilities = require('../utility/utilities')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

const mvp = async (event, context) => {
  return subscribe(event, context, process.env.STRIPE_MVP_PLAN)
}
const bootstrap = async (event, context) => {
  return subscribe(event, context, process.env.STRIPE_BOOTSTRAP_PLAN)
}
const startup = async (event, context) => {
  return subscribe(event, context, process.env.STRIPE_STARTUP_PLAN)
}
const growth = async (event, context) => {
  return subscribe(event, context, process.env.STRIPE_GROWTH_PLAN)
}

/**
 * Creates a subscription @ Stripe, and then a corresponding account @ ip2geo.
 *
 * @param {Object} event (required)
 * @param {Object} event.body.plan_name (required)
 * @param {Object} event.body.stripeToken (required)
 * @param {Object} event.body.stripeEmail (required)
 * @param {Object} context (required)
 * @param {String} context.awsRequestId (required)
 * @return {Object} Well formed JSON response with a 301 redirect to indicate success or failure to the UI
 * @public
 */
const subscribe = async (event, context, planID) => {
  context.callbackWaitsForEmptyEventLoop = false

  const requestId = context.awsRequestId
  const subscriptionData = {}
  subscriptionData.planID = planID

  try {
    validate.subscriptionEvent(event)
  } catch (error) {
    logger.log({ requestId, level: 'error', src: 'subscribe/subscribe.subscribe', message: 'validation error', error: error.message, event })
    return createErrorResponse()
  }

  const params = new URLSearchParams(event.body)
  subscriptionData.plan_name = params.get('plan_name')
  subscriptionData.stripeToken = params.get('stripeToken')
  subscriptionData.stripeEmail = params.get('stripeEmail')
  logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'attempting to create payment method ', subscriptionData, event })

  return stripe.paymentMethods.create({ type: 'card', card: { token: subscriptionData.stripeToken } })
    .then((paymentMethod) => {
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'successfully created payment method', subscriptionData, paymentMethod, event })
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'attempting to create customer', subscriptionData, event })
      return stripe.customers.create({ payment_method: paymentMethod.id, email: subscriptionData.stripeEmail })
    })
    .then((customer) => {
      subscriptionData.customer_id = customer.id
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'successfully created customer', subscriptionData, customer, event })
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'attempting to create subscription', subscriptionData, event })
      return stripe.subscriptions.create({ customer: subscriptionData.customer_id, items: [{ plan: subscriptionData.planID }], trial_period_days: 30 })
    })
    .then((subscription) => {
      // subscription has been created in stripe - now create the corresponding account on our side
      subscriptionData.subscription_id = subscription.id
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'successfully created subscription', subscriptionData, subscription, event })
      logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'attempting to create ip2geo account', subscriptionData, event })

      if (process.env.NODE_ENV === 'int') {
        // invoke local account.create when running integration tests
        _.set(event, 'subscription_id', subscriptionData.subscription_id)
        _.set(event, 'stripeEmail', subscriptionData.stripeEmail)
        _.set(event, 'planID', subscriptionData.planID)
        _.set(event, 'plan_name', subscriptionData.plan_name)

        const account = require('../account/account')
        return account.create(event, context)
      } else {
        const createAccount = new AWS.Lambda() // TODO: not best practice, refactor
        const params = {
          FunctionName: process.env.CREATE_ACCOUNT_FUNCTION_NAME,
          InvocationType: 'RequestResponse',
          LogType: 'Tail',
          Payload: JSON.stringify(subscriptionData)
        }
        return createAccount.invoke(params).promise() // this always returns a well formed JSON response
      }

      /*
      // TODO: not best practice, refactor
      const createAccount = new AWS.Lambda()
      const params = {
        FunctionName: process.env.CREATE_ACCOUNT_FUNCTION_NAME,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(subscriptionData)
      }
      return createAccount.invoke(params).promise() // this always returns a well formed JSON response
      */
    })
    .then((accountCreationResponse) => {
      if (accountCreationResponse.statusCode === http.OK) {
        logger.log({ requestId, level: 'info', src: 'subscribe/subscribe.subscribe', message: 'successfully created ip2geo account', subscriptionData, accountCreationResponse, event })
        return createSuccessResponse()
      } else {
        logger.log({ requestId, level: 'error', src: 'subscribe/subscribe.subscribe', message: 'did not successfully create ip2geo account', subscriptionData, accountCreationResponse, event })
        return createErrorResponse()
      }
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'subscribe/subscribe.subscribe', message: 'error creating subscription and ip2geo account', subscriptionData, event, error: error.message })
      return createErrorResponse()
    })
}

const createErrorResponse = () => {
  const response = {}
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration
  response.statusCode = http.MOVED_PERMANENTLY
  response.headers.Location = 'https://www.ip2geo.co/error.html'
  return response
}

const createSuccessResponse = (request, start) => {
  const response = {}
  utilities.setResponseHeadersCORS(response) // enable CORS in api gateway when using lambda proxy integration
  response.statusCode = http.MOVED_PERMANENTLY
  response.headers.Location = 'https://www.ip2geo.co/subscribed.html'
  return response
}

module.exports = { mvp, bootstrap, startup, growth, subscribe }
