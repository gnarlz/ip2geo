'use strict'

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const AWS = require('aws-sdk')
const http = require('http-codes')
const validate = require('./validate')
const utilities  = require('../utility/utilities')
const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})

const mvp =  async (event, context) => {
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

const subscribe = async (event, context, planID) => {
    const requestId = context.awsRequestId
    const subscription_data = {}
    subscription_data.planID = planID

    try {
        validate.subscriptionEvent(event)
    } catch (error) {
        logger.log({requestId, level: 'error', message: `subscribe.subscribe - validation error: ${error}  event: ${JSON.stringify(event)}`})
        return createErrorResponse()
    }

    const params = new URLSearchParams(event.body)
    subscription_data.plan_name = params.get("plan_name")
    subscription_data.stripeToken = params.get("stripeToken")
    subscription_data.stripeEmail = params.get("stripeEmail")
    logger.log({requestId, level: 'info', message: `subscribe.subscribe - attempting to create payment method for subscription_data: ${JSON.stringify(subscription_data)}`})
    
    return stripe.paymentMethods.create({type: 'card', card: {token: subscription_data.stripeToken}}) 
    .then((paymentMethod) => {
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - successfully created payment method: ${JSON.stringify(paymentMethod)}`})
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - attempting to create customer for subscription_data: ${JSON.stringify(subscription_data)}`})
        
        return stripe.customers.create({payment_method: paymentMethod.id, email: subscription_data.stripeEmail})
    })
    .then((customer) => {
        subscription_data.customer_id = customer.id
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - successfully created customer: ${JSON.stringify(customer)}`})
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - attempting to create subscription for subscription_data: ${JSON.stringify(subscription_data)}`})

        return stripe.subscriptions.create({customer: subscription_data.customer_id, items: [{plan: subscription_data.planID}], trial_period_days: 30})
    })
    .then((subscription) => {
        // subscription has been created in stripe - now create the corresponding account on our side
        subscription_data.subscription_id = subscription.id
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - successfully created subscription: ${JSON.stringify(subscription)}`})
        logger.log({requestId, level: 'info', message: `subscribe.subscribe - attempting to create ip2geo account for subscription_data: ${JSON.stringify(subscription_data)}`})

        // TODO: not best practice, refactor
        const lambda = new AWS.Lambda()
        const params = {
            FunctionName: process.env.CREATE_ACCOUNT_FUNCTION_NAME,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload:  JSON.stringify(subscription_data)
        }
        return lambda.invoke(params).promise() // this always returns a well formed JSON response
    })
    .then((accountCreationResponse) => {
        if (accountCreationResponse.statusCode === http.OK) {
            logger.log({requestId, level: 'info', message: `subscribe.subscribe - successfully created ip2geo account for subscription_data: ${JSON.stringify(subscription_data)}   accountCreationResponse: ${JSON.stringify(accountCreationResponse)}`})
            return createSuccessResponse()
        } else {
            logger.log({requestId, level: 'error', message: `subscribe.subscribe - did not successfully create ip2geo account for subscription_data: ${JSON.stringify(subscription_data)}  accountCreationResponse: ${JSON.stringify(accountCreationResponse)}`})
            return createErrorResponse()
        }
    })
    .catch((error) => {
        logger.log({requestId, level: 'error', message: `subscribe.subscribe - error creating subscription and account for subscription_data: ${JSON.stringify(subscription_data)}  error: ${error}`})
        return createErrorResponse()
    })
}

const createErrorResponse = () => {
    const response = {}
    utilities.setResponseHeadersCORS(response)    // enable CORS in api gateway when using lambda proxy integration
    response.statusCode = http.MOVED_PERMANENTLY
    response.headers["Location"] = 'https://www.ip2geo.co/error.html'
    return response
}

const createSuccessResponse = (request, start) =>{
    const response = {}
    utilities.setResponseHeadersCORS(response)    // enable CORS in api gateway when using lambda proxy integration
    response.statusCode = http.MOVED_PERMANENTLY
    response.headers["Location"] = 'https://www.ip2geo.co/subscribed.html'
    return response
}

module.exports = {mvp, bootstrap, startup, growth, subscribe}

