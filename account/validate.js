'use strict'

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

exports.accountEvent = (event) => {
    if (!event) throw new Error( errors.INSUFFICIENT_ARGS_EVENT)
    if (_.isEmpty(event)) throw new Error( errors.INVALID_ARGS_EVENT)

    if (!event.subscription_id) throw new Error( errors.INSUFFICIENT_ARGS_SUBSCRIPTION_ID)
    if (!event.stripeEmail) throw new Error( errors.INSUFFICIENT_ARGS_STRIPE_EMAIL)
    if (!event.planID) throw new Error( errors.INSUFFICIENT_ARGS_PLAN_ID)
    if (!event.plan_name) throw new Error( errors.INSUFFICIENT_ARGS_PLAN_NAME)
}



