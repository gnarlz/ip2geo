'use strict';

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const AWS = require('aws-sdk');


module.exports.mvp =  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    subscribe(event, process.env.STRIPE_MVP_PLAN,  callback);
};

module.exports.bootstrap =  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    subscribe(event, process.env.STRIPE_BOOTSTRAP_PLAN,  callback);
};

module.exports.startup =  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    subscribe(event, process.env.STRIPE_STARTUP_PLAN,  callback);
};

module.exports.growth =  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    subscribe(event, process.env.STRIPE_GROWTH_PLAN,  callback);
};



function subscribe(event, planID, callback){
    let params = new URLSearchParams(event.body);

    let subscription_data = {};
    subscription_data.planID = planID;
    subscription_data.plan_name = params.get("plan_name");
    subscription_data.stripeToken = params.get("stripeToken");
    subscription_data.stripeEmail = params.get("stripeEmail");

    const response = {};
    response.headers = {"Access-Control-Allow-Origin": "*"}; // enable CORS in api gateway when using lambda proxy integration

    createPaymentMethod(subscription_data, response, callback);
}


function createPaymentMethod(subscription_data, response, callback){
    stripe.paymentMethods.create(
        {
            type: 'card',
            card: {
                token: subscription_data.stripeToken,
            },
        },
        function(err, paymentMethod) {
            if (err){
                console.error("error in stripe.paymentMethods.create - subscription_data: "  + JSON.stringify(subscription_data)  + " err: " + err);
                sendErrorResponse(response, callback);
            }
            else {
                console.log("paymentMethod: " + JSON.stringify(paymentMethod));
                subscription_data.paymentMethod_id = paymentMethod.id;
                createCustomer(subscription_data, response, callback);
            }
        }
    )
}


function createCustomer(subscription_data, response, callback){
    stripe.customers.create(
        {
            payment_method: subscription_data.paymentMethod_id,
            email: subscription_data.stripeEmail,
        },
        function(err, customer) {
            if (err){
                console.error("error in stripe.customers.create - subscription_data: "  + JSON.stringify(subscription_data)  + " err: " + err);
                sendErrorResponse(response, callback);
            }
            else {
                console.log("customer: " + JSON.stringify(customer));
                subscription_data.customer_id = customer.id;
                createSubscription(subscription_data, response, callback);
            }
        })
}


function createSubscription(subscription_data, response, callback) {
    stripe.subscriptions.create(
        {
            customer: subscription_data.customer_id,
            items: [{plan: subscription_data.planID}],
            trial_period_days: 30,
        },
        function(err, subscription) {
            if (err){
                console.error("error in stripe.subscriptions.create - subscription_data: "  + JSON.stringify(subscription_data)  + " err: " + err);
                sendErrorResponse(response, callback);
            }
            else {
                console.log("subscription: " + JSON.stringify(subscription));
                subscription_data.subscription_id = subscription.id;
                createAccount(subscription_data, response, callback);
            }
        })
}


function createAccount(subscription_data, response, callback){

    // TODO: convert this to step functions
    let lambda = new AWS.Lambda();
    let params = {
        FunctionName: 'ip2geo-v1-account-create',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload:  JSON.stringify(subscription_data)
    };
    lambda.invoke(params, function(err, data) {
        if (err) {
            // an error occurred trying to invoke account.create
            console.error("error attempting to invoke account.create lambda - subscription_data: "  + JSON.stringify(subscription_data)  + " err: " + err);
            sendErrorResponse(response, callback);
        }
        else if (data.FunctionError) {
            // an error was returned from account.create - a text and email will be sent to admin in account.create
            console.error("error returned from account.create lambda - subscription_data: "  + JSON.stringify(subscription_data));
            sendErrorResponse(response, callback);
        }
        else {
            console.log('success invoking account.create lambda - subscription_data:  '+ JSON.stringify(subscription_data));
            response.statusCode = 301;
            response.headers = {Location: 'https://www.ip2geo.co/subscribed.html'};
            callback(null, response);
        }
    })
}


function sendErrorResponse(response, callback){
    response.statusCode = 301;
    response.headers = {Location: 'https://www.ip2geo.co/error.html'};
    callback(null, response);
}