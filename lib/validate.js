'use strict';

const isIp = require('is-ip');
const uuidValidate = require('uuid-validate');


exports.ip = function(ip, callback) {

    let error;

    if (!ip) {
        console.error("validate.args - ip required") ;
        error = new Error();
        error.message = "No IP Address included in the request";
        error.code = 400;
        return callback(error);
    }
    else if (! isIp(ip)) {
        console.error("validate.args - invalid ip: " + ip) ;
        error = new Error();
        error.message = "Invalid IP Address included in the request: " + ip;
        error.code = 400;
        return callback(error);
    }
    else {
        callback(null);
    }

}



exports.key = function(key, callback) {
    let error;
    if (!key) {
        console.error("validate.args - key required") ;
        error = new Error();
        error.message = "No API Key included in the request";
        error.code = 400;
        return callback(error);
    }
    else if (! uuidValidate(key)) {
        console.error("validate.args - key must be UUID: " + key) ;
        error = new Error();
        error.message = "Invalid API Key included in the request: " + key;
        error.code = 400;
        return callback(error);
    }
    else {
        callback(null);
    }
}