'use strict'

const expect  = require("chai").expect;
const subscribe = require('../../subscribe/subscribe');
const uuidv4 = require('uuid/v4');


describe('subscribe.subscribe test',() => {

    it('subscribe.mvp successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // "body":"plan_name=mvp_001&stripeToken=tok_1G6wBhHBCttsueh1spS3nd4S&stripeTokenType=card&stripeEmail=166%40telematic.io"
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40telematic.io",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/subscribed.html");
            done();
        });
    }).timeout(5000);  // stripe is kinda slow

    it('subscribe.bootstrap successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=bootstrap_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=bootstrap-test%40telematic.io",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.bootstrap(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/subscribed.html");
            done();
        });
    }).timeout(5000);  // stripe is kinda slow


    it('subscribe.startup successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=startup_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=startup-test%40telematic.io",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.startup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/subscribed.html");
            done();
        });
    }).timeout(5000);  // stripe is kinda slow

    it('subscribe.growth successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=growth_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=growth-test%40telematic.io",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.growth(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/subscribed.html");
            done();
        });
    }).timeout(5000);  // stripe is kinda slow

});


