'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const authorize = require('../../lib/authorize');

describe('authorize.key test',() => {

    it('no key should return error (callback)', (done) => {
        authorize.key(null, function (err) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: null");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 401);
            done();
        });
    });

    it('empty key should return error (callback)', (done) => {
        authorize.key("", function (err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: ");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 401);
            done();
        });
    });

    it('invalid key (not a uuid) should return error (callback)', (done) => {
        authorize.key("foox", function (err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: foox");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 401);
            done();
        });
    });

    it('invalid key (valid uuid not in redis) should return error (callback)', (done) => {
        authorize.key("c0ee3250-6a73-11e9-9ee1-f528bffeceb5", function (err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: c0ee3250-6a73-11e9-9ee1-f528bffeceb5");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 401);
            done();
        });
    });

    it('unauthorized key (valid uuid in redis with authorized == false) should return error (callback)', (done) => {
        authorize.key(process.env.SUSPENDED_KEY, function (err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue.");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 403);
            done();
        });
    });

    it('valid invocation', (done) => {
        authorize.key(process.env.VALID_KEY, function (err, data) {
            expect(err).to.equal(null);
            done();
        });
    });

});


