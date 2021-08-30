'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const assert  = require("chai").assert;
const ip = require('../../../lib/ip');


describe('ip.numeric test',() => {

    it('null ip should return error', (done) => {
        const result = ip.numeric(null);
        expect(result).to.be.an.instanceOf(Error).with.property('message', "Invalid IP Address included in the request: null");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();

    });

    it('invalid ipv4 should return error', (done) => {
        const result = ip.numeric("333.333.333.333");
        expect(result).to.be.an.instanceOf(Error).with.property('message', "Invalid IP Address included in the request: 333.333.333.333");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();

    });

    it('invalid ipv6 should return error', (done) => {
        const result = ip.numeric("2001:200:1c0:2000:0:0:0:X");
        expect(result).to.be.an.instanceOf(Error).with.property('message', "Invalid IP Address included in the request: 2001:200:1c0:2000:0:0:0:X");
        expect(result).to.be.an.instanceOf(Error).with.property('code', 400);
        done();

    });

    it('valid ipv4 ip should return correct value', (done) => {
        assert.equal(ip.numeric(process.env.IPV4_IP), '2300265801');
        done();

    });

    it('valid ipv6 ip should return correct value', (done) => {
        assert.equal(ip.numeric(process.env.IPV6_IP), '42540528727336799946806010018718023680');
        done();
    });

});


