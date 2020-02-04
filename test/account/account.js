'use strict'

const expect  = require("chai").expect;
const account = require('../../account/account');
const uuidv4 = require('uuid/v4');


describe('account.create test',() => {


    it('empty subscription_id should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: '',
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            //console.log("account create test - JSON.stringify(data): " + JSON.stringify(data));
            // {"headers":{"Access-Control-Allow-Origin":"*"},"statusCode":500,"body":"{\"error\":\"Error: null or empty subscription_id\"}"}
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty subscription_id");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('null subscription_id should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            // subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty subscription_id");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });






    it('empty stripeEmail should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: '',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            //console.log("account create test - JSON.stringify(data): " + JSON.stringify(data));
            // {"headers":{"Access-Control-Allow-Origin":"*"},"statusCode":500,"body":"{\"error\":\"Error: null or empty subscription_id\"}"}
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty stripeEmail");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('null stripeEmail should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            //stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty stripeEmail");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });





    it('empty planID should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: '',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            //console.log("account create test - JSON.stringify(data): " + JSON.stringify(data));
            // {"headers":{"Access-Control-Allow-Origin":"*"},"statusCode":500,"body":"{\"error\":\"Error: null or empty subscription_id\"}"}
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty planID");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('null planID should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            //planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty planID");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });




    it('empty plan_name should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: '',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            //console.log("account create test - JSON.stringify(data): " + JSON.stringify(data));
            // {"headers":{"Access-Control-Allow-Origin":"*"},"statusCode":500,"body":"{\"error\":\"Error: null or empty subscription_id\"}"}
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty plan_name");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('null plan_name should return error with code 400', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            //plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "null or empty plan_name");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });





    it('valid invocation - account should be created', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        };
        account.create(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(200);
            done();
        });
    }).timeout(10000); // DAMN THAT S3 ACCESS IS SLOW

});


