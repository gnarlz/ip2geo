'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const uuidv4 = require('uuid/v4')

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  body: {
    plan_name: 'mvp_001',
    stripeToken: 'tok_visa',
    stripeEmail: 'postmark@telematic.io'
  },
  queryStringParameters: {},
  requestContext: {
    identity: {
      sourceIp: process.env.SOURCE_IP
    }
  },
  headers: {}
}

describe('/subscribe/subscribe.subscribe test', () => {
  it('should happily work', () => {
    const subscribe = require('../../../subscribe/subscribe')
    return subscribe.subscribe(validEvent, validContext, process.env.STRIPE_MVP_PLAN)
      .then((response) => {
        expect(response).to.be.a('object')
        expect(response.statusCode).to.equal(301)
        expect(response.headers.Location).to.equal('https://www.ip2geo.co/subscribed.html')
      })
  })
})
