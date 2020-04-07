'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const validate = require('../../lib/validate');

/*
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
 */


describe('validate.ip test', () => {
    it('no ip should return error', () => {
        return validate.ip(null)
            .catch( (error) =>{
                expect(error).to.be.an.instanceOf(Error).with.property('message', "No IP Address included in the request");
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid ip should return error', () => {
        return validate.ip("100.200.300.400")
            .catch( (error) =>{
                expect(error).to.be.an.instanceOf(Error).with.property('message', "Invalid IP Address included in the request: 100.200.300.400");
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('valid invocation ipv4', () => {
        return validate.ip(process.env.IPV4_IP)
            .then((data) => {
                expect(data).to.equal(null);
            })
    });
    it('valid invocation ipv6', () => {
        return validate.ip(process.env.IPV6_IP)
            .then((data) => {
                expect(data).to.equal(null);
            })
    });
});



describe('validate.key test', () => {
    it('no key should return error', () => {
        return validate.key(null)
            .catch( (error) =>{
                expect(error).to.be.an.instanceOf(Error).with.property('message', "No API Key included in the request");
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid key should return error', () => {
        return validate.key("foo")
            .catch( (error) =>{
                expect(error).to.be.an.instanceOf(Error).with.property('message', "Invalid API Key included in the request: foo");
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('valid key should return null', () => {
        return validate.key(process.env.VALID_KEY)
            .then((data) => {
                expect(data).to.equal(null);
            })
    });
});


/*
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
 */
