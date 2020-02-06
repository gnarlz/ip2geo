'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const subscribe = require('../../subscribe/subscribe');
const uuidv4 = require('uuid/v4');


describe('subscribe.subscribe test',() => {

    it('subscribe.mvp null event.body should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });

    it('subscribe.mvp empty event.body should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });




    it('subscribe.mvp null plan_name should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });
    it('subscribe.mvp empty plan_name should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });


    it('subscribe.mvp null stripeToken should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=mvp_001&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });
    it('subscribe.mvp empty stripeToken should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=mvp_001&stripeToken=&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });






    it('subscribe.mvp null stripeEmail should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });
    it('subscribe.mvp empty stripeEmail should return error page redirect', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        subscribe.mvp(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(301);
            expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            done();
        });
    });




    it('subscribe.mvp successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // "body":"plan_name=mvp_001&stripeToken=tok_1G6wBhHBCttsueh1spS3nd4S&stripeTokenType=card&stripeEmail=166%40telematic.io"
           // body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
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
    }).timeout(10000);  // 3 stripe calls + 2 S3 calls === slow




    // following tests are un needed - no real difference between subscribe.mvp and the other subscription plans
    /*
    it('subscribe.bootstrap successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=bootstrap_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=bootstrap-test%40ip2geo.co",
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
    }).timeout(10000);  // stripe is kinda slow


    it('subscribe.startup successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=startup_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=startup-test%40ip2geo.co",
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
    }).timeout(10000);  // stripe is kinda slow

    it('subscribe.growth successful invocation', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=growth_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=growth-test%40ip2geo.co",
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
    }).timeout(10000);  // stripe is kinda slow

     */





});


