'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const uuidv4 = require('uuid/v4')
const http = require('http-codes')

const unit = (fns) => {
  return proxyquire('../../../subscribe/subscribe', {
    'aws-sdk': {
      Lambda: class {
        invoke (data) {
          return { promise: fns.promise || (it => it) }
        }
      }
    },
    stripe: () => {
      return {
        paymentMethods: {
          create: fns.createPaymentMethod || (it => it)
        },
        customers: {
          create: fns.createCustomer || (it => it)
        },
        subscriptions: {
          create: fns.createSubscription || (it => it)
        }
      }
    }
  })
}

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  body: {
    plan_name: 'plan_GVK3dbrCJxAEqa',
    stripeToken: 'abc123',
    stripeEmail: 'foo@bar.com'
  },
  headers: []
}

const validateErrorResponse = (response) => {
  expect(response).to.be.a('object')
  expect(response.statusCode).to.equal(http.MOVED_PERMANENTLY)
  expect(response.headers.Location).to.equal('https://www.ip2geo.co/error.html')
}
const validateSuccessResponse = (response) => {
  expect(response).to.be.a('object')
  expect(response.statusCode).to.equal(http.MOVED_PERMANENTLY)
  expect(response.headers.Location).to.equal('https://www.ip2geo.co/subscribed.html')
}

describe('subscribe/subscribe test', () => {
  it('subscribe() should return well formed error response when error is thrown by validation (null event)', () => {
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(null, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by validation (empty event)', () => {
    const event = {}
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by validation (empty event.body)', () => {
    const event = { body: '' }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('subscribe() should return well formed error response when error is thrown by validation (null plan_name)', () => {
    const event = {
      body: {
        // plan_name: '',
        stripeToken: 'abc123',
        stripeEmail: 'foo@bar.com'
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by validation (empty plan_name)', () => {
    const event = {
      body: {
        plan_name: '',
        stripeToken: 'abc123',
        stripeEmail: 'foo@bar.com'
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('subscribe() should return well formed error response when error is thrown by validation (null stripeToken)', () => {
    const event = {
      body: {
        plan_name: 'plan_GVK3dbrCJxAEqa',
        // stripeToken: 'abc123',
        stripeEmail: 'foo@bar.com'
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by validation (empty stripeToken)', () => {
    const event = {
      body: {
        plan_name: 'plan_GVK3dbrCJxAEqa',
        stripeToken: '',
        stripeEmail: 'foo@bar.com'
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('subscribe() should return well formed error response when error is thrown by validation (null stripeEmail)', () => {
    const event = {
      body: {
        plan_name: 'plan_GVK3dbrCJxAEqa',
        stripeToken: 'abc123'
        // stripeEmail: 'foo@bar.com'
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by validation (empty stripeEmail)', () => {
    const event = {
      body: {
        plan_name: 'plan_GVK3dbrCJxAEqa',
        stripeToken: 'abc123',
        stripeEmail: ''
      },
      headers: []
    }
    const subscribeProxy = unit({})
    return subscribeProxy.subscribe(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('subscribe() should return well formed error response when error is thrown by stripe.paymentMethods.create()', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { throw new Error('stripe.paymentMethods.create error') },
      createCustomer: async (opts) => { return null },
      createSubscription: async (opts) => { return null }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by stripe.customers.create()', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { throw new Error('stripe.customers.create error') },
      createSubscription: async (opts) => { return null }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by stripe.subscriptions.create()', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { throw new Error('stripe.subscriptions.create error') }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed error response when error is thrown by lambda.invoke(params).promise()', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { throw new Error('lambda.invoke(params).promise() error') }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('subscribe() should return well formed error response when lambda.invoke(params).promise() returns a statusCode != 200', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.IM_A_TEAPOT } }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('subscribe() should return well formed success response when lambda.invoke(params).promise() returns a statusCode === 200', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.OK } }
    })
    return subscribeProxy.subscribe(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })

  it('mvp() should return well formed success response', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.OK } }
    })
    return subscribeProxy.mvp(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
  it('bootstrap() should return well formed success response', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.OK } }
    })
    return subscribeProxy.bootstrap(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
  it('startup() should return well formed success response', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.OK } }
    })
    return subscribeProxy.startup(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
  it('growth() should return well formed success response', () => {
    const subscribeProxy = unit({
      createPaymentMethod: async (opts) => { return { id: 5 } },
      createCustomer: async (opts) => { return { id: 6 } },
      createSubscription: async (opts) => { return { id: 7 } },
      promise: async (opts) => { return { statusCode: http.OK } }
    })
    return subscribeProxy.growth(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
})
