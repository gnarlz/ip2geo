'use strict'

const errors = require('../lib/errors')
const _ = {
  isEmpty: require('lodash.isempty')
}

const subscriptionEvent = (event) => {
  if (!event) throw new Error(errors.INSUFFICIENT_ARGS_EVENT)
  if (_.isEmpty(event)) throw new Error(errors.INVALID_ARGS_EVENT)
  if (!event.body) throw new Error(errors.INSUFFICIENT_ARGS_EVENT_BODY)

  const params = new URLSearchParams(event.body)
  if (!params.get('plan_name')) throw new Error(errors.INSUFFICIENT_ARGS_PLAN_NAME)
  if (!params.get('stripeToken')) throw new Error(errors.INSUFFICIENT_ARGS_STRIPE_TOKEN)
  if (!params.get('stripeEmail')) throw new Error(errors.INSUFFICIENT_ARGS_STRIPE_EMAIL)
}

module.exports = { subscriptionEvent }
