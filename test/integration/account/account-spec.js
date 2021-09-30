'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const uuidv4 = require('uuid/v4')

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  subscription_id: uuidv4(),
  stripeEmail: 'postmark@telematic.io',
  planID: 'plan_GVK3dbrCJxAEqa',
  plan_name: 'mvp_001',
  queryStringParameters: {},
  requestContext: {
    identity: {
      sourceIp: process.env.SOURCE_IP
    }
  },
  headers: {}
}

describe('/account/account.create test', () => {
  it('should happily work', () => {
    const account = require('../../../account/account')
    return account.create(validEvent, validContext)
      .then((response) => {
        expect(response).to.be.a('object')
        expect(response.statusCode).to.equal(200)
      })
  })
})
