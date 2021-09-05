'use strict'

const isIp = require('is-ip')
const uuidValidate = require('uuid-validate')
const errors = require('../lib/errors')
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


exports.subscriptionEvent = function(event) {
    if (!event) throw new Error( errors.INSUFFICIENT_ARGS_EVENT)
    if (_.isEmpty(event)) throw new Error( errors.INVALID_ARGS_EVENT)
    if (!event.body) throw new Error( errors.INSUFFICIENT_ARGS_EVENT_BODY)
   
    const params = new URLSearchParams(event.body)
    if (!params.get("plan_name")) throw new Error( errors.INSUFFICIENT_ARGS_PLAN_NAME)
    if (!params.get("stripeToken")) throw new Error( errors.INSUFFICIENT_ARGS_STRIPE_TOKEN)
    if (!params.get("stripeEmail")) throw new Error( errors.INSUFFICIENT_ARGS_STRIPE_EMAIL)
}

