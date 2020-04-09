'use strict';

const isIp = require('is-ip');
const uuidValidate = require('uuid-validate');

exports.ip = function(ip) {
    return new Promise((resolve, reject) => {
        if (!ip) {
            console.error("validate.ip - ip required") ;
            const error = new Error();
            error.message = "No IP Address included in the request";
            error.code = 400;
            reject(error);
        }
        else if (! isIp(ip)) {
            console.error("validate.args - invalid ip: " + ip) ;
            const error = new Error();
            error.message = "Invalid IP Address included in the request: " + ip;
            error.code = 400;
            reject(error);
        }
        else {
            resolve(null);
        }
    });
};

exports.key = function(key) {
    return new Promise((resolve, reject) => {
        if (!key) {
            console.error("validate.key - key required") ;
            const error = new Error();
            error.message = "No API Key included in the request";
            error.code = 400;
            reject(error);
        }
        else if (! uuidValidate(key)) {
            console.error("validate.key - key must be UUID: " + key) ;
            const error = new Error();
            error.message = "Invalid API Key included in the request: " + key;
            error.code = 400;
            reject(error);
        }
        else {
            resolve(null);
        }
    });
};

exports.subscriptionEvent = function(event) {
    return new Promise((resolve, reject) => {

        if((( event == null)) || (event === '')) {  // == test is true for both null and 'undefined'
            reject(new Error( 'event null or empty or undefined'));
        }
        if((( event.body == null)) || (event.body === '')) {  // == test is true for both null and 'undefined'
            reject(new Error( 'event.body null or empty or undefined'));
        }

        const params = new URLSearchParams(event.body);
        if((( params.get("plan_name") == null)) || (params.get("plan_name") === '')){
            reject(new Error('plan_name null or empty or undefined'));
        }else if((( params.get("stripeToken") == null)) || (params.get("stripeToken") === '')){
            const error = new Error('stripeToken null or empty or undefined');
            reject(error);
        } else if((( params.get("stripeEmail") == null )) || (params.get("stripeEmail") === '')){
            reject(new Error('stripeEmail null or empty or undefined'));
        }
        else {
            resolve(null);
        }
    });
};


exports.accountEvent = function(event) {
    return new Promise((resolve, reject) => {
        if((( event == null)) || (event === '')) {  // == test is true for both null and 'undefined'
            reject(new Error( 'event null or empty or undefined'));
        }

        if(((typeof event.subscription_id === 'undefined')) || (event.subscription_id === '')){
            reject(new Error('null or empty subscription_id'));
        }else if(((typeof event.stripeEmail === 'undefined')) || (event.stripeEmail === '')){
            reject(new Error('null or empty stripeEmail'));
        } else if(((typeof event.planID === 'undefined')) || (event.planID === '')){
            reject(new Error('null or empty planID'));
        } else if(((typeof event.plan_name === 'undefined')) || (event.plan_name === '')){
            reject(new Error('null or empty plan_name'));
        }else{
            resolve (null);
        }
    });
};