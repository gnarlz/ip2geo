'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const requestCounter = require('../../lib/requestCounter');

describe('requestCounter.increment test',() => {
    it('null key should return null', () => {
        return requestCounter.increment()
            .then((data) => {
                expect(data).to.be.undefined;
            })
    });
    it('empty key should return null', () => {
        return requestCounter.increment('')
            .then((data) => {
                expect(data).to.be.undefined;
            })
    });
    it('valid key should return null', () => {
        return requestCounter.increment(process.env.VALID_KEY)
            .then((data) => {
                expect(data).to.be.undefined;
            })
    });
});


