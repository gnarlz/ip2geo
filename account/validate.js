'use strict'

const errors = require('../lib/errors')
const _ = {
  isEmpty: require('lodash.isempty')
}

const accountEvent = (event) => {
  if (!event) throw new Error(errors.INSUFFICIENT_ARGS_EVENT)
  if (_.isEmpty(event)) throw new Error(errors.INVALID_ARGS_EVENT)

  if (!event.subscription_id) throw new Error(errors.INSUFFICIENT_ARGS_SUBSCRIPTION_ID)
  if (!event.stripeEmail) throw new Error(errors.INSUFFICIENT_ARGS_STRIPE_EMAIL)
  if (!event.planID) throw new Error(errors.INSUFFICIENT_ARGS_PLAN_ID)
  if (!event.plan_name) throw new Error(errors.INSUFFICIENT_ARGS_PLAN_NAME)
}

module.exports = { accountEvent }
