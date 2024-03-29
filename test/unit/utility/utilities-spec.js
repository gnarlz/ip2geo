'use strict'

/* eslint-env mocha */
const expect = require('chai').expect

const utilities = require('../../../utility/utilities')

describe('utility/utilities test', () => {
  it('isnumeric() should return true for a number', () => {
    expect(utilities.isnumeric(9)).to.equal(true)
  })
  it('isnumeric() should return false for a string', () => {
    expect(utilities.isnumeric('foo')).to.equal(false)
  })
})
