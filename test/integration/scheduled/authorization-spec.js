'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const uuidv4 = require('uuid/v4')

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  queryStringParameters: {},
  requestContext: {
    identity: {
      sourceIp: process.env.SOURCE_IP
    }
  },
  headers: {}
}

describe('/scheduled/authorization test', () => {
  it('should happily work', () => {
    const authorization = require('../../../scheduled/authorization')
    return authorization.run(validEvent, validContext)
      .then((response) => {
        expect(response).to.be.a('object')
        expect(response.statusCode).to.equal(200)
      })
  })
})
