'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const validate = require('../../lib/validate');


describe('validate.ip test',() => {

    it('no ip should return error', (done) => {
        const result = validate.ip(null);
        expect(result).to.be.an.instanceOf(Error).with.property('message', "No IP Address included in the request");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();
    });

    it('invalid ip should return error', (done) => {
        const result = validate.ip("100.200.300.400");
        expect(result).to.be.an.instanceOf(Error).with.property('message', "Invalid IP Address included in the request: 100.200.300.400");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();
    });

    it('valid invocation ipv4', (done) => {
        const result = validate.ip(process.env.IPV4_IP);
        expect(result).to.equal(null);
        done();
    });

    it('valid invocation ipv6', (done) => {
        const result = validate.ip(process.env.IPV6_IP);
        expect(result).to.equal(null);
        done();
    });

});



describe('validate.key test',() => {

    it('no key should return error', (done) => {
        const result = validate.key(null);
        expect(result).to.be.an.instanceOf(Error).with.property('message', "No API Key included in the request");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();
    });

    it('invalid key should return error', (done) => {
        const result = validate.key("12345");
        expect(result).to.be.an.instanceOf(Error).with.property('message', "Invalid API Key included in the request: 12345");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();
    });

    it('valid invocation', (done) => {
        const result = validate.key(process.env.VALID_KEY);
        expect(result).to.equal(null);
        done();
    });

});
