'use strict'

/* eslint-env mocha */
const expect = require('chai').expect

const http = require('http-codes')
const validate = require('../../../lib/validate')

describe('lib/validate test', () => {
  it('validate.ip should return null for valid ip passed', () => {
    return validate.ip('192.60.125.77')
      .then((result) => { expect(result).to.be.a('null') })
  })
  it('validate.ip should throw for no ip passed', () => {
    return validate.ip()
      .catch((error) => {
        expect(error.message).to.contain('No IP address included in the request')
        expect(error.code).to.equal(http.BAD_REQUEST)
      })
  })
  it('validate.ip should throw for invalid ip passed', () => {
    return validate.ip('200.300.400.500')
      .catch((error) => {
        expect(error.message).to.contain('Invalid IP address included in the request')
        expect(error.code).to.equal(http.BAD_REQUEST)
      })
  })

  it('validate.key should return null for valid key passed', () => {
    return validate.key('3ad9fbb4-7635-43bf-a87b-b3cac1809e58')
      .then((result) => { expect(result).to.be.a('null') })
  })
  it('validate.key should throw for no key passed', () => {
    return validate.key()
      .catch((error) => {
        expect(error.message).to.contain('No API key included in the request')
        expect(error.code).to.equal(http.BAD_REQUEST)
      })
  })
  it('validate.key should throw for invalid key passed', () => {
    return validate.key('foo')
      .catch((error) => {
        expect(error.message).to.contain('Invalid API key included in the request')
        expect(error.code).to.equal(http.BAD_REQUEST)
      })
  })
})
