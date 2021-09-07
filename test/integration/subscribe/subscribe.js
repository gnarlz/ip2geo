'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const subscribe = require('../../subscribe/subscribe');
const uuidv4 = require('uuid/v4');
//const { v4: uuidv4 } = require('uuid')


describe('subscribe.subscribe test',() => {

    it('subscribe.mvp null event.body should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            //body: "",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp empty event.body should return error page redirect', () => {
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
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp null planName should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp empty planName should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp null stripeToken should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=mvp_001&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp empty stripeToken should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=mvp_001&stripeToken=&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp null stripeEmail should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);

    it('subscribe.mvp empty stripeEmail should return error page redirect', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/error.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);


    it('subscribe.mvp successful invocation', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            body: "plan_name=mvp_001&stripeToken=tok_visa&stripeTokenType=card&stripeEmail=mvp-test%40ip2geo.co",
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        return subscribe.mvp(event, context)
            .then((data) => {
                console.log("data: " + JSON.stringify(data));
                expect(data.statusCode).to.equal(301);
                expect(data.headers.Location).to.equal("https://www.ip2geo.co/subscribed.html");
            })
            .catch((error) => {
                console.log("error: " + error);
            })
    }).timeout(10000);




});


