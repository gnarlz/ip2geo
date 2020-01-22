'use strict';

exports.args = function(event, callback) {

    let error;
    let args = [];

    let {ip, key} = event.queryStringParameters || {};

    if(!ip) {
        ip = event['requestContext']['identity']['sourceIp'];
    }

    if(!key) {
        console.error("parse.args - event.queryStringParameters.key required") ;
        error = new Error();
        error.message = "No API Key included in the request"
        error.code = 400;
        return callback(error);
    }

    args[0] = ip;
    args[1] = key;
	callback(null, args);
}

