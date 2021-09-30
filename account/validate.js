'use strict'

const _ = {
  isEmpty: require('lodash.isempty'),
  get: require('lodash.get'),
  set: require('lodash.set')
}
const errors = require('../lib/errors')

const accountEvent = (event) => {
  if (!event) throw new Error(errors.INSUFFICIENT_ARGS_EVENT)
  if (_.isEmpty(event)) throw new Error(errors.INVALID_ARGS_EVENT)

  // exists only to enable testing this function via postman
  /* istanbul ignore next */
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(_.get(event, 'body'))
    _.set(event, 'subscription_id', _.get(body, 'subscription_id'))
    _.set(event, 'stripeEmail', _.get(body, 'stripeEmail'))
    _.set(event, 'planID', _.get(body, 'planID'))
    _.set(event, 'plan_name', _.get(body, 'plan_name'))
  }

  if (!event.subscription_id) throw new Error(errors.INSUFFICIENT_ARGS_SUBSCRIPTION_ID)
  if (!event.stripeEmail) throw new Error(errors.INSUFFICIENT_ARGS_STRIPE_EMAIL)
  if (!event.planID) throw new Error(errors.INSUFFICIENT_ARGS_PLAN_ID)
  if (!event.plan_name) throw new Error(errors.INSUFFICIENT_ARGS_PLAN_NAME)
}

module.exports = { accountEvent }
