'use strict'

const isIp = require('is-ip')
const uuidValidate = require('uuid-validate')
const errors = require('./errors')
const _ = {
    cloneDeep: require('lodash.clonedeep'),
    findKey: require('lodash.findkey'),
    flatten: require('lodash.flatten'),
    get: require('lodash.get'),
    isEqual: require('lodash.isequal'),
    isEmpty: require('lodash.isempty'),
    keys: require('lodash.keys'),
    partial: require('lodash.partial'),
    range: require('lodash.range'),
    set: require('lodash.set'),
    sortBy: require('lodash.sortby'),
    uniq: require('lodash.uniq'),
    uniqBy: require('lodash.uniqby'),
    unset: require('lodash.unset')
  }

exports.ip = function(ip) {
    return new Promise((resolve, reject) => {
        if (!ip) {
            console.error("validate.ip - ip required") 
            const error = new Error()
            error.message = "No IP Address included in the request"
            error.code = 400
            reject(error)
        }
        else if (! isIp(ip)) {
            console.error("validate.args - invalid ip: " + ip) 
            const error = new Error()
            error.message = "Invalid IP Address included in the request: " + ip
            error.code = 400
            reject(error)
        }
        else {
            resolve(null)
        }
    })
}

exports.key = function(key) {
    return new Promise((resolve, reject) => {
        if (!key) {
            console.error("validate.key - key required") 
            const error = new Error()
            error.message = "No API Key included in the request"
            error.code = 400
            reject(error)
        }
        else if (! uuidValidate(key)) {
            console.error("validate.key - key must be UUID: " + key) 
            const error = new Error()
            error.message = "Invalid API Key included in the request: " + key
            error.code = 400
            reject(error)
        }
        else {
            resolve(null)
        }
    })
}


