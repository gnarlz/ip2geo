'use strict'

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const AWS = require('aws-sdk')
const http = require('http-codes')
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
  const requestId = context.awsRequestId
  const subscriptionData = {}
  subscriptionData.planID = planID

  try {
    validate.subscriptionEvent(event)
  } catch (error) {
    logger.log({ requestId, level: 'error', message: `subscribe.subscribe - validation error: ${error}  event: ${JSON.stringify(event)}` })
    return createErrorResponse()
  }

  const params = new URLSearchParams(event.body)
  subscriptionData.plan_name = params.get('plan_name')
  subscriptionData.stripeToken = params.get('stripeToken')
  subscriptionData.stripeEmail = params.get('stripeEmail')
  logger.log({ requestId, level: 'info', message: `subscribe.subscribe - attempting to create payment method for subscriptionData: ${JSON.stringify(subscriptionData)}` })

  return stripe.paymentMethods.create({ type: 'card', card: { token: subscriptionData.stripeToken } })
    .then((paymentMethod) => {
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - successfully created payment method: ${JSON.stringify(paymentMethod)}` })
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - attempting to create customer for subscriptionData: ${JSON.stringify(subscriptionData)}` })

      return stripe.customers.create({ payment_method: paymentMethod.id, email: subscriptionData.stripeEmail })
    })
    .then((customer) => {
      subscriptionData.customer_id = customer.id
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - successfully created customer: ${JSON.stringify(customer)}` })
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - attempting to create subscription for subscriptionData: ${JSON.stringify(subscriptionData)}` })

      return stripe.subscriptions.create({ customer: subscriptionData.customer_id, items: [{ plan: subscriptionData.planID }], trial_period_days: 30 })
    })
    .then((subscription) => {
      // subscription has been created in stripe - now create the corresponding account on our side
      subscriptionData.subscription_id = subscription.id
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - successfully created subscription: ${JSON.stringify(subscription)}` })
      logger.log({ requestId, level: 'info', message: `subscribe.subscribe - attempting to create ip2geo account for subscriptionData: ${JSON.stringify(subscriptionData)}` })

      // TODO: not best practice, refactor
      const createAccount = new AWS.Lambda()
      const params = {
        FunctionName: process.env.CREATE_ACCOUNT_FUNCTION_NAME,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(subscriptionData)
      }
      return createAccount.invoke(params).promise() // this always returns a well formed JSON response
    })
    .then((accountCreationResponse) => {
      if (accountCreationResponse.statusCode === http.OK) {
        logger.log({ requestId, level: 'info', message: `subscribe.subscribe - successfully created ip2geo account for subscriptionData: ${JSON.stringify(subscriptionData)}   accountCreationResponse: ${JSON.stringify(accountCreationResponse)}` })
        return createSuccessResponse()
      } else {
        logger.log({ requestId, level: 'error', message: `subscribe.subscribe - did not successfully create ip2geo account for subscriptionData: ${JSON.stringify(subscriptionData)}  accountCreationResponse: ${JSON.stringify(accountCreationResponse)}` })
        return createErrorResponse()
      }
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', message: `subscribe.subscribe - error creating subscription and account for subscriptionData: ${JSON.stringify(subscriptionData)}  error: ${error}` })
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
