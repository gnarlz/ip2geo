'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const authorize = require('../../lib/authorize');

describe('authorize.key test',() => {

        it('null key should return error', () => {
            return authorize.key()
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: undefined");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 401);
                })
        });

        it('empty key should return error', () => {
            return authorize.key("")
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: ");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 401);
                })
        });

        it('invalid key should return error', () => {
            return authorize.key("abc123")
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "API Key is unrecognized: abc123");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 401);
                })
        });

        it('revoked key should return error', () => {
            return authorize.key(process.env.REVOKED_KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been revoked due to abuse. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('exceeded plan limit key should return error', () => {
            return authorize.key(process.env.EXCEEDED_PLAN_LIMIT_KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('exceeded rate limit key should return error', () => {
            return authorize.key(process.env.EXCEEDED_RATE_LIMIT_KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because you have exceeded the rate limit. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('payment past due key should return error', () => {
            return authorize.key(process.env.PAYMENT_PAST_DUE__KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because your account payment is past due. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('account terminiated key should return error', () => {
            return authorize.key(process.env.ACCOUNT_TERMINATED__KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because your account has been terminated. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('free trial expired key should return error', () => {
            return authorize.key(process.env.FREE_TRIAL_ENDED_KEY)
                .catch((error) =>{
                    expect(error).to.be.an.instanceOf(Error).with.property('message', "Your API key has been suspended because your free trial has ended. Please contact support@ip2geo.co to resolve this issue.");
                    expect(error).to.be.an.instanceOf(Error).with.property('code', 403);
                })
        });

        it('valid key should return data with property "authorized" = true', () => {
            return authorize.key(process.env.VALID_KEY)
                .then((data) => {
                    // {"authorized":true, "message":"Account creation", "ts":"2019-11-22 11:13:29.607000", "ratelimit_max":60,"ratelimit_duration":60000}
                    expect(data).to.have.property("authorized").to.equal(true);
                })
        });

});


