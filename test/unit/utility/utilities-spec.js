'use strict'

const expect  = require("chai").expect
const utilities = require('../../../utility/utilities')

describe('utilities test',() => {
    it('isnumeric() should return true for a number', () => {
        expect(utilities.isnumeric(9)).to.be.true
    })
    it('isnumeric() should return false for a string', () => {
        expect(utilities.isnumeric('foo')).to.be.false
    })
})