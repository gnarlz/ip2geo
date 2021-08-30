'use strict';

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const AWS = require('aws-sdk');
const validate = require('../lib/validate');
const utilities  = require('../utility/utilities');


module.exports.mvp =  (event, context) => {
    return new Promise((resolve, reject) => {
       return subscribe(event, process.env.STRIPE_MVP_PLAN).then((response) => { resolve(response)});
    });
};
module.exports.bootstrap =  (event, context) => {
    return new Promise((resolve, reject) => {
        subscribe(event, process.env.STRIPE_BOOTSTRAP_PLAN).then((response) => { resolve(response)});
    });
};
module.exports.startup =  (event, context) => {
    return new Promise((resolve, reject) => {
        subscribe(event, process.env.STRIPE_STARTUP_PLAN).then((response) => { resolve(response)});
    });
};
module.exports.growth =  (event, context) => {
    return new Promise((resolve, reject) => {
        subscribe(event, process.env.STRIPE_GROWTH_PLAN).then((response) => { resolve(response)});
    });
};


function subscribe(event, planID){
    return new Promise((resolve, reject) => {
        const response = {};
        const subscription_data = {};
        subscription_data.planID = planID;
        utilities.setResponseHeadersCORS(response);   // enable CORS in api gateway when using lambda proxy integration

        validate.subscriptionEvent(event)
            .then(() => {
                const params = new URLSearchParams(event.body);
                subscription_data.plan_name = params.get("plan_name");
                subscription_data.stripeToken = params.get("stripeToken");
                subscription_data.stripeEmail = params.get("stripeEmail");
                return stripe.paymentMethods.create({
                    type: 'card',
                    card: {token: subscription_data.stripeToken}
                })})
            .then((paymentMethod) => {
                return stripe.customers.create({
                    payment_method: paymentMethod.id,
                    email: subscription_data.stripeEmail
                });
            })
            .then((customer) => {
                subscription_data.customer_id = customer.id;
                return stripe.subscriptions.create({
                        customer: subscription_data.customer_id,
                        items: [{plan: subscription_data.planID}],
                        trial_period_days: 30,
                    });
            })
            .then((subscription) => {
                // subscription has been created in stripe - now create the corresponding account on our side
                subscription_data.subscription_id = subscription.id;
                const lambda = new AWS.Lambda();
                const params = {
                    FunctionName: process.env.CREATE_ACCOUNT_FUNCTION_NAME,
                    InvocationType: 'RequestResponse',
                    LogType: 'Tail',
                    Payload:  JSON.stringify(subscription_data)
                };
                return lambda.invoke(params).promise();
            })
            .then(() => {
                console.log("success creating subscription and account: " + JSON.stringify(subscription_data));
                response.statusCode = 301;
                response.headers["Location"] = 'https://www.ip2geo.co/subscribed.html';
                resolve(response);
            })
            .catch((error) => {
                console.log("error creating subscription and account: " + JSON.stringify(subscription_data)
                    + "     error: " + error);
                response.statusCode = 301;
                response.headers["Location"] = 'https://www.ip2geo.co/error.html';
                resolve(response);
            });
    });
}

